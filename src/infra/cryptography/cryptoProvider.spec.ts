import crypto, { randomBytes } from 'crypto';
import faker from 'faker';
import { promisify } from 'util';

import { GenerateToken } from '@/data/protocols/cryptography/generateToken';

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

class CryptoProvider implements GenerateToken {
  async generate(): Promise<string> {
    const random = await promisify(randomBytes)(24);

    const token = random.toString('hex');

    return token;
  }
}
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
