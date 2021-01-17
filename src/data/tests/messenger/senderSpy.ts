import faker from 'faker';

import { Sender, SendParams } from '@/data/protocols/messenger/sender';

export const mockSendParams = (): SendParams => ({
  topic: 'send-email',
  data: faker.random.objectElement(),
});

export class SenderSpy implements Sender {
  sendParams = mockSendParams();

  async send(params: SendParams): Promise<void> {
    Object.assign(this.sendParams, params);
  }

  simulateThrowError() {
    jest.spyOn(SenderSpy.prototype, 'send').mockImplementationOnce(() => {
      throw new Error();
    });
  }
}
