import { type } from 'os';

export interface Authentication {
  auth: (params: Authentication.Params) => Promise<Authentication.Result>;
}

export namespace Authentication {
  export type Params = {
    name: string;
    password: string;
  };
  export type Result = {
    token: string;
  };
}
