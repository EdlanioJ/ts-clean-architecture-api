import { Express } from 'express';

import { bodyParser } from '../middlewares/bodyParser';
import { contentType } from '../middlewares/contentType';
import { cors } from '../middlewares/cors';

export const setupMiddlewares = (app: Express) => {
  app.use(bodyParser);
  app.use(cors);
  app.use(contentType);
};
