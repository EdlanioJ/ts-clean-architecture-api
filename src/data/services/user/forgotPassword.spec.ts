import faker from 'faker';

import { GenerateToken } from '@/data/protocols/cryptography/generateToken';
import { UserRepository } from '@/data/protocols/db/user/userRepository';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
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
