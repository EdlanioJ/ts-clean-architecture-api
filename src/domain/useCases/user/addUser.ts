import { UserModel } from '@/domain/models/user/user';

export interface AddUser {
  add: (params: AddUser.Params) => Promise<AddUser.Result>;
}

export namespace AddUser {
  export type Params = Pick<
    UserModel,
    'email' | 'name' | 'password' | 'username'
  >;

  export type Result = UserModel;
}
