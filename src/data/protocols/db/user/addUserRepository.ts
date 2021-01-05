import { UserModel } from './user';

export interface AddUserRepositoryParams {
  id: string;
  email: string;
  name: string;
  password: string;
  username: string;
}
export interface AddUserRepository {
  save: (params: AddUserRepositoryParams) => Promise<UserModel>;
}
