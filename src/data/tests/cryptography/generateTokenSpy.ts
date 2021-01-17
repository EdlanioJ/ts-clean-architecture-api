import faker from 'faker';

import { GenerateToken } from '@/data/protocols/cryptography/generateToken';

export class GenerateTokenSpy implements GenerateToken {
  token = faker.random.uuid();

  async generate(): Promise<string> {
    return this.token;
  }

  simulateThrowError() {
    jest
      .spyOn(GenerateTokenSpy.prototype, 'generate')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
