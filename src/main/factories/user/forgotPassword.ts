import { ForgotPasswordService } from '@/data/services/user/forgotPassword';
import { CryptoProvider } from '@/infra/cryptography/cryptoAdapter';
import { TokenPrismaRepository } from '@/infra/db/prisma/token/tokenPrismaRepository';
import { UserPrismaRepository } from '@/infra/db/prisma/user/userPrismaRepository';
import { KafkaAdapter } from '@/infra/messenger/kafkaAdapter';
import { env } from '@/main/config/env';
import { ForgotPasswordController } from '@/presentation/controllers/user/forgotPassword';
import { Controller } from '@/presentation/protocols/controller';

export const makeForgotPasswordController = (): Controller => {
  const userRepo = new UserPrismaRepository();
  const tokenRepo = new TokenPrismaRepository();
  const crypto = new CryptoProvider();
  const kafka = new KafkaAdapter(env.kafka, env.kafkaProducer);
  const forgotPassword = new ForgotPasswordService(
    userRepo,
    tokenRepo,
    crypto,
    kafka
  );

  return new ForgotPasswordController(forgotPassword);
};
