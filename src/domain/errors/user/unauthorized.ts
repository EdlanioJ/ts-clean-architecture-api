export class UnauthorizedError extends Error {
  private readonly field: string;

  constructor(field: string) {
    super(`Invalid ${field}`);
    this.field = field;
    this.name = 'UnauthorizedError';
  }
}
