import { User } from '../../_generated/graphql';
import { UserData } from '../../models';

export const UserMapper = {
  toUser(user: Omit<UserData, 'password'> | null | undefined): User | null {
    if (!user) {
      return null;
    }
    const u: Omit<Required<User>, '__typename'> = {
      id: user._id,
      username: user.username,
      phone: user.phone ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',

      createdOn: user.createdOn,
      deletedOn: user.deletedOn,
      deletedBy: user.deletedBy,
      lastLoginOn: user.lastLoginOn,
      gdprAcceptedOn: user.gdprAcceptedOn,

      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,

      coachingTeams: [],
      managingEvents: [],
      managingPrograms: [],
    };
    return u;
  },

  /** používateľ bez kontaktných údajov – pre toho, kto nemá právo ich vidieť (#289) */
  toPublicUser(user: User | null | undefined): User | null {
    if (!user) {
      return null;
    }
    return {
      ...user,
      username: '',
      phone: '',
      isAdmin: null,
      isSuperAdmin: null,
      lastLoginOn: null,
      gdprAcceptedOn: null,
      deletedBy: null,
    };
  },
};
