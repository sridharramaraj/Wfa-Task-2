import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createApp } from './app';
import { config } from './config';
import { openDatabase } from './db/connection';
import { seedIfEmpty } from './db/seed';
import { buildServices } from './services';

mkdirSync(dirname(config.dbFile), { recursive: true });
const db = openDatabase(config.dbFile);
seedIfEmpty(db);
createApp(buildServices(db)).listen(config.port, () => console.log(`WFA API listening on http://localhost:${config.port}/api`));
