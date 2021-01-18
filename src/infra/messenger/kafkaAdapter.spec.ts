import kafka, { Kafka, KafkaConfig, ProducerRecord } from 'kafkajs';

import { SendParams } from '@/data/protocols/messenger/sender';
import { mockSendParams } from '@/data/tests/messenger/senderSpy';

class ProducerSpy {
  sendParams: any;

  async connect() {
    return Promise.resolve();
  }

  async send(params: ProducerRecord) {
    this.sendParams = params;
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

    const { topic, data } = params;
    const message = String(data);

    await producer.send({ messages: [{ value: message }], topic });
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

  it('Should call producer.send() with corrects values', async () => {
    const sut = makeSut();

    const mockParams = mockSendParams();
    const { topic, data } = mockParams;
    await sut.send(mockParams);

    expect(producerSpy.sendParams).toEqual(
      expect.objectContaining({ topic, messages: [{ value: String(data) }] })
    );
  });
});
