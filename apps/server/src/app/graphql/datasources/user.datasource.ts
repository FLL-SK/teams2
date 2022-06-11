import { DataSourceConfig } from 'apollo-datasource';

import { ApolloContext } from '../apollo-context';

import { BaseDataSource } from './_base.datasource';
import { UserData, userRepository } from '../../models';
import {
  CreateUserInput,
  CreateUserPayload,
  UpdateUserInput,
  UpdateUserPayload,
  User,
  UserFilterInput,
} from '../../generated/graphql';
import { UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';

export class UserDataSource extends BaseDataSource {
  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getUser(id: ObjectId): Promise<User> {
    return UserMapper.toUser(await userRepository.findById(id).lean().exec());
  }

  async getUsers(filter: UserFilterInput): Promise<User[]> {
    const { isActive } = filter;
    const q: FilterQuery<UserData> = {};
    if (isActive) {
      q.deletedOn = null;
    }
    const users = await userRepository.find(q).lean().exec();
    return users.map(UserMapper.toUser);
  }

  async getUserByUsername(username?: string): Promise<User> {
    return UserMapper.toUser(await userRepository.findOne({ username }).lean().exec());
  }

  async createUser(input: CreateUserInput): Promise<CreateUserPayload> {
    const u: UserData = input;
    const nu = await userRepository.create(u);
    return { user: UserMapper.toUser(nu) };
  }

  async updateUser(id: ObjectId, input: UpdateUserInput): Promise<UpdateUserPayload> {
    const u: Partial<UserData> = input;
    const nu = await userRepository.findOneAndUpdate({ _id: id }, u, { new: true }).lean().exec();
    return { user: UserMapper.toUser(nu) };
  }

  async deleteUser(id: ObjectId): Promise<User> {
    const u = await userRepository.findByIdAndDelete(id).lean().exec();
    return UserMapper.toUser(u);
  }

  async changePassword(id: ObjectId, password: string): Promise<User> {
    const u = await userRepository.findByIdAndUpdate(id, { password }).lean().exec();
    return UserMapper.toUser(u);
  }

  static async getUserByUsername(username: string): Promise<User> {
    const u = await userRepository.findByUsername(username);
    return UserMapper.toUser(u);
  }
}
