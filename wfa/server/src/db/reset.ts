import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config';
import { openDatabase } from './connection';
import { seedIfEmpty } from './seed';

mkdirSync(dirname(config.dbFile), { recursive: true });
for (const suffix of ['', '-wal', '-shm']) if (existsSync(config.dbFile + suffix)) rmSync(config.dbFile + suffix);
const db = openDatabase(config.dbFile);
seedIfEmpty(db);
console.log(`Database reset and re-seeded at ${config.dbFile}`);
db.close();
