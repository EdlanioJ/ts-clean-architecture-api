import faker from 'faker';

import { GenerateToken } from '@/data/protocols/cryptography/generateToken';
import { TokenModel } from '@/data/protocols/db/token/token';
import {
  AddTokenParams,
  TokenRepository,
} from '@/data/protocols/db/token/tokenRepository';
import { UserRepository } from '@/data/protocols/db/user/userRepository';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { mockUserModel } from '@/data/tests/db/user/user';
import { UserRepositorySpy } from '@/data/tests/db/user/userRepositorySpy';
import { UnauthorizedError } from '@/domain/errors/user/unauthorized';

class ForgotPasswordService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly generateToken: GenerateToken
  ) {}

  async add(email: string): Promise<void> {
    const user = await this.userRepository.getByEmail(email);

    if (!user) throw new UnauthorizedError('email');

    await this.generateToken.generate();
  }
}

class GenerateTokenSpy implements GenerateToken {
  token = faker.random.uuid();

  async generate(): Promise<string> {
    return this.token;
  }

  simulateThrowError() {
    jest
      .spyOn(GenerateTokenSpy.prototype, 'generate')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}
const mockAddTokenParams = (): AddTokenParams => ({
  token: faker.random.uuid(),
  user_id: faker.random.uuid(),
});

const mockTokenModel = (): TokenModel => ({
  created_at: new Date(),
  id: faker.random.number(),
  token: faker.random.uuid(),
  user: mockUserModel(),
});

class TokenRepositorySpy implements TokenRepository {
  saveParams = mockAddTokenParams();

  tokenModel = mockTokenModel();

  async save(params: AddTokenParams): Promise<TokenModel> {
    this.saveParams = params;

    return this.tokenModel;
  }
}

type SutType = {
  sut: ForgotPasswordService;
  userRepositorySpy: UserRepositorySpy;
  generateTokenSpy: GenerateTokenSpy;
};

const makeSut = (): SutType => {
  const userRepositorySpy = new UserRepositorySpy();
  const generateTokenSpy = new GenerateTokenSpy();
  const sut = new ForgotPasswordService(userRepositorySpy, generateTokenSpy);

  return { sut, userRepositorySpy, generateTokenSpy };
};
describe('Forgot Password Service', () => {
  it('Should call UserRepository getUserByEmail with correct email', async () => {
    const { sut, userRepositorySpy } = makeSut();
    const addUserParams = mockAddUserParams();

    await sut.add(addUserParams.email);

    expect(userRepositorySpy.email).toBe(addUserParams.email);
  });

  it('Should throws if userRepository.getByEmail throws', async () => {
    const { sut, userRepositorySpy } = makeSut();
    userRepositorySpy.simulateGetByEmailThrowError();

    const promise = sut.add(mockAddUserParams().email);

    await expect(promise).rejects.toThrowError();
  });

  it('Should throw if  userRepository.getByEmail returns undefined', async () => {
    const { sut, userRepositorySpy } = makeSut();

    userRepositorySpy.simulateGetByEmailReturnsUndefined();

    const promise = sut.add(mockAddUserParams().email);

    await expect(promise).rejects.toThrow(new UnauthorizedError('email'));
  });

  it('Should throw if generateToken.generate throw', async () => {
    const { generateTokenSpy, sut, userRepositorySpy } = makeSut();

    generateTokenSpy.simulateThrowError();

    const promise = sut.add(mockAddUserParams().email);

    await expect(promise).rejects.toThrowError();
  });
});
