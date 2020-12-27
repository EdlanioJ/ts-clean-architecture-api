interface GetUserByEmailRepository {}

class GetUserByEmailRepositorySpy implements GetUserByEmailRepository {
  email = 'example@example.com';
}

class AuthenticationUseCase {
  constructor(
    private readonly getUserByEmailRepository: GetUserByEmailRepository
  ) {}
}

describe('Authentication UseCase', () => {
  it('Should call GetUserByEmailRepository with correct email', () => {
    const getUserByEmailRepository = new GetUserByEmailRepositorySpy();

    new AuthenticationUseCase(getUserByEmailRepository);

    expect(getUserByEmailRepository.email).toBe('example@example.com');
  });
});
