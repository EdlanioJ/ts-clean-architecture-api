import faker from 'faker';

import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { UserModel } from '@/data/protocols/db/user/user';
import { GetUserByEmailRepositorySpy } from '@/data/tests/db/user/getUserEmailRepositorySpy';
import { mockUserModel } from '@/data/tests/db/user/user';
import { AddUser } from '@/domain/useCases/user/addUser';

interface Hasher {
  hash: (plaintext: string) => Promise<void>;
}

interface GetUserByUsernameRepository {
  getByUsername: (username: string) => Promise<UserModel | undefined>;
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

  simulateGetByUsername(username: string): void {
    this.username = username;

    jest
      .spyOn(GetUserByUsernameRepositorySpy.prototype, 'getByUsername')
      .mockResolvedValueOnce(undefined);
  }
}

class HasherSpy implements Hasher {
  plaintext = '';

  async hash(plaintext: string): Promise<void> {
    this.plaintext = plaintext;
  }
}

class AddUserUseCase {
  constructor(
    private readonly getUserByEmailRepository: GetUserByEmailRepository,
    private readonly getUserByUsernameRepository: GetUserByUsernameRepository
  ) {}

  async add(params: AddUser.Params): Promise<void> {
    const getUserByEmail = await this.getUserByEmailRepository.getByEmail(
      params.email
    );

    if (getUserByEmail) throw new Error();

    const getUserByUsername = await this.getUserByUsernameRepository.getByUsername(
      params.username
    );

    if (getUserByUsername) throw new Error();
  }
}
type SutType = {
  sut: AddUserUseCase;
  getUserByEmailRepositorySpy: GetUserByEmailRepositorySpy;
  getUserByUsernameRepositorySpy: GetUserByUsernameRepositorySpy;
};
const makeSut = (): SutType => {
  const getUserByEmailRepositorySpy = new GetUserByEmailRepositorySpy();
  const getUserByUsernameRepositorySpy = new GetUserByUsernameRepositorySpy();
  const sut = new AddUserUseCase(
    getUserByEmailRepositorySpy,
    getUserByUsernameRepositorySpy
  );

  return { getUserByEmailRepositorySpy, getUserByUsernameRepositorySpy, sut };
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
});
