import { Encrypter } from '@/data/protocols/cryptography/encrypter';

export class EncrypterSpy implements Encrypter {
  cyphertext = 'uuid';

  plaintext!: string;

  async encrypt(plaintext: string): Promise<string> {
    this.plaintext = plaintext;

    return this.cyphertext;
  }

  simulateEncryptThrowError(): void {
    jest.spyOn(EncrypterSpy.prototype, 'encrypt').mockImplementationOnce(() => {
      throw new Error();
    });
  }
}
