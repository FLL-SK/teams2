import { DataSourceConfig } from 'apollo-datasource';

import { ApolloContext } from '../graphql/apollo-context';

//import { logger } from '@teams2/logger';

//const logModule = logger('UserDS');

import { BaseDataSource } from './_base.datasource';
import { UserData, userRepository } from '../models';
import { CreateUserInput, CreateUserPayload, User } from '../generated/graphql';
import { UserMapper } from '../graphql/mappers';
import { ObjectId } from 'mongodb';

export class UserDataSource extends BaseDataSource {
  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getUser(id: ObjectId): Promise<User> {
    return UserMapper.toUser(await userRepository.findById(id));
  }

  async getUserByUsername(username?: string): Promise<User> {
    return UserMapper.toUser(await userRepository.findOne({ username }));
  }

  async createUser(input: CreateUserInput): Promise<CreateUserPayload> {
    const u: UserData = input;
    const nu = await userRepository.create(u);
    return { user: UserMapper.toUser(nu) };
  }

  async deleteUser(id: ObjectId): Promise<User> {
    const u = await userRepository.findByIdAndDelete(id).lean().exec();
    return UserMapper.toUser(u);
  }

  static async getUserByUsername(username: string): Promise<User> {
    const u = await userRepository.findByUsername(username);
    return UserMapper.toUser(u);
  }
}
