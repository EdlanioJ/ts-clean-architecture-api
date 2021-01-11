import faker from 'faker';

import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { ParamInUseError } from '@/domain/errors/user/paramInUse';
import { AddUser } from '@/domain/useCases/user/addUser';
import { forbidden, ok, serverError } from '@/presentation/helpers/http/http';
import { Controller } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

class AddUserController implements Controller {
  constructor(private readonly addUser: AddUser) {}

  async handle(
    httpRequest: HttpRequest
  ): Promise<HttpResponse<AddUser.Result>> {
    try {
      const { email, name, password, username } = httpRequest.body;

      const httpResponse = await this.addUser.add({
        email,
        name,
        password,
        username,
      });

      return ok(httpResponse);
    } catch (error) {
      if (error.name === 'ParamInUseError') {
        return forbidden(error);
      }
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

    this.addResult = { ...this.addResult, ...params };

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

  it('Should return 403 if AddUser throws ParamInUseError', async () => {
    const { addUserSpy, sut } = makeSut();
    jest.spyOn(addUserSpy, 'add').mockImplementationOnce(() => {
      throw new ParamInUseError('email');
    });

    const httpResponse = await sut.handle(mockRequest());

    expect(httpResponse).toEqual(forbidden(new ParamInUseError('email')));
  });

  it('Should return 200 if add new user', async () => {
    const { addUserSpy, sut } = makeSut();

    const httpResponse = await sut.handle(mockRequest());

    expect(httpResponse).toEqual(ok(addUserSpy.addResult));
  });
});
