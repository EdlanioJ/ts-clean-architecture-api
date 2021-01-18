import { AddTokenParams } from '@/data/protocols/db/token/tokenRepository';
import { mockAddTokenParams } from '@/data/tests/db/token/mockAddTokenParams';
import { PrismaClient, Prisma } from '@prisma/client';

class PrismaTokensSpy {
  createParam: any;

  create(params: Prisma.tokensCreateArgs) {
    this.createParam = params;
  }
}

const primaTokensSpy = new PrismaTokensSpy();

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    tokens = primaTokensSpy;
  },
}));

class TokenPrismaRepository {
  constructor(private readonly prisma = new PrismaClient()) {}

  async save(params: AddTokenParams): Promise<void> {
    const { token, user_id } = params;

    await this.prisma.tokens.create({
      data: { token, user: { connect: { id: user_id } } },
    });
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
});
