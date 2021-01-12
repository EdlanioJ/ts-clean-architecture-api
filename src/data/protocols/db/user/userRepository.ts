import { UserModel } from './user';

export interface AddUserRepositoryParams {
  id: string;
  email: string;
  name: string;
  password: string;
  username: string;
}

export interface UserRepository {
  save: (params: AddUserRepositoryParams) => Promise<UserModel>;
  getByEmail: (email: string) => Promise<UserModel | undefined>;
  getByUsername: (username: string) => Promise<UserModel | undefined>;
}
