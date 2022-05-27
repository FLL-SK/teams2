import { User } from '../../generated/graphql';
import { UserData } from '../../models';

export const UserMapper = {
  toUser(user: UserData | null | undefined): User | null {
    if (!user) {
      return null;
    }
    const u: Omit<Required<User>, '__typename'> = {
      id: user._id,
      name: user.name,
      username: user.username,
      phoneNumber: user.phoneNumber,
      deletedOn: user.deletedOn,
      deletedBy: user.deletedBy,
      isAdmin: user.isAdmin,
      coachingTeams: [],
      managingEvents: [],
    };
    return u;
  },
};
