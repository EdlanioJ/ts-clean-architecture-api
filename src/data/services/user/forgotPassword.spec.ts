import { UserRepository } from '@/data/protocols/db/user/userRepository';
import { mockAddUserParams } from '@/data/tests/db/user/mockAddUserParams';
import { UserRepositorySpy } from '@/data/tests/db/user/userRepositorySpy';

class ForgotPasswordService {
  constructor(private readonly userRepository: UserRepository) {}

  async add(email: string): Promise<void> {
    await this.userRepository.getByEmail(email);
  }
}

type SutType = {
  sut: ForgotPasswordService;
  userRepositorySpy: UserRepositorySpy;
};

const makeSut = (): SutType => {
  const userRepositorySpy = new UserRepositorySpy();
  const sut = new ForgotPasswordService(userRepositorySpy);

  return { sut, userRepositorySpy };
};
describe('Forgot Password Service', () => {
  it('Should call UserRepository getUserByEmail with correct email', async () => {
    const { sut, userRepositorySpy } = makeSut();
    const addUserParams = mockAddUserParams();

    await sut.add(addUserParams.email);

    expect(userRepositorySpy.email).toBe(addUserParams.email);
  });

  it('Should throws if userRepository.getByEmail throws', async () => {
    const { sut, userRepositorySpy } = makeSut();
    userRepositorySpy.simulateGetByEmailThrowError();

    const promise = sut.add(mockAddUserParams().email);

    await expect(promise).rejects.toThrowError();
  });
});
