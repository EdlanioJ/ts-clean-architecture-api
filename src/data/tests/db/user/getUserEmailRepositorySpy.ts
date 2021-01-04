import faker from 'faker';

import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { UserModel } from '@/data/protocols/db/user/user';

import { mockUserModel } from './user';

export class GetUserByEmailRepositorySpy implements GetUserByEmailRepository {
  email = faker.internet.email();

  user = mockUserModel();

  async getByEmail(email: string): Promise<UserModel | undefined> {
    this.email = email;

    return this.user;
  }

  simulateGetByEmailThrowError(): void {
    jest
      .spyOn(GetUserByEmailRepositorySpy.prototype, 'getByEmail')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateGetByEmailReturnsUndefined(): void {
    jest
      .spyOn(GetUserByEmailRepositorySpy.prototype, 'getByEmail')
      .mockResolvedValueOnce(undefined);
  }

  // This is not the best way to mock this *CHANGE IT*
  simulateGetByEmail(email: string): void {
    jest
      .spyOn(GetUserByEmailRepositorySpy.prototype, 'getByEmail')
      .mockImplementationOnce(async () => {
        this.email = email;

        return undefined;
      });
  }
}
