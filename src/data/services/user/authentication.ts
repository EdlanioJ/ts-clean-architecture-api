import { Encrypter } from '@/data/protocols/cryptography/encrypter';
import { HashComparer } from '@/data/protocols/cryptography/hashComparer';
import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { AuthenticationError } from '@/domain/errors/user/authemtication';
import { Authentication } from '@/domain/useCases/user/authentication';

export class AuthenticationService implements Authentication {
  constructor(
    private readonly encrypter: Encrypter,
    private readonly getUserByEmailRepository: GetUserByEmailRepository,
    private readonly hashComparer: HashComparer
  ) {}

  async auth(
    authParams: Authentication.Params
  ): Promise<Authentication.Result> {
    const user = await this.getUserByEmailRepository.getByEmail(
      authParams.email
    );

    if (!user) throw new AuthenticationError('email');

    const isValid = await this.hashComparer.compare(
      authParams.password,
      user.password
    );

    if (!isValid) throw new AuthenticationError('password');

    const token = await this.encrypter.encrypt(user.id);

    return { token };
  }
}
