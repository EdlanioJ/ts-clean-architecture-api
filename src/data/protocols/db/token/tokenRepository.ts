import { TokenModel } from './token';

export interface AddTokenParams {
  token: string;
  user_id: string;
}

export interface TokenRepository {
  save: (params: AddTokenParams) => Promise<TokenModel>;
}
