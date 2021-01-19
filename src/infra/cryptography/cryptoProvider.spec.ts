import crypto from 'crypto';
import faker from 'faker';

import { CryptoProvider } from './cryptoAdapter';

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

const makeSut = (): CryptoProvider => {
  return new CryptoProvider();
};
describe('CryptoProvider', () => {
  it('Should call randomBytes with correct value', async () => {
    const sut = makeSut();
    const randomBytesSpy = jest.spyOn(crypto, 'randomBytes');

    const token = await sut.generate();

    expect(randomBytesSpy).toHaveBeenCalledWith(24);
    expect(typeof token).toBe('string');
  });
});
