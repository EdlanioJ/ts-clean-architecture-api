import faker from 'faker';

import {
  AddUserRepository,
  AddUserRepositoryParams,
} from '@/data/protocols/db/user/addUserRepository';
import { UserModel } from '@/data/protocols/db/user/user';
import { PrismaClient, Prisma, user as PrismaUser } from '@prisma/client';

// Must *CHANGE IT*
class PrismaUserSpy {
  createValue: object = {} as Prisma.userCreateArgs;

  async create(value: Prisma.userCreateArgs): Promise<PrismaUser> {
    this.createValue = value;
    const {
      data: { email, id, name, password, username, created_at, updated_at },
    } = value;

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
}

const prismaUserSpy = new PrismaUserSpy();

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    user = {
      create: (value: Prisma.userCreateArgs) => prismaUserSpy.create(value),
    };
  },
}));

class UserPrismaRepository implements AddUserRepository {
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
  describe('add()', () => {
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
      jest.spyOn(prismaUserSpy, 'create').mockImplementationOnce(() => {
        throw new Error();
      });

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
});
