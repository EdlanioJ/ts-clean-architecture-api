import { TokenModel } from '@/data/protocols/db/token/token';
import {
  AddTokenParams,
  TokenRepository,
} from '@/data/protocols/db/token/tokenRepository';
import { PrismaClient } from '@prisma/client';

export class TokenPrismaRepository implements TokenRepository {
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
