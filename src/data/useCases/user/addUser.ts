import { Hasher } from '@/data/protocols/cryptography/hasher';
import { UuidProvider } from '@/data/protocols/cryptography/uuidProvder';
import { AddUserRepository } from '@/data/protocols/db/user/addUserRepository';
import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { GetUserByUsernameRepository } from '@/data/protocols/db/user/getUserByUsernameRepository';
import { AddUser } from '@/domain/useCases/user/addUser';

export class AddUserUseCase implements AddUser {
  constructor(
    private readonly getUserByEmailRepository: GetUserByEmailRepository,
    private readonly getUserByUsernameRepository: GetUserByUsernameRepository,
    private readonly hasher: Hasher,
    private readonly uuidProvider: UuidProvider,
    private readonly addUserRepository: AddUserRepository
  ) {}

  async add(params: AddUser.Params): Promise<AddUser.Result> {
    const getUserByEmail = await this.getUserByEmailRepository.getByEmail(
      params.email
    );

    if (getUserByEmail) throw new Error();

    const getUserByUsername = await this.getUserByUsernameRepository.getByUsername(
      params.username
    );

    if (getUserByUsername) throw new Error();

    const id = this.uuidProvider.uuidv4();

    const passwordHash = await this.hasher.hash(params.password);

    const user = await this.addUserRepository.save({
      ...params,
      id,
      password: passwordHash,
    });

    return user;
  }
}
