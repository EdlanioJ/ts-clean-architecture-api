import { AuthenticationService } from '@/data/services/user/authentication';
import { BcryptAdapter } from '@/infra/cryptography/bcryptAdapter';
import { JwtAdapter } from '@/infra/cryptography/jwtAdapter';
import { UserPrismaRepository } from '@/infra/db/prisma/user/userPrismaRepository';
import { env } from '@/main/config/env';
import { AuthenticationController } from '@/presentation/controllers/user/authentication';
import { Controller } from '@/presentation/protocols/controller';

export const makeAuthenticationController = (): Controller => {
  const repo = new UserPrismaRepository();
  const bcrypt = new BcryptAdapter(env.salt);
  const jwt = new JwtAdapter(String(env.jwtSecret));
  const authentication = new AuthenticationService(repo, jwt, bcrypt);

  return new AuthenticationController(authentication);
};
