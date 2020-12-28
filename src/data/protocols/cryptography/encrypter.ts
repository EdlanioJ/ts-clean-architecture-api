export interface Encrypter {
  encrypt: (plaintext: string) => Promise<void>;
}
