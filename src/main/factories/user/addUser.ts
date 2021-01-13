import { AddUserService } from '@/data/services/user/addUser';
import { BcryptAdapter } from '@/infra/cryptography/bcryptAdapter';
import { UuidProvider } from '@/infra/cryptography/uuidProvider';
import { UserPrismaRepository } from '@/infra/db/prisma/user/userPrismaRepository';
import { env } from '@/main/config/env';
import { AddUserController } from '@/presentation/controllers/user/addUser';
import { Controller } from '@/presentation/protocols/controller';

export const makeAddUserController = (): Controller => {
  const repo = new UserPrismaRepository();
  const bcrypt = new BcryptAdapter(env.salt);
  const uuidProvider = new UuidProvider();
  const addUser = new AddUserService(repo, bcrypt, uuidProvider);
  return new AddUserController(addUser);
};
