import { Request, Response } from 'express';

import { Controller } from '@/presentation/protocols/controller';

export const adaptRoute = (controller: Controller) => {
  return async (request: Request, response: Response) => {
    const httpResponse = await controller.handle({
      body: request.body,
      headers: request.headers,
      params: request.params,
      userId: request.userId,
    });

    response.status(httpResponse.statusCode).json(httpResponse.data);
  };
};
