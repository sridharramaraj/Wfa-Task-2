import type { Db } from '../db/connection';
import type { DepartmentRepository } from '../domain/types';

export class SqliteDepartmentRepository implements DepartmentRepository {
  constructor(private readonly db: Db) {}
  names(): string[] { return (this.db.prepare('SELECT name FROM departments ORDER BY name').all() as { name: string }[]).map((r) => r.name); }
}
