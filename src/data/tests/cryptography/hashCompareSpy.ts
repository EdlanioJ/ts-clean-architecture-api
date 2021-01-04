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

  simulateCompareThrowError(): void {
    jest
      .spyOn(HashComparerSpy.prototype, 'compare')
      .mockImplementationOnce(() => {
        throw new Error();
      });
  }

  simulateCompareReturnsFalse(): void {
    jest
      .spyOn(HashComparerSpy.prototype, 'compare')
      .mockResolvedValueOnce(false);
  }
}
