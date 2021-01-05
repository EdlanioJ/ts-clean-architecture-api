import {
  AddUserRepository,
  AddUserRepositoryParams,
} from '@/data/protocols/db/user/addUserRepository';
import { UserModel } from '@/data/protocols/db/user/user';

import { mockUserModel } from './user';

export class AddUserRepositorySpy implements AddUserRepository {
  user = mockUserModel();

  async save(params: AddUserRepositoryParams): Promise<UserModel> {
    Object.assign(this.user, params);

    return this.user;
  }

  simulateSaveThrowError(): void {
    jest
      .spyOn(AddUserRepositorySpy.prototype, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
