import { userRepository } from '../../models';
import { users } from './data/users.json'

export async function preSeedUsers() {
  for (const user of users) {
    await userRepository.findOneAndUpdate(
      { username: user.username },
      {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`
      },
      {
        upsert: true
      }
    );
  }
}



export async function preSeed() {
  await preSeedUsers();
}
