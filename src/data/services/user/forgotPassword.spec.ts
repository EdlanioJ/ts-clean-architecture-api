import faker from 'faker';

import { GenerateTokenSpy } from '@/data/tests/cryptography/generateTokenSpy';
import { TokenRepositorySpy } from '@/data/tests/db/token/tokenRepositorySpy';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { UserRepositorySpy } from '@/data/tests/db/user/userRepositorySpy';
import { SenderSpy } from '@/data/tests/messenger/senderSpy';
import { UnauthorizedError } from '@/domain/errors/user/unauthorized';

import { ForgotPasswordService } from './forgotPassword';

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
