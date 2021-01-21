// **MOCK MUST BE CHANGED**
import { KafkaConfig, ProducerRecord } from 'kafkajs';

class Producer {
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

jest.mock('kafkajs', () => ({
  Kafka: class {
    brokers: any;

    clientId: any;

    topics: any;

    constructor(config: KafkaConfig) {
      this.brokers = config.brokers;
      this.clientId = config.clientId;
      this.topics = {};
    }

    sendCb({ topic, messages }: ProducerRecord) {
      messages.forEach((message) => {
        console.log(topic, this.topics[topic]);
        Object.assign(this.topics[topic]).forEach((consumers: any) => {
          const consumerToGetMessage = Math.floor(
            Math.random() * consumers.length
          );
          consumers[consumerToGetMessage].eachMessage({
            message,
          });
        });
      });
    }

    producer() {
      return new Producer();
    }
  },
}));
