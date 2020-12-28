export interface Encrypter {
  hash: (plaintext: string) => Promise<void>;
}
