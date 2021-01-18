import faker from 'faker';

import { TokenModel } from '@/data/protocols/db/token/token';
import {
  AddTokenParams,
  TokenRepository,
} from '@/data/protocols/db/token/tokenRepository';
import { mockAddTokenParams } from '@/data/tests/db/token/mockAddTokenParams';
import { mockTokenModel } from '@/data/tests/db/token/mockTokenModel';
import { PrismaClient, Prisma, tokens as PrismaToken } from '@prisma/client';

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

class TokenPrismaRepository implements TokenRepository {
  constructor(private readonly prisma = new PrismaClient()) {}

  async save(params: AddTokenParams): Promise<TokenModel> {
    const { token, user_id } = params;

    const tokenResult = await this.prisma.tokens.create({
      data: { token, user: { connect: { id: user_id } } },
    });

    return {
      id: tokenResult.id,
      created_at: tokenResult.created_at,
      token: tokenResult.token,
      user: tokenResult.user_id,
    };
  }
}

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
