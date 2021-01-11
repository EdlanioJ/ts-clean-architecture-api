import { mockAddResult } from '@/data/tests/db/user/mockAddResult';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { AddUser } from '@/domain/useCases/user/addUser';

export class AddUserSpy implements AddUser {
  addParams = mockAddUserParams();

  addResult = mockAddResult();

  async add(params: AddUser.Params): Promise<AddUser.Result> {
    this.addParams = params;

    this.addResult = { ...this.addResult, ...params };

    return this.addResult;
  }
}
