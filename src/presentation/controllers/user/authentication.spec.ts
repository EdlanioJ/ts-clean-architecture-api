import faker from 'faker';

import { mockAuthParams } from '@/data/tests/db/user/mockAuthParams';
import { UnauthorizedError } from '@/domain/errors/user/unauthorized';
import { Authentication } from '@/domain/useCases/user/authentication';
import {
  ok,
  serverError,
  unauthorized,
} from '@/presentation/helpers/http/http';
import { Controller } from '@/presentation/protocols/controller';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

class AuthenticationController implements Controller {
  constructor(private readonly authentication: Authentication) {}

  async handle(
    httpRequest: HttpRequest
  ): Promise<HttpResponse<Authentication.Result>> {
    try {
      const { email, password } = httpRequest.body;
      const httpResponse = await this.authentication.auth({ email, password });

      return ok(httpResponse);
    } catch (error) {
      if (error.name === 'UnauthorizedError') {
        return unauthorized(error);
      }
      return serverError(error);
    }
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

  it('Should return 500 if Authentication throws', async () => {
    const { authenticationSpy, sut } = makeSut();

    jest.spyOn(authenticationSpy, 'auth').mockImplementationOnce(() => {
      throw new Error();
    });

    const httpResponse = await sut.handle(mockRequest());

    expect(httpResponse).toEqual(serverError(new Error()));
  });

  it('Should return 401 if Authentication throws an UnauthorizedError', async () => {
    const { authenticationSpy, sut } = makeSut();
    jest.spyOn(authenticationSpy, 'auth').mockImplementationOnce(() => {
      throw new UnauthorizedError('email');
    });

    const httpResponse = await sut.handle(mockRequest());

    expect(httpResponse).toEqual(unauthorized(new UnauthorizedError('email')));
  });

  it('Should return 200 if valid credentials are provided', async () => {
    const { authenticationSpy, sut } = makeSut();

    const httpResponse = await sut.handle(mockRequest());

    expect(httpResponse).toEqual(ok({ token: authenticationSpy.authResult }));
  });
});
