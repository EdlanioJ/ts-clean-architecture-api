import { HasherSpy } from '@/data/tests/cryptography/hasherSpy';
import { UuidProviderSpy } from '@/data/tests/cryptography/uuidProviderSpy';
import { AddUserRepositorySpy } from '@/data/tests/db/user/addUserRepositorySpy';
import { GetUserByUsernameRepositorySpy } from '@/data/tests/db/user/getUserByUsernameRepositorySpy';
import { GetUserByEmailRepositorySpy } from '@/data/tests/db/user/getUserEmailRepositorySpy';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';

import { AddUserUseCase } from './addUser';

type SutType = {
  sut: AddUserUseCase;
  getUserByEmailRepositorySpy: GetUserByEmailRepositorySpy;
  getUserByUsernameRepositorySpy: GetUserByUsernameRepositorySpy;
  hasherSpy: HasherSpy;
  uuidProviderSpy: UuidProviderSpy;
  addUserRepositorySpy: AddUserRepositorySpy;
};
const makeSut = (): SutType => {
  const getUserByEmailRepositorySpy = new GetUserByEmailRepositorySpy();
  const getUserByUsernameRepositorySpy = new GetUserByUsernameRepositorySpy();
  const hasherSpy = new HasherSpy();
  const uuidProviderSpy = new UuidProviderSpy();
  const addUserRepositorySpy = new AddUserRepositorySpy();
  const sut = new AddUserUseCase(
    getUserByEmailRepositorySpy,
    getUserByUsernameRepositorySpy,
    hasherSpy,
    uuidProviderSpy,
    addUserRepositorySpy
  );

  return {
    addUserRepositorySpy,
    getUserByEmailRepositorySpy,
    getUserByUsernameRepositorySpy,
    hasherSpy,
    sut,
    uuidProviderSpy,
  };
};

describe('AddUser use case', () => {
  it('Should call GetUserByEmailRepository with correct email', async () => {
    const {
      sut,
      getUserByEmailRepositorySpy,
      getUserByUsernameRepositorySpy,
    } = makeSut();
    const addUserParams = mockAddUserParams();
    getUserByEmailRepositorySpy.simulateGetByEmail(addUserParams.email);
    getUserByUsernameRepositorySpy.simulateGetByUsernameReturnsUndefined();

    await sut.add(addUserParams);

    expect(getUserByEmailRepositorySpy.email).toBe(addUserParams.email);
  });

  it('Should throws if getUserByEmailRepository.getByEmail throws', async () => {
    const { getUserByEmailRepositorySpy, sut } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailThrowError();
    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should throw if GetUserByEmailRepository.getByEmail returns a User', async () => {
    const { getUserByEmailRepositorySpy, sut } = makeSut();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow();
  });

  it('Should call GetUserByUsernameRepository with correct username', async () => {
    const {
      getUserByUsernameRepositorySpy,
      getUserByEmailRepositorySpy,
      sut,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    const addUserParams = mockAddUserParams();
    getUserByUsernameRepositorySpy.simulateGetByUsername(
      addUserParams.username
    );

    await sut.add(addUserParams);

    expect(getUserByUsernameRepositorySpy.username).toBe(
      addUserParams.username
    );
  });

  it('Should throws if GetUserByUsernameRepository.getByUsername throws', async () => {
    const {
      getUserByUsernameRepositorySpy,
      getUserByEmailRepositorySpy,
      sut,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    getUserByUsernameRepositorySpy.simulateGetByUsernameThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow();
  });

  it('Should throw if GetUserByUsernameRepository.getByEmail returns a User', async () => {
    const {
      getUserByUsernameRepositorySpy,
      getUserByEmailRepositorySpy,
      sut,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow();
  });

  it('Should call Hasher with correct plaintext', async () => {
    const {
      getUserByEmailRepositorySpy,
      getUserByUsernameRepositorySpy,
      hasherSpy,
      sut,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    getUserByUsernameRepositorySpy.simulateGetByUsernameReturnsUndefined();

    const addUserParams = mockAddUserParams();
    await sut.add(addUserParams);

    expect(hasherSpy.plaintext).toBe(addUserParams.password);
  });

  it('Should throws if Hasher.hash throws', async () => {
    const {
      getUserByEmailRepositorySpy,
      getUserByUsernameRepositorySpy,
      hasherSpy,
      sut,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    getUserByUsernameRepositorySpy.simulateGetByUsernameReturnsUndefined();
    hasherSpy.simulateHashThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrow();
  });

  it('Should throws if UuidProvider.uuidv4 throws', async () => {
    const {
      getUserByUsernameRepositorySpy,
      getUserByEmailRepositorySpy,
      sut,
      uuidProviderSpy,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    getUserByUsernameRepositorySpy.simulateGetByUsernameReturnsUndefined();
    uuidProviderSpy.simulateUuidv4ThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should call AddUserRepository.save with correct params', async () => {
    const {
      getUserByUsernameRepositorySpy,
      getUserByEmailRepositorySpy,
      sut,
      addUserRepositorySpy,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    getUserByUsernameRepositorySpy.simulateGetByUsernameReturnsUndefined();

    const addUserParams = mockAddUserParams();

    await sut.add(addUserParams);

    expect(addUserRepositorySpy.user).toEqual(
      expect.objectContaining({
        name: addUserParams.name,
        email: addUserParams.email,
        username: addUserParams.username,
      })
    );
  });

  it('Should throws if AddUserRepository.save throws', async () => {
    const {
      getUserByUsernameRepositorySpy,
      getUserByEmailRepositorySpy,
      sut,
      addUserRepositorySpy,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    getUserByUsernameRepositorySpy.simulateGetByUsernameReturnsUndefined();
    addUserRepositorySpy.simulateSaveThrowError();

    const promise = sut.add(mockAddUserParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should return an AddUser.Result', async () => {
    const {
      getUserByUsernameRepositorySpy,
      getUserByEmailRepositorySpy,
      sut,
      addUserRepositorySpy,
      uuidProviderSpy,
      hasherSpy,
    } = makeSut();
    getUserByEmailRepositorySpy.simulateGetByEmailReturnsUndefined();
    getUserByUsernameRepositorySpy.simulateGetByUsernameReturnsUndefined();

    const addUserParams = mockAddUserParams();
    const user = await sut.add(addUserParams);

    expect(user).toEqual(
      expect.objectContaining({
        id: uuidProviderSpy.id,
        password: hasherSpy.digest,
        name: addUserParams.name,
        email: addUserParams.email,
        username: addUserParams.username,
      })
    );
  });
});
