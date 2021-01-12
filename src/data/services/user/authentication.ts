import { Encrypter } from '@/data/protocols/cryptography/encrypter';
import { HashComparer } from '@/data/protocols/cryptography/hashComparer';
import { UserRepository } from '@/data/protocols/db/user/userRepository';
import { UnauthorizedError } from '@/domain/errors/user/unauthorized';
import { Authentication } from '@/domain/useCases/user/authentication';

export class AuthenticationService implements Authentication {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly encrypter: Encrypter,
    private readonly hashComparer: HashComparer
  ) {}

  async auth(
    authParams: Authentication.Params
  ): Promise<Authentication.Result> {
    const user = await this.userRepository.getByEmail(authParams.email);

    if (!user) throw new UnauthorizedError('email');

    const isValid = await this.hashComparer.compare(
      authParams.password,
      user.password
    );

    if (!isValid) throw new UnauthorizedError('password');

    const token = await this.encrypter.encrypt(user.id);

    return { token };
  }
}
