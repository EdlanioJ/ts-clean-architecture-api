import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { AuthenticationError } from '@/domain/errors/user/authemtication';
import { Authentication } from '@/domain/useCases/user/authentication';

export class AuthenticationUseCase {
  constructor(
    private readonly getUserByEmailRepository: GetUserByEmailRepository
  ) {}

  async auth(authParams: Authentication.Params): Promise<void> {
    const user = await this.getUserByEmailRepository.getByEmail(
      authParams.email
    );

    if (!user) throw new AuthenticationError('email');
  }
}
