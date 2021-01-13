import v4 from 'uuidv4';

import { IDGenerator } from '@/data/protocols/cryptography/idGenerator';

export class UuidProvider implements IDGenerator {
  uuidv4(): string {
    return v4.uuid();
  }
}
