import { ServerError } from '@/presentation/errors/serverError';
import { HttpResponse } from '@/presentation/protocols/http';

export const ok = (data: any): HttpResponse => ({ data, statusCode: 200 });

export const noContent = (): HttpResponse => ({
  statusCode: 204,
  data: null,
});

export const unauthorized = (error: any): HttpResponse => ({
  data: { message: error.message, ...error },
  statusCode: 401,
});

export const forbidden = (error: any): HttpResponse => ({
  data: { message: error.message, ...error, name: 'ForbiddenError' },
  statusCode: 403,
});

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  data: new ServerError(error.stack!),
});
