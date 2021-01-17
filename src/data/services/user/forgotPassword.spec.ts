import faker from 'faker';

import { GenerateToken } from '@/data/protocols/cryptography/generateToken';
import { TokenModel } from '@/data/protocols/db/token/token';
import {
  AddTokenParams,
  TokenRepository,
} from '@/data/protocols/db/token/tokenRepository';
import { UserRepository } from '@/data/protocols/db/user/userRepository';
import { Sender, SendParams } from '@/data/protocols/messenger/sender';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { mockUserModel } from '@/data/tests/db/user/user';
import { UserRepositorySpy } from '@/data/tests/db/user/userRepositorySpy';
import { UnauthorizedError } from '@/domain/errors/user/unauthorized';
import { ForgotPassword } from '@/domain/useCases/user/forgotPassword';

class ForgotPasswordService implements ForgotPassword {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly generateToken: GenerateToken,
    private readonly sender: Sender
  ) {}

  async add(email: ForgotPassword.Param): Promise<ForgotPassword.Result> {
    const user = await this.userRepository.getByEmail(email);

    if (!user) throw new UnauthorizedError('email');

    const token = await this.generateToken.generate();

    const tokenData = await this.tokenRepository.save({
      token,
      user_id: user.id,
    });

    const template = 'reset_password';
    const data = {
      template,
      token: tokenData.token,
      user: { name: tokenData.user.name, email: tokenData.user.email },
    };

    await this.sender.send({ topic: 'send-email', data });
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

  simulateThrowError() {
    jest
      .spyOn(TokenRepositorySpy.prototype, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}

const mockSendParams = (): SendParams => ({
  topic: 'send-email',
  data: faker.random.objectElement(),
});
class SenderSpy implements Sender {
  sendParams = mockSendParams();

  async send(params: SendParams): Promise<void> {
    Object.assign(this.sendParams, params);
  }

  simulateThrowError() {
    jest.spyOn(SenderSpy.prototype, 'send').mockImplementationOnce(() => {
      throw new Error();
    });
  }
}
type SutType = {
  sut: ForgotPasswordService;
  userRepositorySpy: UserRepositorySpy;
  generateTokenSpy: GenerateTokenSpy;
  tokenRepositorySpy: TokenRepositorySpy;
  senderSpy: SenderSpy;
};

const makeSut = (): SutType => {
  const userRepositorySpy = new UserRepositorySpy();
  const generateTokenSpy = new GenerateTokenSpy();
  const tokenRepositorySpy = new TokenRepositorySpy();
  const senderSpy = new SenderSpy();

  const sut = new ForgotPasswordService(
    userRepositorySpy,
    tokenRepositorySpy,
    generateTokenSpy,
    senderSpy
  );

  return {
    sut,
    userRepositorySpy,
    generateTokenSpy,
    tokenRepositorySpy,
    senderSpy,
  };
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

  it('Should call tokenRepository.save with correct values', async () => {
    const {
      sut,
      tokenRepositorySpy,
      generateTokenSpy,
      userRepositorySpy,
    } = makeSut();
    const mockParams = mockAddUserParams();
    await sut.add(mockParams.email);

    expect(tokenRepositorySpy.saveParams).toEqual(
      expect.objectContaining({
        token: generateTokenSpy.token,
        user_id: userRepositorySpy.user.id,
      })
    );
  });

  it('Should throws if tokenRepository.save throws', async () => {
    const { sut, tokenRepositorySpy } = makeSut();
    tokenRepositorySpy.simulateThrowError();

    const promise = sut.add(mockAddUserParams().email);

    expect(promise).rejects.toThrowError();
  });

  it('Should call sender.send with correct values', async () => {
    const { sut, senderSpy, tokenRepositorySpy } = makeSut();

    await sut.add(mockAddUserParams().email);

    expect(senderSpy.sendParams).toEqual(
      expect.objectContaining({
        topic: 'send-email',
        data: {
          template: 'reset_password',
          token: tokenRepositorySpy.tokenModel.token,
          user: {
            name: tokenRepositorySpy.tokenModel.user.name,
            email: tokenRepositorySpy.tokenModel.user.email,
          },
        },
      })
    );
  });

  it('Should throw if sender.send throws', async () => {
    const { sut, senderSpy } = makeSut();

    senderSpy.simulateThrowError();

    const promise = sut.add(mockAddUserParams().email);

    await expect(promise).rejects.toThrowError();
  });
});
