export class MissingParamError extends Error {
  field: string;

  constructor(paramName: string) {
    super(`Missing param: ${paramName}`);
    this.name = 'MissingParamError';
    this.field = paramName;
  }
}
