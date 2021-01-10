import { Http2ServerResponse } from 'http2';

import { HttpRequest, HttpResponse } from './http';

export interface Controller {
  handle: (httpRequest: HttpRequest) => Promise<HttpResponse>;
}
