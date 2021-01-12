import { EncrypterSpy } from '@/data/tests/cryptography/encryperSpy';
import { HashComparerSpy } from '@/data/tests/cryptography/hashCompareSpy';
import { mockAuthParams } from '@/data/tests/db/user/mockAuthParams';
import { UserRepositorySpy } from '@/data/tests/db/user/userRepositorySpy';
import { UnauthorizedError } from '@/domain/errors/user/unauthorized';

import { AuthenticationService } from './authentication';

type SutType = {
  sut: AuthenticationService;
  userRepositorySpy: UserRepositorySpy;
  hashComparerSpy: HashComparerSpy;
  encrypterSpy: EncrypterSpy;
};

const makeSut = (): SutType => {
  const userRepositorySpy = new UserRepositorySpy();
  const hashComparerSpy = new HashComparerSpy();
  const encrypterSpy = new EncrypterSpy();
  const sut = new AuthenticationService(
    userRepositorySpy,
    encrypterSpy,
    hashComparerSpy
  );

  return { encrypterSpy, userRepositorySpy, hashComparerSpy, sut };
};
describe('Authentication UseCase', () => {
  it('Should call GetUserByEmailRepository with correct email', async () => {
    const { userRepositorySpy, sut } = makeSut();
    const authParams = mockAuthParams();
    await sut.auth(authParams);
    expect(userRepositorySpy.email).toBe(authParams.email);
  });

  it('Should throw if GetUserByEmailRepository throws', () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailThrowError();
    const promise = sut.auth(mockAuthParams());

    expect(promise).rejects.toThrowError();
  });

  it('Should throw if GetUserByEmailRepository returns undefined', async () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();

    const authParams = mockAuthParams();
    const promise = sut.auth(authParams);

    await expect(promise).rejects.toThrow(new UnauthorizedError('email'));
  });

  it('Should call HashComparer with correct values', async () => {
    const { sut, hashComparerSpy, userRepositorySpy } = makeSut();
    const authParams = mockAuthParams();

    await sut.auth(authParams);

    expect(hashComparerSpy.plaintext).toBe(authParams.password);
    expect(hashComparerSpy.digest).toBe(userRepositorySpy.user.password);
  });

  it('Should throws if HashComparer throws', () => {
    const { sut, hashComparerSpy } = makeSut();
    hashComparerSpy.simulateCompareThrowError();
    const authParams = mockAuthParams();

    const promise = sut.auth(authParams);

    expect(promise).rejects.toThrowError();
  });

  it('Should throws if HashComparer returns false', async () => {
    const { sut, hashComparerSpy, userRepositorySpy } = makeSut();
    hashComparerSpy.simulateCompareReturnsFalse();

    const authParams = mockAuthParams();

    const promise = sut.auth(authParams);

    await expect(promise).rejects.toThrow(new UnauthorizedError('password'));
  });

  it('Should call Encrypter with correct values', async () => {
    const { encrypterSpy, userRepositorySpy, sut } = makeSut();
    const authParams = mockAuthParams();

    await sut.auth(authParams);

    expect(encrypterSpy.plaintext).toBe(userRepositorySpy.user.id);
  });

  it('Should throw if Encrypter throws', async () => {
    const { encrypterSpy, sut } = makeSut();
    encrypterSpy.simulateEncryptThrowError();
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
