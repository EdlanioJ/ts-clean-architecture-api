import faker from 'faker';

import { UserModel } from '@/data/protocols/db/user/user';
import {
  AddUserRepositoryParams,
  UserRepository,
} from '@/data/protocols/db/user/userRepository';

import { mockUserModel } from './user';

export class UserRepositorySpy implements UserRepository {
  user = mockUserModel();

  username = faker.internet.userName();

  email = faker.internet.email();

  async save(params: AddUserRepositoryParams): Promise<UserModel> {
    Object.assign(this.user, params);

    return this.user;
  }

  async getByUsername(username: string): Promise<UserModel | undefined> {
    this.username = username;

    return this.user;
  }

  async getByEmail(email: string): Promise<UserModel | undefined> {
    this.email = email;

    return this.user;
  }

  simulateSaveThrowError(): void {
    jest
      .spyOn(UserRepositorySpy.prototype, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateGetByUsernameThrowError(): void {
    jest
      .spyOn(UserRepositorySpy.prototype, 'getByUsername')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateGetByUsernameReturnsUndefined(): void {
    jest
      .spyOn(UserRepositorySpy.prototype, 'getByUsername')
      .mockResolvedValueOnce(undefined);
  }

  // This is not the best way to mock this *CHANGE IT*
  simulateGetByUsername(username: string): void {
    this.username = username;

    jest
      .spyOn(UserRepositorySpy.prototype, 'getByUsername')
      .mockResolvedValueOnce(undefined);
  }

  simulateGetByEmailThrowError(): void {
    jest
      .spyOn(UserRepositorySpy.prototype, 'getByEmail')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateGetByEmailReturnsUndefined(): void {
    jest
      .spyOn(UserRepositorySpy.prototype, 'getByEmail')
      .mockResolvedValueOnce(undefined);
  }

  // This is not the best way to mock this *CHANGE IT*
  simulateGetByEmail(email: string): void {
    jest
      .spyOn(UserRepositorySpy.prototype, 'getByEmail')
      .mockImplementationOnce(async () => {
        this.email = email;

        return undefined;
      });
  }
}
