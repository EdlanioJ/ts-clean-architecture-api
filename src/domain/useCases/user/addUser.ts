import { UserModel } from '@/domain/models/user/user';

export interface AddUser {
  add: () => Promise<AddUser.Result>;
}

export namespace AddUser {
  export type Params = Omit<
    UserModel,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'dataVersion'
  >;

  export type Result = UserModel;
}
