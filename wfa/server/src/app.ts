import cors from 'cors';
import express from 'express';
import { errorHandler } from './http/errors';
import { createRouter } from './http/routes';
import type { Services } from './services';

export function createApp(services: Services) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', createRouter(services));
  app.use((_req, res) => res.status(404).json({ error: { message: 'Not found' } }));
  app.use(errorHandler);
  return app;
}
