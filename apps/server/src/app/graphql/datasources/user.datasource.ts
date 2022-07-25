import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { UserData, userRepository } from '../../models';
import { UpdateUserInput, UpdateUserPayload, User, UserFilterInput } from '../../generated/graphql';
import { UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import * as Dataloader from 'dataloader';

export class UserDataSource extends BaseDataSource {
  private loader: Dataloader<string, User, string>;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<User[]> {
    const data = await userRepository.find({ _id: { $in: ids } }).exec();
    return data.map(UserMapper.toUser.bind(this));
  }

  async getUser(id: ObjectId): Promise<User> {
    return this.loader.load(id.toString());
  }

  async getUsers(filter: UserFilterInput): Promise<User[]> {
    this.userGuard.isAdmin() || this.userGuard.failed();

    const q: FilterQuery<UserData> = {};
    if (filter) {
      const { isActive } = filter;

      if (isActive) {
        q.deletedOn = null;
      }
    }
    const users = await userRepository.find(q).sort({ username: 1 }).lean().exec();
    return users.map(UserMapper.toUser);
  }

  async getUserByUsername(username?: string): Promise<User> {
    return UserMapper.toUser(await userRepository.findOne({ username }).lean().exec());
  }

  async updateUser(id: ObjectId, input: UpdateUserInput): Promise<UpdateUserPayload> {
    this.userGuard.isAdmin() || this.userGuard.isSelf(id) || this.userGuard.failed();

    const u: Partial<UserData> = input;
    const nu = await userRepository.findOneAndUpdate({ _id: id }, u, { new: true }).lean().exec();
    return { user: UserMapper.toUser(nu) };
  }

  async deleteUser(id: ObjectId): Promise<User> {
    this.userGuard.isAdmin() || this.userGuard.failed();

    const u = await userRepository.findByIdAndDelete(id).lean().exec();
    return UserMapper.toUser(u);
  }

  async changePassword(id: ObjectId, password: string): Promise<User> {
    this.userGuard.isAdmin() || this.userGuard.isSelf(id) || this.userGuard.failed();

    const u = await userRepository.findByIdAndUpdate(id, { password }).lean().exec();
    return UserMapper.toUser(u);
  }

  static async getUserByUsername(username: string): Promise<User> {
    const u = await userRepository.findByUsername(username);
    return UserMapper.toUser(u);
  }

  async setAdmin(id: ObjectId, isAdmin: boolean): Promise<User> {
    this.userGuard.isSuperAdmin() || this.userGuard.failed();

    //TODO: authorized?
    const u = await userRepository.findByIdAndUpdate(id, { isAdmin }).lean().exec();
    return UserMapper.toUser(u);
  }
}
