import faker from 'faker';

import { GetUserByUsernameRepository } from '@/data/protocols/db/user/getUserByUsernameRepository';
import { UserModel } from '@/data/protocols/db/user/user';

import { mockUserModel } from './user';

export class GetUserByUsernameRepositorySpy
  implements GetUserByUsernameRepository {
  username = faker.internet.userName();

  user = mockUserModel();

  async getByUsername(username: string): Promise<UserModel | undefined> {
    this.username = username;

    return this.user;
  }

  simulateGetByUsernameThrowError(): void {
    jest
      .spyOn(GetUserByUsernameRepositorySpy.prototype, 'getByUsername')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateGetByUsernameReturnsUndefined(): void {
    jest
      .spyOn(GetUserByUsernameRepositorySpy.prototype, 'getByUsername')
      .mockResolvedValueOnce(undefined);
  }

  // This is not the best way to mock this *CHANGE IT*
  simulateGetByUsername(username: string): void {
    this.username = username;

    jest
      .spyOn(GetUserByUsernameRepositorySpy.prototype, 'getByUsername')
      .mockResolvedValueOnce(undefined);
  }
}
