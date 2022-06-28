import { User } from '../../generated/graphql';
import { UserData } from '../../models';

export const UserMapper = {
  toUser(user: UserData | null | undefined): User | null {
    if (!user) {
      return null;
    }
    const u: Omit<Required<User>, '__typename'> = {
      id: user._id,
      name: user.name ?? '',
      username: user.username,
      phone: user.phone ?? '',
      deletedOn: user.deletedOn,
      deletedBy: user.deletedBy,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      coachingTeams: [],
      managingEvents: [],
      managingPrograms: [],
    };
    return u;
  },
};
