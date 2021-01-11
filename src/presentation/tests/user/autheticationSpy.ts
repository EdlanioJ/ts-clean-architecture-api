import faker from 'faker';

import { Authentication } from '@/domain/useCases/user/authentication';

export class AuthenticationSpy implements Authentication {
  authParams = {};

  authResult = faker.random.uuid();

  async auth(params: Authentication.Params): Promise<Authentication.Result> {
    this.authParams = params;

    return { token: this.authResult };
  }
}
