import { UuidProvider } from './uuidProvider';

jest.mock('uuid', () => ({
  v4: () => 'uuid',
}));

const makeSut = (): UuidProvider => {
  return new UuidProvider();
};

describe('UUID Provider', () => {
  it('Should return a valid uuid', () => {
    const sut = makeSut();
    const uuid = sut.uuidv4();

    expect(uuid).toBe('uuid');
  });
});
