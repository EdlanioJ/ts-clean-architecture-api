import faker from 'faker';

import { mockAddUserRepositoryParams } from '@/infra/test/db/prisma/user/mockAddUserRepositoryParams';
import { PrismaUserSpy } from '@/infra/test/db/prisma/user/prismaUserSpy';
import { Prisma } from '@prisma/client';

import { UserPrismaRepository } from './userPrismaRepository';

// Must *CHANGE IT*

const prismaUserSpy = new PrismaUserSpy();

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    user = prismaUserSpy;
  },
}));

const makeSut = (): UserPrismaRepository => {
  return new UserPrismaRepository();
};

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
