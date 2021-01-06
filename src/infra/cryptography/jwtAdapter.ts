import jwt from 'jsonwebtoken';

import { Decrypter } from '@/data/protocols/cryptography/decrypter';
import { Encrypter } from '@/data/protocols/cryptography/encrypter';

export class JwtAdapter implements Encrypter, Decrypter {
  constructor(private readonly secret: string) {}

  async encrypt(plaintext: string): Promise<string> {
    const cyphertext = await jwt.sign({ id: plaintext }, this.secret);

    return cyphertext;
  }

  async decrypt(ciphertext: string): Promise<string | object> {
    const plaintext = await jwt.verify(ciphertext, this.secret);

    return plaintext;
  }
}
