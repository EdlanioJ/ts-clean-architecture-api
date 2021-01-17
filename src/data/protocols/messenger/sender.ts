export interface SendParams {
  topic: string;
  data: any;
}
export interface Sender {
  send: (params: SendParams) => Promise<void>;
}
