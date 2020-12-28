import { Encrypter } from '@/data/protocols/cryptography/encrypter';
import { HashComparer } from '@/data/protocols/cryptography/hashComparer';
import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { UserModel } from '@/data/protocols/db/user/user';
import { AuthenticationError } from '@/domain/errors/user/authemtication';
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

  async getByEmail(email: string): Promise<UserModel | undefined> {
    this.email = email;

    return this.user;
  }
}
class HashComparerSpy implements HashComparer {
  plaintext!: string;

  digest!: string;

  isValid = true;

  async compare(plaintext: string, digest: string): Promise<boolean> {
    this.digest = digest;
    this.plaintext = plaintext;

    return this.isValid;
  }
}
class EncrypterSpy implements Encrypter {
  plaintext!: string;

  async hash(plaintext: string): Promise<void> {
    this.plaintext = plaintext;
  }
}

const mockAuthParams = (): Authentication.Params => ({
  email: 'example@email.com',
  password: 'password',
});
type SutType = {
  sut: AuthenticationUseCase;
  getUserByEmailRepository: GetUserByEmailRepositorySpy;
  hashComparer: HashComparerSpy;
  encrypter: EncrypterSpy;
};

const makeSut = (): SutType => {
  const getUserByEmailRepository = new GetUserByEmailRepositorySpy();
  const hashComparer = new HashComparerSpy();
  const encrypter = new EncrypterSpy();
  const sut = new AuthenticationUseCase(
    encrypter,
    getUserByEmailRepository,
    hashComparer
  );

  return { encrypter, getUserByEmailRepository, hashComparer, sut };
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

  it('Should throw if GetUserByEmailRepository returns undefined', async () => {
    const { getUserByEmailRepository, sut } = makeSut();
    jest
      .spyOn(getUserByEmailRepository, 'getByEmail')
      .mockResolvedValueOnce(undefined);

    const authParams = mockAuthParams();
    const promise = sut.auth(authParams);

    await expect(promise).rejects.toThrow(new AuthenticationError('email'));
  });

  it('Should call HashComparer with correct values', async () => {
    const { sut, hashComparer, getUserByEmailRepository } = makeSut();
    const authParams = mockAuthParams();

    await sut.auth(authParams);

    expect(hashComparer.plaintext).toBe(authParams.password);
    expect(hashComparer.digest).toBe(getUserByEmailRepository.user.password);
  });

  it('Should throws if HashComparer throws', () => {
    const { sut, hashComparer, getUserByEmailRepository } = makeSut();
    jest.spyOn(hashComparer, 'compare').mockImplementationOnce(() => {
      throw new Error();
    });
    const authParams = mockAuthParams();

    const promise = sut.auth(authParams);

    expect(promise).rejects.toThrowError();
  });

  it('Should throws if HashComparer returns false', async () => {
    const { sut, hashComparer, getUserByEmailRepository } = makeSut();
    jest.spyOn(hashComparer, 'compare').mockResolvedValueOnce(false);

    const authParams = mockAuthParams();

    const promise = sut.auth(authParams);

    await expect(promise).rejects.toThrow(new AuthenticationError('password'));
  });

  it('Should call Ebcrypter with correct values', async () => {
    const { encrypter, getUserByEmailRepository, sut } = makeSut();
    const authParams = mockAuthParams();

    await sut.auth(authParams);

    expect(encrypter.plaintext).toBe(getUserByEmailRepository.user.id);
  });
});
