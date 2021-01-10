import faker from 'faker';

import { IDGenerator } from '@/data/protocols/cryptography/idGenerator';

export class IDGeneratorSpy implements IDGenerator {
  id = faker.random.uuid();

  uuidv4(): string {
    return this.id;
  }

  simulateUuidv4ThrowError(): void {
    jest
      .spyOn(IDGeneratorSpy.prototype, 'uuidv4')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
