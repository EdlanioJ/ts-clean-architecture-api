import jwt from 'jsonwebtoken';

import { Encrypter } from '@/data/protocols/cryptography/encrypter';

jest.mock('jsonwebtoken', () => ({
  async sign(): Promise<string> {
    return 'any_token';
  },
}));
class JwtAdapter implements Encrypter {
  constructor(private readonly secret: string) {}

  async encrypt(plaintext: string): Promise<string> {
    const cyphertext = await jwt.sign({ id: plaintext }, this.secret);

    return cyphertext;
  }
}

const makeSut = (): JwtAdapter => {
  return new JwtAdapter('secret');
};
describe('jwt Adaper', () => {
  describe('sign', () => {
    it('Should call sign with correct values', async () => {
      const sut = makeSut();
      const signSpy = jest.spyOn(jwt, 'sign');
      await sut.encrypt('any_id');

      expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret');
    });

    it('Should return a token on sign success', async () => {
      const sut = makeSut();
      const accessToken = await sut.encrypt('any_id');
      expect(accessToken).toBe('any_token');
    });

    it('Should throw if sign throws', async () => {
      const sut = makeSut();
      jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
        throw new Error();
      });
      const promise = sut.encrypt('any_id');
      await expect(promise).rejects.toThrow();
    });
  });
});
