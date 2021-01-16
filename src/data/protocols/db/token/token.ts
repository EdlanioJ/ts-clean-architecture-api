import { UserModel } from '../user/user';

export type TokenModel = {
  id: number;
  token: string;
  user: UserModel;
  created_at: Date;
};
