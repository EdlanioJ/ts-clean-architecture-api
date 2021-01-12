import { HasherSpy } from '@/data/tests/cryptography/hasherSpy';
import { IDGeneratorSpy } from '@/data/tests/cryptography/idGenerator';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { UserRepositorySpy } from '@/data/tests/db/user/userRepositorySpy';
import { ParamInUseError } from '@/domain/errors/user/paramInUse';

import { AddUserService } from './addUser';

type SutType = {
  sut: AddUserService;
  userRepositorySpy: UserRepositorySpy;
  hasherSpy: HasherSpy;
  idGeneratorSpy: IDGeneratorSpy;
};
const makeSut = (): SutType => {
  const userRepositorySpy = new UserRepositorySpy();
  const hasherSpy = new HasherSpy();
  const idGeneratorSpy = new IDGeneratorSpy();
  const sut = new AddUserService(userRepositorySpy, hasherSpy, idGeneratorSpy);

  return {
    userRepositorySpy,
    hasherSpy,
    sut,
    idGeneratorSpy,
  };
};

describe('AddUser use case', () => {
  it('Should call GetUserByEmailRepository with correct email', async () => {
    const { sut, userRepositorySpy } = makeSut();
    const addUserParams = mockAddUserParams();
    userRepositorySpy.simulateGetByEmail(addUserParams.email);
    userRepositorySpy.simulateGetByUsernameReturnsUndefined();

    await sut.add(addUserParams);

    expect(userRepositorySpy.email).toBe(addUserParams.email);
  });

  it('Should throws if getUserByEmailRepository.getByEmail throws', async () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailThrowError();
    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should throw if GetUserByEmailRepository.getByEmail returns a User', async () => {
    const { userRepositorySpy, sut } = makeSut();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow(new ParamInUseError('email'));
  });

  it('Should call GetUserByUsernameRepository with correct username', async () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    const addUserParams = mockAddUserParams();
    userRepositorySpy.simulateGetByUsername(addUserParams.username);

    await sut.add(addUserParams);

    expect(userRepositorySpy.username).toBe(addUserParams.username);
  });

  it('Should throws if GetUserByUsernameRepository.getByUsername throws', async () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    userRepositorySpy.simulateGetByUsernameThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow();
  });

  it('Should throw if GetUserByUsernameRepository.getByEmail returns a User', async () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow(new ParamInUseError('username'));
  });

  it('Should call Hasher with correct plaintext', async () => {
    const { userRepositorySpy, hasherSpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    userRepositorySpy.simulateGetByUsernameReturnsUndefined();

    const addUserParams = mockAddUserParams();
    await sut.add(addUserParams);

    expect(hasherSpy.plaintext).toBe(addUserParams.password);
  });

  it('Should throws if Hasher.hash throws', async () => {
    const { userRepositorySpy, hasherSpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    userRepositorySpy.simulateGetByUsernameReturnsUndefined();
    hasherSpy.simulateHashThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow();
  });

  it('Should throws if UuidProvider.uuidv4 throws', async () => {
    const { userRepositorySpy, sut, idGeneratorSpy } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    userRepositorySpy.simulateGetByUsernameReturnsUndefined();
    idGeneratorSpy.simulateUuidv4ThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should call AddUserRepository.save with correct params', async () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    userRepositorySpy.simulateGetByUsernameReturnsUndefined();

    const addUserParams = mockAddUserParams();

    await sut.add(addUserParams);

    expect(userRepositorySpy.user).toEqual(
      expect.objectContaining({
        name: addUserParams.name,
        email: addUserParams.email,
        username: addUserParams.username,
      })
    );
  });

  it('Should throws if AddUserRepository.save throws', async () => {
    const { userRepositorySpy, sut } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    userRepositorySpy.simulateGetByUsernameReturnsUndefined();
    userRepositorySpy.simulateSaveThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should return an AddUser.Result', async () => {
    const { userRepositorySpy, sut, idGeneratorSpy, hasherSpy } = makeSut();
    userRepositorySpy.simulateGetByEmailReturnsUndefined();
    userRepositorySpy.simulateGetByUsernameReturnsUndefined();

    const addUserParams = mockAddUserParams();
    const user = await sut.add(addUserParams);

    expect(user).toEqual(
      expect.objectContaining({
        id: idGeneratorSpy.id,
        password: hasherSpy.digest,
        name: addUserParams.name,
        email: addUserParams.email,
        username: addUserParams.username,
      })
    );
  });
});
