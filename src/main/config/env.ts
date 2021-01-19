import { KafkaConfig, ProducerConfig } from 'kafkajs';

export const env = {
  port: process.env.PORT || 3333,
  salt: Number(process.env.BCRYPT_SALT),
  jwtSecret: process.env.APP_SECRET,
  kafka: {} as KafkaConfig,
  kafkaProducer: {} as ProducerConfig,
};
