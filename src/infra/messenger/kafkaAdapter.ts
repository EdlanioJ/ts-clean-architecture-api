import { Kafka, KafkaConfig, ProducerConfig } from 'kafkajs';

import { SendParams, Sender } from '@/data/protocols/messenger/sender';

export class KafkaAdapter implements Sender {
  private readonly kafka: Kafka;

  producerConfig?: ProducerConfig;

  constructor(kafkaConfig: KafkaConfig, producerConfig?: ProducerConfig) {
    this.kafka = new Kafka(kafkaConfig);
    this.producerConfig = producerConfig;
  }

  async send(params: SendParams): Promise<void> {
    const producer = this.kafka.producer(this.producerConfig);

    await producer.connect();

    const { topic, data } = params;

    const messages = [];

    if (Array.isArray(data)) {
      data.forEach((message) => {
        messages.push({ value: JSON.stringify(message) });
      });
    } else {
      messages.push({ value: JSON.stringify(data) });
    }

    await producer.send({ messages, topic });

    await producer.disconnect();
  }
}
