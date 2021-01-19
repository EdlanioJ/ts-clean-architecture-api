import faker from 'faker';

import { mockAddTokenParams } from '@/data/tests/db/token/mockAddTokenParams';
import { ForgotPassword } from '@/domain/useCases/user/forgotPassword';
import { serverError } from '@/presentation/helpers/http/http';
import { HttpRequest, HttpResponse } from '@/presentation/protocols/http';

class ForgotPasswordController {
  constructor(private readonly forgotPassword: ForgotPassword) {}

  async handle(httpRequest: HttpRequest): Promise<undefined | HttpResponse> {
    try {
      const { email } = httpRequest.body;
      await this.forgotPassword.add(email);

      return undefined;
    } catch (error) {
      return serverError(error);
    }
  }
}

class ForgotPasswordSpy implements ForgotPassword {
  email = faker.internet.email();

  async add(param: ForgotPassword.Param): Promise<ForgotPassword.Result> {
    this.email = param;
  }
}

const mockForgotPasswordParam = () => {
  return { email: faker.internet.email() };
};
const mockRequest = (): HttpRequest => ({
  body: mockForgotPasswordParam(),
});

type SutType = {
  sut: ForgotPasswordController;
  forgotPasswordSpy: ForgotPasswordSpy;
};

const makeSut = (): SutType => {
  const forgotPasswordSpy = new ForgotPasswordSpy();
  const sut = new ForgotPasswordController(forgotPasswordSpy);

  return { sut, forgotPasswordSpy };
};

describe('ForgotPasswordController', () => {
  it('Should call ForgotPassword with correct values', async () => {
    const { forgotPasswordSpy, sut } = makeSut();

    const mockParam = mockRequest();

    await sut.handle(mockParam);

    expect(forgotPasswordSpy.email).toBe(mockParam.body.email);
  });

  it('Should return return 500 if ForgotPassword throw', async () => {
    const { forgotPasswordSpy, sut } = makeSut();
    jest.spyOn(forgotPasswordSpy, 'add').mockImplementationOnce(() => {
      throw new Error();
    });
    const httpresponse = await sut.handle(mockRequest());

    await expect(httpresponse).toEqual(serverError(new Error()));
  });
});
