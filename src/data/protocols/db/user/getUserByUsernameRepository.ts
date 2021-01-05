import { UserModel } from './user';

export interface GetUserByUsernameRepository {
  getByUsername: (username: string) => Promise<UserModel | undefined>;
}
