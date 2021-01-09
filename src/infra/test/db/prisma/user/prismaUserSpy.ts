import faker from 'faker';

import { PrismaClient, Prisma, user as PrismaUser } from '@prisma/client';

export class PrismaUserSpy {
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
