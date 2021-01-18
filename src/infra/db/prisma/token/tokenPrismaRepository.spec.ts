import faker from 'faker';

import { mockAddTokenParams } from '@/data/tests/db/token/mockAddTokenParams';
import { Prisma, tokens as PrismaToken } from '@prisma/client';

import { TokenPrismaRepository } from './tokenPrismaRepository';

class PrismaTokensSpy {
  createParam: any;

  async create(params: Prisma.tokensCreateArgs): Promise<PrismaToken> {
    this.createParam = params;

    return {
      created_at: new Date(),
      id: faker.random.number(),
      token: params.data.token,
      user_id: params.data.user.connect?.id as string,
    };
  }
}

const primaTokensSpy = new PrismaTokensSpy();

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    tokens = primaTokensSpy;
  },
}));

const makeSut = (): TokenPrismaRepository => {
  return new TokenPrismaRepository();
};
describe('TokenPrismaRepository', () => {
  it('Should call create with correct values', async () => {
    const sut = makeSut();
    const mockParams = mockAddTokenParams();
    const { token, user_id } = mockParams;

    await sut.save(mockParams);

    expect(primaTokensSpy.createParam).toEqual(
      expect.objectContaining({
        data: {
          token,
          user: {
            connect: {
              id: user_id,
            },
          },
        },
      })
    );
  });

  it('Should throw if create throws', async () => {
    const sut = makeSut();
    jest.spyOn(primaTokensSpy, 'create').mockImplementationOnce(() => {
      throw new Error();
    });

    const promise = sut.save(mockAddTokenParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should return TokenModel', async () => {
    const sut = makeSut();
    const mockParams = mockAddTokenParams();

    const tokenModel = await sut.save(mockParams);

    expect(tokenModel).toEqual(
      expect.objectContaining({
        token: mockParams.token,
        user: mockParams.user_id,
      })
    );
  });
});
