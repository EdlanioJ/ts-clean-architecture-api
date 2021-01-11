import faker from 'faker';

import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { AddUser } from '@/domain/useCases/user/addUser';
import { serverError } from '@/presentation/helpers/http/http';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

class AddUserController {
  constructor(private readonly addUser: AddUser) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse | undefined> {
    try {
      const { email, name, password, username } = httpRequest.body;

      await this.addUser.add({ email, name, password, username });

      return undefined;
    } catch (error) {
      return serverError(error);
    }
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

  it('Should return 500 if AddUser throws', async () => {
    const { addUserSpy, sut } = makeSut();
    jest.spyOn(addUserSpy, 'add').mockImplementationOnce(() => {
      throw new Error();
    });

    const httpResponse = await sut.handle(mockRequest());

    expect(httpResponse).toEqual(serverError(new Error()));
  });
});
