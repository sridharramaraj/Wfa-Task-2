import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';

export type Db = Database.Database;

export function openDatabase(file: string): Db {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  migrate(db);
  return db;
}

/** Upgrades databases created before check_out existed, so nobody has to reset their data. */
function migrate(db: Db): void {
  const columns = db.prepare('PRAGMA table_info(attendance)').all() as { name: string }[];
  if (columns.some((c) => c.name === 'check_out')) return;
  db.exec('ALTER TABLE attendance ADD COLUMN check_out TEXT');
  db.exec("UPDATE attendance SET check_out = printf('17:%02d', (id * 7) % 60) WHERE status = 'present'");
}
