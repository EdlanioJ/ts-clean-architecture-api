import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { UserModel } from '@/data/protocols/db/user/user';
import { Authentication } from '@/domain/useCases/user/authentication';

import { AuthenticationUseCase } from './authentication';

class GetUserByEmailRepositorySpy implements GetUserByEmailRepository {
  email = 'example@example.com';

  user: UserModel = {
    id: 'uuid',
    email: 'example@example.com',
    name: 'Example Exanple',
    password: 'superSecretHashPassword',
    username: 'example',
  };

  async getByEmail(email: string): Promise<UserModel> {
    this.email = email;

    return this.user;
  }
}
const mockAuthParams = (): Authentication.Params => ({
  email: 'example@email.com',
  password: 'password',
});
type SutType = {
  sut: AuthenticationUseCase;
  getUserByEmailRepository: GetUserByEmailRepositorySpy;
};

const makeSut = (): SutType => {
  const getUserByEmailRepository = new GetUserByEmailRepositorySpy();
  const sut = new AuthenticationUseCase(getUserByEmailRepository);

  return { getUserByEmailRepository, sut };
};
describe('Authentication UseCase', () => {
  it('Should call GetUserByEmailRepository with correct email', async () => {
    const { getUserByEmailRepository, sut } = makeSut();
    const authParams = mockAuthParams();
    await sut.auth(authParams);
    expect(getUserByEmailRepository.email).toBe(authParams.email);
  });

  it('Should throw if GetUserByEmailRepository throws', () => {
    const { getUserByEmailRepository, sut } = makeSut();
    jest
      .spyOn(getUserByEmailRepository, 'getByEmail')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const promise = sut.auth(mockAuthParams());

    expect(promise).rejects.toThrowError();
  });
});
