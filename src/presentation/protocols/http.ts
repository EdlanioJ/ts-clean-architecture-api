export interface HttpRequest {
  body?: any;
  headers?: any;
  params?: any;
  userId?: string;
}

export interface HttpResponse<T = any> {
  statusCode: number;
  data: T;
}
