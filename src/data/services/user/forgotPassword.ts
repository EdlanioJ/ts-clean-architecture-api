import { GenerateToken } from '@/data/protocols/cryptography/generateToken';
import { TokenRepository } from '@/data/protocols/db/token/tokenRepository';
import { UserRepository } from '@/data/protocols/db/user/userRepository';
import { Sender } from '@/data/protocols/messenger/sender';
import { UnauthorizedError } from '@/domain/errors/user/unauthorized';
import { ForgotPassword } from '@/domain/useCases/user/forgotPassword';

export class ForgotPasswordService implements ForgotPassword {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly generateToken: GenerateToken,
    private readonly sender: Sender
  ) {}

  async add(email: ForgotPassword.Param): Promise<ForgotPassword.Result> {
    const user = await this.userRepository.getByEmail(email);

    if (!user) throw new UnauthorizedError('email');

    const token = await this.generateToken.generate();

    const tokenData = await this.tokenRepository.save({
      token,
      user_id: user.id,
    });

    const template = 'reset_password';
    const data = {
      template,
      token: tokenData.token,
      user: { name: tokenData.user.name, email: tokenData.user.email },
    };

    await this.sender.send({ topic: 'send-email', data });
  }
}
