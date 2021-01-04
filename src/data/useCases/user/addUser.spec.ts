import faker from 'faker';

import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { GetUserByEmailRepositorySpy } from '@/data/tests/db/user/getUserEmailRepositorySpy';
import { AddUser } from '@/domain/useCases/user/addUser';

interface Hasher {
  hash: (plaintext: string) => Promise<void>;
}

interface GetUserByUsernameRepository {
  getByUsername: (username: string) => Promise<void>;
}

class GetUserByUsernameRepositorySpy implements GetUserByUsernameRepository {
  username = faker.internet.userName();

  async getByUsername(username: string): Promise<void> {
    this.username = username;
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

    await this.getUserByUsernameRepository.getByUsername(params.username);
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
    const { sut, getUserByEmailRepositorySpy } = makeSut();
    const addUserParams = mockAddUserParams();
    getUserByEmailRepositorySpy.simulateGetByEmail(addUserParams.email);

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

    await sut.add(addUserParams);

    expect(getUserByUsernameRepositorySpy.username).toBe(
      addUserParams.username
    );
  });
});
