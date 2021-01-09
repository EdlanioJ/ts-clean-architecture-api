import faker from 'faker';

import { AddUserRepositoryParams } from '@/data/protocols/db/user/addUserRepository';
import { PrismaClient, Prisma } from '@prisma/client';

// Must *CHANGE IT*
class PrismaUserSpy {
  createValue: object = {} as Prisma.userCreateArgs;

  async create(value: Prisma.userCreateArgs): Promise<void> {
    this.createValue = value;
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

class UserPrismaRepository {
  constructor(private readonly prisma = new PrismaClient()) {}

  async add(params: AddUserRepositoryParams): Promise<void> {
    const { email, id, name, password, username } = params;
    await this.prisma.user.create({
      data: {
        email,
        id,
        name,
        password,
        username,
      },
    });
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
      await sut.add(addUserRepositoryParams);

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

      const promise = sut.add(mockAddUserRepositoryParams());

      await expect(promise).rejects.toThrowError();
    });
  });
});
