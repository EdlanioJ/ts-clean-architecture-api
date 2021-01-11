export class ParamInUseError extends Error {
  field: string;

  constructor(field: string) {
    super(`received ${field} is already in use`);
    this.name = 'ParamInUseError';
    this.field = field;
  }
}
