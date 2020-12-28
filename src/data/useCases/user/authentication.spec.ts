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
  cyphertext = 'uuid';

  plaintext!: string;

  async encrypt(plaintext: string): Promise<string> {
    this.plaintext = plaintext;

    return this.cyphertext;
  }
}

const mockAuthParams = (): Authentication.Params => ({
  email: 'example@email.com',
  password: 'password',
});
type SutType = {
  sut: AuthenticationUseCase;
  getUserByEmailRepositorySpy: GetUserByEmailRepositorySpy;
  hashComparerSpy: HashComparerSpy;
  encrypterSpy: EncrypterSpy;
};

const makeSut = (): SutType => {
  const getUserByEmailRepositorySpy = new GetUserByEmailRepositorySpy();
  const hashComparerSpy = new HashComparerSpy();
  const encrypterSpy = new EncrypterSpy();
  const sut = new AuthenticationUseCase(
    encrypterSpy,
    getUserByEmailRepositorySpy,
    hashComparerSpy
  );

  return { encrypterSpy, getUserByEmailRepositorySpy, hashComparerSpy, sut };
};
describe('Authentication UseCase', () => {
  it('Should call GetUserByEmailRepository with correct email', async () => {
    const { getUserByEmailRepositorySpy, sut } = makeSut();
    const authParams = mockAuthParams();
    await sut.auth(authParams);
    expect(getUserByEmailRepositorySpy.email).toBe(authParams.email);
  });

  it('Should throw if GetUserByEmailRepository throws', () => {
    const { getUserByEmailRepositorySpy, sut } = makeSut();
    jest
      .spyOn(getUserByEmailRepositorySpy, 'getByEmail')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const promise = sut.auth(mockAuthParams());

    expect(promise).rejects.toThrowError();
  });

  it('Should throw if GetUserByEmailRepository returns undefined', async () => {
    const { getUserByEmailRepositorySpy, sut } = makeSut();
    jest
      .spyOn(getUserByEmailRepositorySpy, 'getByEmail')
      .mockResolvedValueOnce(undefined);

    const authParams = mockAuthParams();
    const promise = sut.auth(authParams);

    await expect(promise).rejects.toThrow(new AuthenticationError('email'));
  });

  it('Should call HashComparer with correct values', async () => {
    const { sut, hashComparerSpy, getUserByEmailRepositorySpy } = makeSut();
    const authParams = mockAuthParams();

    await sut.auth(authParams);

    expect(hashComparerSpy.plaintext).toBe(authParams.password);
    expect(hashComparerSpy.digest).toBe(
      getUserByEmailRepositorySpy.user.password
    );
  });

  it('Should throws if HashComparer throws', () => {
    const { sut, hashComparerSpy } = makeSut();
    jest.spyOn(hashComparerSpy, 'compare').mockImplementationOnce(() => {
      throw new Error();
    });
    const authParams = mockAuthParams();

    const promise = sut.auth(authParams);

    expect(promise).rejects.toThrowError();
  });

  it('Should throws if HashComparer returns false', async () => {
    const { sut, hashComparerSpy, getUserByEmailRepositorySpy } = makeSut();
    jest.spyOn(hashComparerSpy, 'compare').mockResolvedValueOnce(false);

    const authParams = mockAuthParams();

    const promise = sut.auth(authParams);

    await expect(promise).rejects.toThrow(new AuthenticationError('password'));
  });

  it('Should call Encrypter with correct values', async () => {
    const { encrypterSpy, getUserByEmailRepositorySpy, sut } = makeSut();
    const authParams = mockAuthParams();

    await sut.auth(authParams);

    expect(encrypterSpy.plaintext).toBe(getUserByEmailRepositorySpy.user.id);
  });

  it('Should throw if Encrypter throws', async () => {
    const { encrypterSpy, sut } = makeSut();
    jest.spyOn(encrypterSpy, 'encrypt').mockImplementationOnce(() => {
      throw new Error();
    });
    const authParams = mockAuthParams();

    const promise = sut.auth(authParams);

    await expect(promise).rejects.toThrow();
  });

  it('Should return an Authentication.Result', async () => {
    const { sut, encrypterSpy } = makeSut();
    const authParams = mockAuthParams();

    const { token } = await sut.auth(authParams);

    expect(token).toBe(encrypterSpy.cyphertext);
  });
});
