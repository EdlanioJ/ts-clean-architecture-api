export interface ResetPassword {
  add(param: ResetPassword.Param): Promise<ResetPassword.Result>;
}

export namespace ResetPassword {
  export type Param = string;

  export type Result = void;
}
