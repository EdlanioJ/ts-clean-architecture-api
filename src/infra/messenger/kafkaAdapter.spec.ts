import kafka, { Kafka, KafkaConfig, ProducerRecord } from 'kafkajs';

import { SendParams } from '@/data/protocols/messenger/sender';
import { mockSendParams } from '@/data/tests/messenger/senderSpy';

class ProducerSpy {
  sendCb: any;

  async connect() {
    return Promise.resolve();
  }
}

const producerSpy = new ProducerSpy();
jest.mock('kafkajs', () => ({
  Kafka: class {
    producer() {
      return producerSpy;
    }
  },
}));

class KafkaAdapter {
  private readonly kafka: Kafka;

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka(config);
  }

  async send(params: SendParams): Promise<void> {
    const producer = this.kafka.producer();

    await producer.connect();
  }
}
const kafkaConfig: KafkaConfig = {
  clientId: 'app-test',
  brokers: ['kafka-test:9092'],
};

const makeSut = (): KafkaAdapter => {
  return new KafkaAdapter(kafkaConfig);
};

describe('Kafka Adapter', () => {
  it('Should call producer.connect()', async () => {
    const sut = makeSut();
    const connectSpy = jest.spyOn(producerSpy, 'connect');
    await sut.send(mockSendParams());

    expect(connectSpy).toHaveBeenCalled();
  });

  it('Should throw producer.connect() throw', async () => {
    const sut = makeSut();
    jest.spyOn(producerSpy, 'connect').mockImplementationOnce(() => {
      throw new Error();
    });
    const promise = sut.send(mockSendParams());

    expect(promise).rejects.toThrowError();
  });
});
