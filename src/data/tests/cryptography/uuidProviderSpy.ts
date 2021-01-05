import faker from 'faker';

import { UuidProvider } from '@/data/protocols/cryptography/uuidProvder';

export class UuidProviderSpy implements UuidProvider {
  id = faker.random.uuid();

  uuidv4(): string {
    return this.id;
  }

  simulateUuidv4ThrowError(): void {
    jest
      .spyOn(UuidProviderSpy.prototype, 'uuidv4')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
