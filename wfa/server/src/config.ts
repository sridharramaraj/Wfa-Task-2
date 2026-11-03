import { fileURLToPath } from 'node:url';
export const config = {
  port: Number(process.env.PORT ?? 4000),
  dbFile: process.env.DB_FILE ?? fileURLToPath(new URL('../data/wfa.db', import.meta.url)),
};
