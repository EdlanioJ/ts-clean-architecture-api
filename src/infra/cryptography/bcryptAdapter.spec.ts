import bcrypt from 'bcryptjs';

import { Hasher } from '@/data/protocols/cryptography/hasher';

jest.mock('bcryptjs', () => ({
  async hash(): Promise<string> {
    return 'hash';
  },
  async compare(): Promise<boolean> {
    return false;
  },
}));
class BcryptAdapter implements Hasher {
  constructor(private readonly salt: number) {}

  async hash(plaintext: string): Promise<string> {
    const digest = await bcrypt.hash(plaintext, this.salt);

    return digest;
  }

  async compare(plaintext: string, digest: string): Promise<void> {
    bcrypt.compare(plaintext, digest);
  }
}
const salt = 12;

const makeSut = (): BcryptAdapter => {
  return new BcryptAdapter(salt);
};
describe('Bcrypt Adapter', () => {
  describe('hash', () => {
    it('Should call hash with correct values', async () => {
      const sut = makeSut();
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      await sut.hash('any_value');

      expect(hashSpy).toHaveBeenCalledWith('any_value', salt);
    });

    it('Should return a valid hash on hash success', async () => {
      const sut = makeSut();
      const hash = await sut.hash('any_value');

      expect(hash).toBe('hash');
    });

    it('Should throw if hash throws', async () => {
      const sut = makeSut();
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
        throw new Error();
      });
      const promise = sut.hash('any_value');

      await expect(promise).rejects.toThrow();
    });
  });

  describe('compare', () => {
    it('Should call compare with correct values', async () => {
      const sut = makeSut();
      const compareSpy = jest.spyOn(bcrypt, 'compare');
      await sut.compare('any_value', 'any_hash');

      expect(compareSpy).toHaveBeenCalledWith('any_value', 'any_hash');
    });
  });
});
