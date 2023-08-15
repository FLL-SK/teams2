import { hash, compare } from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  //Hash the password with a salt round of 10, the higher the rounds the more secure, but the slower
  //your application becomes.
  return await hash(password || '', 10);
};

export const compareHash = async (
  password: string,
  hash: string
): Promise<boolean> => {
  //Compare the password with the hash stored in the database
  return await compare(password, hash);
};
