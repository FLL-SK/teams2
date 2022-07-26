import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { ObjectId } from 'mongodb';
import { eventRepository, ProgramData, programRepository, userRepository } from '../../models';
import { ProgramMapper } from '../mappers/program.mapper';
import {
  CreateProgramInput,
  CreateProgramPayload,
  Program,
  UpdateProgramInput,
  UpdateProgramPayload,
  User,
  Event,
  ProgramFilterInput,
} from '../../generated/graphql';
import { EventMapper, UserMapper } from '../mappers';
import { UpdateQuery } from 'mongoose';
import { logger } from '@teams2/logger';
import * as Dataloader from 'dataloader';

export class ProgramDataSource extends BaseDataSource {
  private loader: Dataloader<string, Program, string>;
  constructor() {
    super();
    this.logBase = logger('DS:program');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<Program[]> {
    const data = await programRepository.find({ _id: { $in: ids } }).exec();
    return data.map(ProgramMapper.toProgram.bind(this));
  }

  async getProgram(id: ObjectId): Promise<Program> {
    const log = this.logBase.extend('getP');
    log.debug('id=%s', id);
    const program = this.loader.load(id.toString());
    log.debug('id=%s done', id);
    return program;
  }

  async getPrograms(filter?: ProgramFilterInput): Promise<Program[]> {
    const log = this.logBase.extend('getPrgs');
    log.debug('getting prgs');
    const programs = await programRepository.findPrograms(filter ?? {});
    log.debug('getting prgs - done');
    return programs.map(ProgramMapper.toProgram);
  }

  async createProgram(input: CreateProgramInput): Promise<CreateProgramPayload> {
    const u: ProgramData = { ...input, managersIds: [] };
    const nu = await programRepository.create(u);
    return { program: ProgramMapper.toProgram(nu) };
  }

  async updateProgram(id: ObjectId, input: UpdateProgramInput): Promise<UpdateProgramPayload> {
    const u: Partial<ProgramData> = input;
    const nu = await programRepository.findByIdAndUpdate(id, u, { new: true }).exec();
    return { program: ProgramMapper.toProgram(nu) };
  }

  async deleteProgram(id: ObjectId): Promise<Program> {
    const u = await programRepository.findByIdAndDelete(id).exec();
    return ProgramMapper.toProgram(u);
  }

  async getProgramsManagedBy(managerId: ObjectId): Promise<Program[]> {
    const programs = await programRepository.findProgramsManagedByUser(managerId);
    return programs.map((t) => ProgramMapper.toProgram(t));
  }

  async addProgramManager(programId: ObjectId, userId: ObjectId): Promise<Program> {
    const u: UpdateQuery<ProgramData> = { $addToSet: { managersIds: userId } };
    const program = await programRepository
      .findOneAndUpdate({ _id: programId }, u, { new: true })
      .exec();
    return ProgramMapper.toProgram(program);
  }

  async removeProgramManager(programId: ObjectId, userId: ObjectId): Promise<Program> {
    const program = await programRepository
      .findOneAndUpdate({ _id: programId }, { $pull: { managersIds: userId } }, { new: true })
      .exec();
    return ProgramMapper.toProgram(program);
  }

  async getProgramManagers(programId: ObjectId): Promise<User[]> {
    const program = await programRepository.findById(programId).exec();
    if (!program) {
      throw new Error('Program not found');
    }
    const users = await Promise.all(
      program.managersIds.map(async (u) => userRepository.findById(u).exec())
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
