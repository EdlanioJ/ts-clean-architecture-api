import { UserModel } from '@/domain/models/user/user';

export interface Register {
  add: () => Promise<Register.Result>;
}

export namespace Register {
  export type Params = Omit<
    UserModel,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'dataVersion'
  >;

  export type Result = UserModel;
}
