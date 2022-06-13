import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { ObjectId } from 'mongodb';
import {
  eventRepository,
  ProgramData,
  ProgramDocument,
  programRepository,
  userRepository,
} from '../../models';
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
  InvoiceItemInput,
} from '../../generated/graphql';
import { EventMapper, UserMapper } from '../mappers';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class ProgramDataSource extends BaseDataSource {
  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getProgram(id: ObjectId): Promise<Program> {
    return ProgramMapper.toProgram(await programRepository.findById(id).exec());
  }

  async getPrograms(filter?: ProgramFilterInput): Promise<Program[]> {
    const programs = await programRepository.findPrograms(filter ?? {});
    return programs.map(ProgramMapper.toProgram);
  }

  async createProgram(input: CreateProgramInput): Promise<CreateProgramPayload> {
    const u: ProgramData = { ...input, managersIds: [], invoiceItems: [] };
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
    return users.map(UserMapper.toUser);
  }

  async getProgramEvents(programId: ObjectId): Promise<Event[]> {
    const program = await programRepository.findById(programId).exec();
    if (!program) {
      throw new Error('Program not found');
    }

    const events = await eventRepository.findEventsForProgram(programId);
    return events.map(EventMapper.toEvent);
  }

  async updateProgramInvoiceItems(
    programId: ObjectId,
    items: InvoiceItemInput[]
  ): Promise<Program> {
    const program = await programRepository
      .findOneAndUpdate({ _id: programId }, { invoiceItems: items }, { new: true })
      .exec();
    return ProgramMapper.toProgram(program);
  }
}
