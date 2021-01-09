/* eslint-disable consistent-return */
import faker from 'faker';

import {
  AddUserRepository,
  AddUserRepositoryParams,
} from '@/data/protocols/db/user/addUserRepository';
import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { GetUserByUsernameRepository } from '@/data/protocols/db/user/getUserByUsernameRepository';
import { UserModel } from '@/data/protocols/db/user/user';
import { PrismaClient, Prisma, user as PrismaUser } from '@prisma/client';

// Must *CHANGE IT*
class PrismaUserSpy {
  createValue: Prisma.userCreateArgs = {
    data: {
      email: faker.internet.email(),
      id: faker.random.uuid(),
      name: faker.name.findName(),
      password: faker.random.uuid(),
      username: faker.internet.userName(),
    },
  } as Prisma.userCreateArgs;

  findValue: object = {};

  async create(value: Prisma.userCreateArgs): Promise<PrismaUser> {
    this.createValue = value;
    const { email, id, name, password, username } = this.createValue.data;

    return {
      email,
      id,
      name,
      password,
      username,
      phone_number: null,
      updated_at: new Date(),
      created_at: new Date(),
    };
  }

  async findUnique(
    value: Prisma.FindUniqueuserArgs
  ): Promise<PrismaUser | null> {
    this.findValue = value.where;
    const val = value.where;
    const { data } = this.createValue;

    const { email, id, name, password, username } = this.createValue.data;

    return {
      email,
      id,
      name,
      password,
      username,
      phone_number: null,
      updated_at: new Date(),
      created_at: new Date(),
      ...val,
    };
  }

  simulateCreateThrowError(): void {
    jest.spyOn(PrismaUserSpy.prototype, 'create').mockImplementationOnce(() => {
      throw new Error();
    });
  }

  simulateFindUniqueReturnsNull(): void {
    jest
      .spyOn(PrismaUserSpy.prototype, 'findUnique')
      .mockResolvedValueOnce(null);
  }

  simulateFindUniqueThrowError(): void {
    jest
      .spyOn(PrismaUserSpy.prototype, 'findUnique')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }
}

const prismaUserSpy = new PrismaUserSpy();

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    user = {
      create: (value: Prisma.userCreateArgs) => prismaUserSpy.create(value),
      findUnique: (value: Prisma.FindUniqueuserArgs) =>
        prismaUserSpy.findUnique(value),
    };
  },
}));

class UserPrismaRepository
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

const makeSut = (): UserPrismaRepository => {
  return new UserPrismaRepository();
};
const mockAddUserRepositoryParams = (): AddUserRepositoryParams => ({
  email: faker.internet.email(),
  id: faker.random.uuid(),
  name: faker.name.findName(),
  password: faker.random.uuid(),
  username: faker.internet.userName(),
});

describe('UserPrismaRepository', () => {
  describe('save()', () => {
    it('Should call create with correct values', async () => {
      const sut = makeSut();
      const addUserRepositoryParams = mockAddUserRepositoryParams();
      await sut.save(addUserRepositoryParams);

      expect(prismaUserSpy.createValue).toEqual(
        expect.objectContaining({
          data: addUserRepositoryParams,
        })
      );
    });

    it('Should throw if create throws an Error', async () => {
      const sut = makeSut();
      prismaUserSpy.simulateCreateThrowError();

      const promise = sut.save(mockAddUserRepositoryParams());

      await expect(promise).rejects.toThrowError();
    });

    it('Should return UserModel', async () => {
      const sut = makeSut();
      const addUserRepositoryParams = mockAddUserRepositoryParams();
      const user = await sut.save(addUserRepositoryParams);

      expect(user).toEqual(expect.objectContaining(addUserRepositoryParams));
    });
  });

  describe('getByEmail()', () => {
    it('Should call findUnique with correct values', async () => {
      const sut = makeSut();
      const email = faker.internet.email();

      await sut.getByEmail(email);

      expect(prismaUserSpy.findValue).toEqual(
        expect.objectContaining({ email })
      );
    });

    it('Should throw if findUnique throws an Error', async () => {
      const sut = makeSut();
      const email = faker.internet.email();
      prismaUserSpy.simulateFindUniqueThrowError();

      const promise = sut.getByEmail(email);

      await expect(promise).rejects.toThrowError();
    });

    it('Should return undefined', async () => {
      const sut = makeSut();
      const email = faker.internet.email();
      prismaUserSpy.simulateFindUniqueReturnsNull();

      const promise = sut.getByEmail(email);

      await expect(promise).resolves.toBeUndefined();
    });

    it('Should returns UserModel', async () => {
      const sut = makeSut();
      const email = faker.internet.email();

      const user = await sut.getByEmail(email);

      expect(user).toEqual(expect.objectContaining({ email }));
    });
  });

  describe('getByUsername()', () => {
    it('Should call findUnique with correct values', async () => {
      const sut = makeSut();
      const username = faker.internet.userName();
      await sut.getByUsername(username);

      expect(prismaUserSpy.findValue).toEqual(
        expect.objectContaining({ username })
      );
    });

    it('Should throws if findUnique throws an Error', async () => {
      const sut = makeSut();
      prismaUserSpy.simulateFindUniqueThrowError();

      const username = faker.internet.userName();

      const promise = sut.getByUsername(username);

      await expect(promise).rejects.toThrowError();
    });

    it('Should returns undefined', async () => {
      const sut = makeSut();
      const username = faker.internet.userName();
      prismaUserSpy.simulateFindUniqueReturnsNull();

      const user = await sut.getByUsername(username);

      expect(user).toBeUndefined();
    });

    it('Should returns UserModel', async () => {
      const sut = makeSut();
      const username = faker.internet.userName();

      const user = await sut.getByUsername(username);

      expect(user).toEqual(expect.objectContaining({ username }));
    });
  });
});
