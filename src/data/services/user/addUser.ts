import { Hasher } from '@/data/protocols/cryptography/hasher';
import { IDGenerator } from '@/data/protocols/cryptography/idGenerator';
import { AddUserRepository } from '@/data/protocols/db/user/addUserRepository';
import { GetUserByEmailRepository } from '@/data/protocols/db/user/getUserByEmail';
import { GetUserByUsernameRepository } from '@/data/protocols/db/user/getUserByUsernameRepository';
import { ParamInUseError } from '@/domain/errors/user/paramInUse';
import { AddUser } from '@/domain/useCases/user/addUser';

export class AddUserService implements AddUser {
  constructor(
    private readonly getUserByEmailRepository: GetUserByEmailRepository,
    private readonly getUserByUsernameRepository: GetUserByUsernameRepository,
    private readonly hasher: Hasher,
    private readonly idGenerator: IDGenerator,
    private readonly addUserRepository: AddUserRepository
  ) {}

  async add(params: AddUser.Params): Promise<AddUser.Result> {
    const getUserByEmail = await this.getUserByEmailRepository.getByEmail(
      params.email
    );

    if (getUserByEmail) throw new ParamInUseError('email');

    const getUserByUsername = await this.getUserByUsernameRepository.getByUsername(
      params.username
    );

    if (getUserByUsername) throw new ParamInUseError('username');

    const id = this.idGenerator.uuidv4();

    const passwordHash = await this.hasher.hash(params.password);

    const user = await this.addUserRepository.save({
      ...params,
      id,
      password: passwordHash,
    });

    return user;
  }
}
