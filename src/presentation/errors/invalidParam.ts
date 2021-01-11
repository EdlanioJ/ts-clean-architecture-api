export class InvalidParamError extends Error {
  field: string;

  constructor(paramName: string) {
    super(`Invalid param ${paramName}`);
    this.name = 'InvalidParamError';
    this.field = paramName;
  }
}
