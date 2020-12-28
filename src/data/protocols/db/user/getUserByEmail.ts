import { UserModel } from './user';

export interface GetUserByEmailRepository {
  getByEmail: (email: string) => Promise<UserModel>;
}
