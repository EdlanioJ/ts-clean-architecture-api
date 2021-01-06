import bcrypt from 'bcryptjs';

import { HashComparer } from '@/data/protocols/cryptography/hashComparer';
import { Hasher } from '@/data/protocols/cryptography/hasher';

export class BcryptAdapter implements Hasher, HashComparer {
  constructor(private readonly salt: number) {}

  async hash(plaintext: string): Promise<string> {
    const digest = await bcrypt.hash(plaintext, this.salt);

    return digest;
  }

  async compare(plaintext: string, digest: string): Promise<boolean> {
    const isValid = await bcrypt.compare(plaintext, digest);

    return isValid;
  }
}
