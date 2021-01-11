import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { ParamInUseError } from '@/domain/errors/user/paramInUse';
import { forbidden, ok, serverError } from '@/presentation/helpers/http/http';
import { HttpRequest } from '@/presentation/protocols/http';
import { AddUserSpy } from '@/presentation/tests/user/addUserSpy';

import { AddUserController } from './addUser';

const mockRequest = (): HttpRequest => ({
  body: mockAddUserParams(),
});

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
