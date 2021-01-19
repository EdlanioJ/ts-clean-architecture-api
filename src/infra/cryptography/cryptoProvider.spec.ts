import crypto, { randomBytes } from 'crypto';
import faker from 'faker';
import { promisify } from 'util';

jest.mock('crypto', () => ({
  randomBytes: (size: number) => {
    const random = faker.random.alphaNumeric(size);
    return Buffer.from(random);
  },
}));

jest.mock('util', () => ({
  promisify: (value: any) => {
    return value;
  },
}));

class CryptoProvider {
  async generate(): Promise<void> {
    await promisify(randomBytes)(24);
  }
}
const makeSut = (): CryptoProvider => {
  return new CryptoProvider();
};
describe('CryptoProvider', () => {
  it('Should call randomBytes with correct value', async () => {
    const sut = makeSut();
    const randomBytesSpy = jest.spyOn(crypto, 'randomBytes');

    await sut.generate();

    expect(randomBytesSpy).toHaveBeenCalledWith(24);
  });
});
