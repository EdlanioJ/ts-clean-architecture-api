import { HashComparer } from '@/data/protocols/cryptography/hashComparer';

export class HashComparerSpy implements HashComparer {
  plaintext!: string;

  digest!: string;

  isValid = true;

  async compare(plaintext: string, digest: string): Promise<boolean> {
    this.digest = digest;
    this.plaintext = plaintext;

    return this.isValid;
  }
}
