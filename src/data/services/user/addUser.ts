import { Hasher } from '@/data/protocols/cryptography/hasher';
import { IDGenerator } from '@/data/protocols/cryptography/idGenerator';
import { UserRepository } from '@/data/protocols/db/user/userRepository';
import { ParamInUseError } from '@/domain/errors/user/paramInUse';
import { AddUser } from '@/domain/useCases/user/addUser';

export class AddUserService implements AddUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: Hasher,
    private readonly idGenerator: IDGenerator
  ) {}

  async add(params: AddUser.Params): Promise<AddUser.Result> {
    const getUserByEmail = await this.userRepository.getByEmail(params.email);

    if (getUserByEmail) throw new ParamInUseError('email');

    const getUserByUsername = await this.userRepository.getByUsername(
      params.username
    );

    if (getUserByUsername) throw new ParamInUseError('username');

    const id = this.idGenerator.uuidv4();

    const passwordHash = await this.hasher.hash(params.password);

    const user = await this.userRepository.save({
      ...params,
      id,
      password: passwordHash,
    });

    return user;
  }
}
