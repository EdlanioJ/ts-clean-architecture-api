import { TokenModel } from '@/data/protocols/db/token/token';
import {
  TokenRepository,
  AddTokenParams,
} from '@/data/protocols/db/token/tokenRepository';

import { mockAddTokenParams } from './mockAddTokenParams';
import { mockTokenModel } from './mockTokenModel';

export class TokenRepositorySpy implements TokenRepository {
  saveParams = mockAddTokenParams();

  tokenModel = mockTokenModel();

  async save(params: AddTokenParams): Promise<TokenModel> {
    this.saveParams = params;

    return this.tokenModel;
  }

  simulateThrowError() {
    jest
      .spyOn(TokenRepositorySpy.prototype, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
