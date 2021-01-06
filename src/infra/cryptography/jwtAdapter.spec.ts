import jwt from 'jsonwebtoken';

class JwtAdapter {
  constructor(private readonly secret: string) {}

  async encrypt(plaintext: string) {
    await jwt.sign({ id: plaintext }, this.secret);
  }
}

const makeSut = (): JwtAdapter => {
  return new JwtAdapter('secret');
};
describe('jwt Adaper', () => {
  describe('sign', () => {
    it('Should call sign with correct values', async () => {
      const sut = makeSut();
      const signSpy = jest.spyOn(jwt, 'sign');
      await sut.encrypt('any_id');

      expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret');
    });
  });
});
