export interface ForgotPassword {
  add(param: ForgotPassword.Param): Promise<ForgotPassword.Result>;
}

export namespace ForgotPassword {
  export type Param = string;

  export type Result = void;
}
