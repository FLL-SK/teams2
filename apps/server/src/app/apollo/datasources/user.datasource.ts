import { BaseDataSource } from './_base.datasource';
import { UserData, userRepository } from '../../models';
import { UpdateUserInput, UserPayload, User, UserFilterInput } from '../../_generated/graphql';
import { UserMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import Dataloader from 'dataloader';
import { logger } from '@teams2/logger';
import {
  emailUserAcceptedGdprToAdmin,
  emailUsernameChanged,
  emailUserRejectedGdprToAdmin,
} from '../../utils/emails';

const logBase = logger('DS:User');

export class UserDataSource extends BaseDataSource {
  private loader: Dataloader<string, User, string>;

  protected override _initialize() {
    this.loader = new Dataloader(this.loaderFn.bind(this));
  }

  private async loaderFn(ids: string[]): Promise<User[]> {
    const oids = ids.map((id) => new ObjectId(id));
    const rec = await userRepository.find({ _id: { $in: ids } }).exec();
    const data = oids.map((id) => rec.find((e) => e._id.equals(id)) ?? null);
    return data.map(UserMapper.toUser.bind(this));
  }

  async getUser(id?: ObjectId): Promise<User> {
    if (!id) return null;
    const log = logBase.extend('getUser');
    log.debug('id: %s', id);
    const u = await this.loader.load(id.toString());
    return u;
  }

  async getUsers(filter: UserFilterInput): Promise<User[]> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Get users');

    const q: FilterQuery<UserData> = {};
    if (filter) {
      const { includeInactive } = filter;

      if (!includeInactive) {
        q.deletedOn = null;
      }
    }
    const users = await userRepository.find(q).sort({ username: 1 }).lean().exec();
    return users.map(UserMapper.toUser);
  }

  async updateUser(id: ObjectId, input: UpdateUserInput): Promise<UserPayload> {
    this.userGuard.isAdmin() ||
      this.userGuard.isSelf(id) ||
      this.userGuard.notAuthorized('Update user');

    const u: Partial<UserData> = {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    };

    const user = await userRepository.findById(id).lean().exec();

    if (input.gdprAccepted && !user.gdprAcceptedOn) {
      u.gdprAcceptedOn = new Date();
      u.gdprDeclinedOn = null;
    }
    if (input.username && input.usernameOverride) {
      u.username = input.username;
    }

    const user = await userRepository.findById(id).lean().exec();

    const nu = await userRepository.findOneAndUpdate({ _id: id }, u, { new: true }).lean().exec();

    if (input.gdprAccepted && !user.gdprAcceptedOn) {
      emailUserAcceptedGdprToAdmin(nu.username);
    }
    if (nu) {
      emailUsernameChanged(user.username, nu.username, this.userGuard.userName, nu._id);
    }

    return { user: UserMapper.toUser(nu) };
  }

  async deleteUser(id: ObjectId): Promise<User> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Delete user');
    const u = await userRepository
      .findByIdAndUpdate(
        id,
        { deletedOn: new Date(), deletedBy: this.context.user._id },
        { new: true },
      )
      .lean()
      .exec();
    return UserMapper.toUser(u);
  }

  async undeleteUser(id: ObjectId): Promise<User> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Undelete user');
    const u = await userRepository
      .findByIdAndUpdate(id, { $unset: { deletedOn: null, deletedBy: null } }, { new: true })
      .lean()
      .exec();
    return UserMapper.toUser(u);
  }

  async changePassword(id: ObjectId, password: string): Promise<User> {
    this.userGuard.isAdmin() ||
      this.userGuard.isSelf(id) ||
      this.userGuard.notAuthorized('Change password');
    const u = await userRepository.findByIdAndUpdate(id, { password }).lean().exec();
    return UserMapper.toUser(u);
  }

  async setAdmin(id: ObjectId, isAdmin: boolean): Promise<User> {
    this.userGuard.isSuperAdmin() || this.userGuard.notAuthorized('Set admin');
    const u = await userRepository.findByIdAndUpdate(id, { isAdmin }).lean().exec();
    return UserMapper.toUser(u);
  }

  async declineGdpr(id: ObjectId): Promise<User> {
    this.userGuard.isSelf(id) || this.userGuard.notAuthorized('Decline GDPR');
    const u = await userRepository
      .findOneAndUpdate(
        { _id: id, gdprDeclinedOn: null },
        { gdprDeclinedOn: new Date() },
        { new: true },
      )
      .lean()
      .exec();
    emailUserRejectedGdprToAdmin(u.username);
    return UserMapper.toUser(u);
  }
}
