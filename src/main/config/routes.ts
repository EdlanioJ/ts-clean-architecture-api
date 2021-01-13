import { Express, Router } from 'express';
import { readdirSync } from 'fs';
import path from 'path';

export const setupRoutes = (app: Express): void => {
  const router = Router();

  app.use('/api/v1', router);
  readdirSync(`${__dirname}/../routes`).map(async (fileName) => {
    if (!fileName.includes('.spec.')) {
      (await import(path.resolve(__dirname, '..', 'routes', fileName))).default(
        router
      );
    }
  });
};
