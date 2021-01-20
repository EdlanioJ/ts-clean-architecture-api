import { KafkaConfig, ProducerConfig } from 'kafkajs';

export const env = {
  port: process.env.PORT || 3333,
  salt: Number(process.env.BCRYPT_SALT),
  jwtSecret: process.env.APP_SECRET,
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: ['localhost:9092'],
    retry: { retries: 5, initialRetryTime: 300 },
  } as KafkaConfig,
  kafkaProducer: {
    allowAutoTopicCreation: true,
  } as ProducerConfig,
};
