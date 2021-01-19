import { randomBytes } from 'crypto';
import { promisify } from 'util';

import { GenerateToken } from '@/data/protocols/cryptography/generateToken';

export class CryptoProvider implements GenerateToken {
  async generate(): Promise<string> {
    const random = await promisify(randomBytes)(24);

    const token = random.toString('hex');

    return token;
  }
}
