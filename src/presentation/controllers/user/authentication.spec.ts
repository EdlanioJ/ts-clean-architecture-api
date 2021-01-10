import faker from 'faker';

import { mockAuthParams } from '@/data/tests/db/user/mockAuthParams';
import { Authentication } from '@/domain/useCases/user/authentication';
import { HttpRequest } from '@/presentation/protocols/http';

class AuthenticationController {
  constructor(private readonly authentication: Authentication) {}

  async handle(httpRequest: HttpRequest): Promise<void> {
    const { email, password } = httpRequest.body;
    await this.authentication.auth({ email, password });
  }
}

class AuthenticationSpy implements Authentication {
  authParams = {};

  authResult = faker.random.uuid();

  async auth(params: Authentication.Params): Promise<Authentication.Result> {
    this.authParams = params;

    return { token: this.authResult };
  }
}

const mockRequest = (): HttpRequest => ({
  body: mockAuthParams(),
});

type SutType = {
  authenticationSpy: AuthenticationSpy;
  sut: AuthenticationController;
};

const makeSut = (): SutType => {
  const authenticationSpy = new AuthenticationSpy();
  const sut = new AuthenticationController(authenticationSpy);

  return { authenticationSpy, sut };
};
describe('Authentciation Controller', () => {
  it('Should call Authentication with correct values', async () => {
    const { authenticationSpy, sut } = makeSut();

    const httpRequest = mockRequest();
    await sut.handle(httpRequest);

    expect(authenticationSpy.authParams).toEqual(
      expect.objectContaining(httpRequest.body)
    );
  });
});
