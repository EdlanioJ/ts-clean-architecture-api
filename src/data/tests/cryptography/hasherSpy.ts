import faker from 'faker';

import { Hasher } from '@/data/protocols/cryptography/hasher';

export class HasherSpy implements Hasher {
  plaintext = faker.internet.password();

  digest = faker.random.uuid();

  async hash(plaintext: string): Promise<string> {
    this.plaintext = plaintext;
    return this.digest;
  }

  simulateHashThrowError(): void {
    jest.spyOn(HasherSpy.prototype, 'hash').mockImplementationOnce(() => {
      throw new Error();
    });
  }
}
