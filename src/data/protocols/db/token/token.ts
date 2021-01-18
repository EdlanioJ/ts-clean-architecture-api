import { UserModel } from '../user/user';

export type TokenModel = {
  id: number;
  token: string;
  created_at: Date;
  user: string;
};
