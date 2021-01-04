import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { UserModel } from '@/data/protocols/db/user/user';

export class GetUserByEmailRepositorySpy implements GetUserByEmailRepository {
  email = 'example@example.com';

  user: UserModel = {
    id: 'uuid',
    email: 'example@example.com',
    name: 'Example Exanple',
    password: 'superSecretHashPassword',
    username: 'example',
  };

  async getByEmail(email: string): Promise<UserModel | undefined> {
    this.email = email;

    return this.user;
  }

  simulateGetByEmailThrowError(): void {
    jest
      .spyOn(GetUserByEmailRepositorySpy.prototype, 'getByEmail')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateGetByEmailReturnsUndefined(): void {
    jest
      .spyOn(GetUserByEmailRepositorySpy.prototype, 'getByEmail')
      .mockResolvedValueOnce(undefined);
  }
}
