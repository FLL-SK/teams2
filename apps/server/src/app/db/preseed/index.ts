import { userRepository } from '../../models';
import { hashPassword } from '../../utils/hash-password';
import { users } from './data/users.json';

export async function preSeedUsers() {
  for (const user of users) {
    await userRepository.findOneAndUpdate(
      { username: user.username },
      {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        password: await hashPassword(user.password),
      },
      {
        upsert: true,
      }
    );
  }
}

export async function preSeed() {
  await preSeedUsers();
}
