import faker from 'faker';

import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { AddUser } from '@/domain/useCases/user/addUser';
import { HttpRequest } from '@/presentation/protocols/http';

class AddUserController {
  constructor(private readonly addUser: AddUser) {}

  async handle(httpRequest: HttpRequest): Promise<void> {
    const { email, name, password, username } = httpRequest.body;

    await this.addUser.add({ email, name, password, username });
  }
}

const mockAddResult = (): AddUser.Result => ({
  id: faker.random.uuid(),
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.random.uuid(),
  username: faker.internet.userName(),
});

const mockRequest = (): HttpRequest => ({
  body: mockAddUserParams(),
});
class AddUserSpy implements AddUser {
  addParams = mockAddUserParams();

  addResult = mockAddResult();

  async add(params: AddUser.Params): Promise<AddUser.Result> {
    this.addParams = params;

    return this.addResult;
  }
}

type SutType = {
  sut: AddUserController;
  addUserSpy: AddUserSpy;
};

const makeSut = (): SutType => {
  const addUserSpy = new AddUserSpy();
  const sut = new AddUserController(addUserSpy);

  return { addUserSpy, sut };
};

describe('AddUserController', () => {
  it('Should call AddUser with correct values', async () => {
    const { addUserSpy, sut } = makeSut();
    const httpRequest = mockRequest();

    await sut.handle(httpRequest);

    expect(addUserSpy.addParams).toEqual(
      expect.objectContaining(httpRequest.body)
    );
  });
});
