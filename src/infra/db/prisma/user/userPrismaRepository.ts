import {
  AddUserRepository,
  AddUserRepositoryParams,
} from '@/data/protocols/db/user/addUserRepository';
import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { GetUserByUsernameRepository } from '@/data/protocols/db/user/getUserByUsernameRepository';
import { UserModel } from '@/data/protocols/db/user/user';
import { PrismaClient } from '@prisma/client';

export class UserPrismaRepository
  implements
    AddUserRepository,
    GetUserByEmailRepository,
    GetUserByUsernameRepository {
  constructor(private readonly prisma = new PrismaClient()) {}

  async save(params: AddUserRepositoryParams): Promise<UserModel> {
    const { email, id, name, password, username } = params;
    const user = await this.prisma.user.create({
      data: {
        email,
        id,
        name,
        password,
        username,
      },
    });

    return {
      email: user.email,
      id: user.id,
      name: user.name,
      password: user.password,
      username: user.username,
    };
  }

  async getByEmail(email: string): Promise<UserModel | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) return undefined;

    return {
      email: user.email,
      id: user.id,
      name: user.name,
      password: user.password,
      username: user.username,
    };
  }

  async getByUsername(username: string): Promise<UserModel | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) return undefined;

    return {
      email: user.email,
      id: user.id,
      name: user.name,
      password: user.password,
      username: user.username,
    };
  }
}
