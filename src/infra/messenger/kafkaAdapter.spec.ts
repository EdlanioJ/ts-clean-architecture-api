import { KafkaConfig, ProducerRecord } from 'kafkajs';

import { mockSendParams } from '@/data/tests/messenger/senderSpy';

import { KafkaAdapter } from './kafkaAdapter';

class ProducerSpy {
  sendParams: any;

  async connect() {
    return Promise.resolve();
  }

  async send(params: ProducerRecord) {
    this.sendParams = params;
  }

  async disconnect() {
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

const kafkaConfig: KafkaConfig = {
  clientId: 'app-test',
  brokers: ['kafka-test:9092'],
};

const makeSut = (): KafkaAdapter => {
  return new KafkaAdapter(kafkaConfig);
};

describe('Kafka Adapter', () => {
  it('Should call producer with correct values', async () => {
    const sut = makeSut();
    const connectSpy = jest.spyOn(producerSpy, 'connect');
    const disconnectSpy = jest.spyOn(producerSpy, 'disconnect');

    const mockParams = mockSendParams();
    const { topic, data } = mockParams;
    await sut.send(mockParams);

    expect(connectSpy).toHaveBeenCalled();
    expect(disconnectSpy).toHaveBeenCalled();
    expect(producerSpy.sendParams).toEqual(
      expect.objectContaining({
        topic,
        messages: [{ value: JSON.stringify(data) }],
      })
    );
  });

  it('Should throw producer.connect() throw', async () => {
    const sut = makeSut();
    jest.spyOn(producerSpy, 'connect').mockImplementationOnce(() => {
      throw new Error();
    });
    const promise = sut.send(mockSendParams());

    expect(promise).rejects.toThrowError();
  });

  it('Should call producer.send() with messages has any array', async () => {
    const sut = makeSut();

    const topic = 'send-email';
    const data = [
      { name: 'edlanio', email: 'edlanioj@gmail.com' },
      { name: 'tercio', email: 'tercio.raimundo@gmail.com' },
    ];

    await sut.send({ topic, data });
    expect(producerSpy.sendParams).toEqual(
      expect.objectContaining({
        topic,
        messages: data.map((message) => ({ value: JSON.stringify(message) })),
      })
    );
  });

  it('Should throw if producer.send() throw', async () => {
    const sut = makeSut();
    jest.spyOn(producerSpy, 'send').mockImplementationOnce(() => {
      throw new Error();
    });

    const promise = sut.send(mockSendParams());

    await expect(promise).rejects.toThrowError();
  });

  it('Should throw if producer.disconnect() throw', async () => {
    const sut = makeSut();
    jest.spyOn(producerSpy, 'disconnect').mockImplementationOnce(() => {
      throw new Error();
    });

    const promise = sut.send(mockSendParams());

    await expect(promise).rejects.toThrowError();
  });
});
