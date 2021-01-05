import faker from 'faker';

import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { UserModel } from '@/data/protocols/db/user/user';
import { GetUserByEmailRepositorySpy } from '@/data/tests/db/user/getUserEmailRepositorySpy';
import { mockUserModel } from '@/data/tests/db/user/user';
import { AddUser } from '@/domain/useCases/user/addUser';

interface Hasher {
  hash: (plaintext: string) => Promise<string>;
}

interface GetUserByUsernameRepository {
  getByUsername: (username: string) => Promise<UserModel | undefined>;
}

interface UuidProvider {
  uuidv4: () => string;
}

interface AddUserRepositoryParams {
  id: string;
  email: string;
  name: string;
  password: string;
  username: string;
}
interface AddUserRepository {
  save: (params: AddUserRepositoryParams) => Promise<UserModel>;
}
class UuidProviderSpy implements UuidProvider {
  id = faker.random.uuid();

  uuidv4(): string {
    return this.id;
  }

  simulateUuidv4ThrowError(): void {
    jest
      .spyOn(UuidProviderSpy.prototype, 'uuidv4')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
class GetUserByUsernameRepositorySpy implements GetUserByUsernameRepository {
  username = faker.internet.userName();

  user = mockUserModel();

  async getByUsername(username: string): Promise<UserModel | undefined> {
    this.username = username;

    return this.user;
  }

  simulateGetByUsernameThrowError(): void {
    jest
      .spyOn(GetUserByUsernameRepositorySpy.prototype, 'getByUsername')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateGetByUsernameReturnsUndefined(): void {
    jest
      .spyOn(GetUserByUsernameRepositorySpy.prototype, 'getByUsername')
      .mockResolvedValueOnce(undefined);
  }

  // This is not the best way to mock this *CHANGE IT*
  simulateGetByUsername(username: string): void {
    this.username = username;

    jest
      .spyOn(GetUserByUsernameRepositorySpy.prototype, 'getByUsername')
      .mockResolvedValueOnce(undefined);
  }
}

class HasherSpy implements Hasher {
  plaintext = faker.internet.password();

  digest = faker.random.uuid();

  async hash(plaintext: string): Promise<string> {
    this.plaintext = plaintext;
    return this.digest;
  }

  simulateHashThrowError(): void {
    jest.spyOn(HasherSpy.prototype, 'hash').mockImplementationOnce(() => {
      throw new Error();
    });
  }
}

class AddUserRepositorySpy implements AddUserRepository {
  user = mockUserModel();

  async save(params: AddUserRepositoryParams): Promise<UserModel> {
    Object.assign(this.user, params);

    return this.user;
  }

  simulateSaveThrowError(): void {
    jest
      .spyOn(AddUserRepositorySpy.prototype, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
class AddUserUseCase implements AddUser {
  constructor(
    private readonly getUserByEmailRepository: GetUserByEmailRepository,
    private readonly getUserByUsernameRepository: GetUserByUsernameRepository,
    private readonly hasher: Hasher,
    private readonly uuidProvider: UuidProvider,
    private readonly addUserRepository: AddUserRepository
  ) {}

  async add(params: AddUser.Params): Promise<AddUser.Result> {
    const getUserByEmail = await this.getUserByEmailRepository.getByEmail(
      params.email
    );

    if (getUserByEmail) throw new Error();

    const getUserByUsername = await this.getUserByUsernameRepository.getByUsername(
      params.username
    );

    if (getUserByUsername) throw new Error();

    const id = this.uuidProvider.uuidv4();

    const passwordHash = await this.hasher.hash(params.password);

    const user = await this.addUserRepository.save({
      ...params,
      id,
      password: passwordHash,
    });

    return user;
  }
}
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

const mockAddUserParams = (): AddUser.Params => ({
  email: faker.internet.email(),
  name: faker.name.findName(),
  password: faker.random.alphaNumeric(8),
  username: faker.internet.userName(),
});

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
