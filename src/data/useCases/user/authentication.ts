import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { Authentication } from '@/domain/useCases/user/authentication';

export class AuthenticationUseCase {
  constructor(
    private readonly getUserByEmailRepository: GetUserByEmailRepository
  ) {}

  async auth(authParams: Authentication.Params): Promise<void> {
    await this.getUserByEmailRepository.getByEmail(authParams.email);
  }
}
