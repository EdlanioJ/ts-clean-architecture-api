import bcrypt from 'bcryptjs';

class BcryptAdapter {
  constructor(private readonly salt: number) {}

  async hash(plaintext: string): Promise<void> {
    await bcrypt.hash(plaintext, this.salt);
  }
}
const salt = 12;

const makeSut = (): BcryptAdapter => {
  return new BcryptAdapter(salt);
};
describe('Bcrypt Adapter', () => {
  describe('hash', () => {
    it('Should call hash with correct values', async () => {
      const sut = makeSut();
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      await sut.hash('any_value');

      expect(hashSpy).toHaveBeenCalledWith('any_value', salt);
    });
  });
});
