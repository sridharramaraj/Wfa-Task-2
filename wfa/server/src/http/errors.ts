import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(readonly status: number, message: string, readonly details?: unknown) { super(message); }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  console.error(err);
  return res.status(500).json({ error: { message: 'Internal server error' } });
};
