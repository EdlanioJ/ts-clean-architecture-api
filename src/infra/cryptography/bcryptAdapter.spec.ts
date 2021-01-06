import bcrypt from 'bcryptjs';

import { HashComparer } from '@/data/protocols/cryptography/hashComparer';
import { Hasher } from '@/data/protocols/cryptography/hasher';

jest.mock('bcryptjs', () => ({
  async hash(): Promise<string> {
    return 'hash';
  },
  async compare(): Promise<boolean> {
    return false;
  },
}));
class BcryptAdapter implements Hasher, HashComparer {
  constructor(private readonly salt: number) {}

  async hash(plaintext: string): Promise<string> {
    const digest = await bcrypt.hash(plaintext, this.salt);

    return digest;
  }

  async compare(plaintext: string, digest: string): Promise<boolean> {
    const isValid = bcrypt.compare(plaintext, digest);

    return isValid;
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

    it('Should return true when compare succeeds', async () => {
      const sut = makeSut();
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => true);
      const isValid = await sut.compare('any_value', 'any_hash');

      expect(isValid).toBe(true);
    });

    it('Should return false when compare fails', async () => {
      const sut = makeSut();
      const isValid = await sut.compare('any_value', 'any_hash');

      expect(isValid).toBe(false);
    });

    it('Should throw if compare throws', async () => {
      const sut = makeSut();
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => {
        throw new Error();
      });
      const promise = sut.compare('any_value', 'any_hash');
      await expect(promise).rejects.toThrow();
    });
  });
});
