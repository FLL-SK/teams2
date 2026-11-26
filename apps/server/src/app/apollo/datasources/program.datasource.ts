import { BaseDataSource } from './_base.datasource';
import { fireAndForget } from '../../utils/fire-and-forget';
import { ObjectId } from 'mongodb';
import {
  eventRepository,
  ProgramData,
  programRepository,
  registrationRepository,
  userRepository,
} from '../../models';
import { ProgramMapper } from '../mappers/program.mapper';
import {
  CreateProgramInput,
  ProgramPayload,
  Program,
  UpdateProgramInput,
  User,
  Event,
  ProgramFilterInput,
} from '../../_generated/graphql';
import { EventMapper, UserMapper } from '../mappers';
import { UpdateQuery } from 'mongoose';
import { logger } from '@teams2/logger';
import Dataloader from 'dataloader';
import { emailProgramManagerAdded } from '../../utils/emails';

const logBase = logger('DS:Program');

export class ProgramDataSource extends BaseDataSource {
  declare private loader: Dataloader<string, Program, string>;

  protected override _initialize() {
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Program[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await programRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) ?? null);
    return data.map(ProgramMapper.toProgram.bind(this));
  }

  async getProgram(id: ObjectId): Promise<Program> {
    if (!id) return null;
    const log = logBase.extend('getP');
    log.debug('id=%s', id);
    const program = this.loader.load(id.toString());
    log.debug('id=%s done %o', id, program);
    return program;
  }

  async getPrograms(filter?: ProgramFilterInput): Promise<Program[]> {
    const log = logBase.extend('getPrgs');
    log.debug('getting prgs');
    const programs = await programRepository.findPrograms(filter ?? {});
    log.debug('getting prgs - done');
    return programs.map(ProgramMapper.toProgram);
  }

  async createProgram(input: CreateProgramInput): Promise<ProgramPayload> {
    await this.userGuard.require('Create program', this.userGuard.isAdmin());

    const u: ProgramData = {
      ...input,
      managersIds: [],
      teamRegSequence: 1,
      regTypesAllowed: input.regTypesAllowed ?? ['NORMAL'],
    };
    const nu = await programRepository.create(u);
    return { program: ProgramMapper.toProgram(nu) };
  }

  async updateProgram(id: ObjectId, input: UpdateProgramInput): Promise<ProgramPayload> {
    await this.userGuard.require('Update program', this.userGuard.isAdmin());

    const u: Partial<ProgramData> = input;
    const nu = await programRepository.findByIdAndUpdate(id, u, { returnDocument: 'after' }).exec();
    return { program: ProgramMapper.toProgram(nu) };
  }

  async deleteProgram(id: ObjectId): Promise<Program> {
    await this.userGuard.require('Delete program', this.userGuard.isAdmin());

    // soft delete (#285) – natvrdo zmazaný program nechal osirelé turnaje, registrácie a súbory
    const active = await registrationRepository.exists({ programId: id, canceledOn: null });
    if (active) {
      throw new Error('Program má aktívne registrácie, nedá sa zmazať.');
    }
    const u = await programRepository
      .findByIdAndUpdate(
        id,
        { deletedOn: new Date(), deletedBy: this.userGuard.userId },
        { returnDocument: 'after' },
      )
      .exec();
    return ProgramMapper.toProgram(u);
  }

  async undeleteProgram(id: ObjectId): Promise<Program> {
    await this.userGuard.require('Undelete program', this.userGuard.isAdmin());

    const u = await programRepository
      .findByIdAndUpdate(
        id,
        { $unset: { deletedOn: null, deletedBy: null } },
        { returnDocument: 'after' },
      )
      .exec();
    return ProgramMapper.toProgram(u);
  }

  async getProgramsManagedBy(managerId: ObjectId): Promise<Program[]> {
    await this.userGuard.require(
      'Get programs managed by',
      this.userGuard.isAdmin(),
      this.userGuard.isSelf(managerId),
    );

    const programs = await programRepository.findProgramsManagedByUser(managerId);
    return programs.map((t) => ProgramMapper.toProgram(t));
  }

  async addProgramManager(programId: ObjectId, userId: ObjectId): Promise<Program> {
    await this.userGuard.require('Add program manager', this.userGuard.isAdmin());

    const u: UpdateQuery<ProgramData> = { $addToSet: { managersIds: userId } };
    const program = await programRepository
      .findOneAndUpdate({ _id: programId }, u, { returnDocument: 'after' })
      .exec();

    fireAndForget(emailProgramManagerAdded(programId, userId), 'emailProgramManagerAdded'); // send email notification

    return ProgramMapper.toProgram(program);
  }

  async removeProgramManager(programId: ObjectId, userId: ObjectId): Promise<Program> {
    await this.userGuard.require('Remove program manager', this.userGuard.isAdmin());

    const program = await programRepository
      .findOneAndUpdate(
        { _id: programId },
        { $pull: { managersIds: userId } },
        { returnDocument: 'after' },
      )
      .exec();
    return ProgramMapper.toProgram(program);
  }

  async getProgramManagers(programId: ObjectId): Promise<User[]> {
    if (!this.userGuard.isAdmin()) {
      return [];
    }
    const program = await programRepository.findById(programId).exec();
    if (!program) {
      throw new Error('Program not found');
    }
    const users = await Promise.all(
      program.managersIds.map(async (u) => userRepository.findById(u).exec()),
    );
    return users.filter((u) => !!u).map(UserMapper.toUser);
  }

  async getProgramEvents(programId: ObjectId): Promise<Event[]> {
    const program = await programRepository.findById(programId).exec();
    if (!program) {
      throw new Error('Program not found');
    }

    const events = await eventRepository.findEventsForProgram(programId);
    return events.map(EventMapper.toEvent);
  }
}
