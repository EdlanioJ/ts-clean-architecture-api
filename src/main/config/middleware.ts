import { Express } from 'express';

import { bodyParser } from '../middlewares/bodyParser';

export const setupMiddlewares = (app: Express) => {
  app.use(bodyParser);
};
