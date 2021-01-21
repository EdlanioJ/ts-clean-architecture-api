export interface ResetPassword {
  exec: (params: ResetPassword.Params) => Promise<ResetPassword.Result>;
}

export namespace ResetPassword {
  export type Params = {
    token: string;
    password: string;
  };

  export type Result = void;
}
