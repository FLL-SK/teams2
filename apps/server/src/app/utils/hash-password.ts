import { hash } from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  //Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
  //your application becomes.
  return await hash(password || '', 10);
};
