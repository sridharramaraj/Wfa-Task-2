import type { Db } from '../db/connection';
import type { EmployeeFilter, EmployeeRepository, EmployeeRow, EmployeeSortKey, ListOptions, Named, Page } from '../domain/types';
import { buildWhere } from './sql';

const FROM = 'FROM employees e JOIN departments d ON d.id = e.department_id';
// Whitelist: sort keys from the API are mapped to columns here, so user input never reaches ORDER BY.
const SORT_COLUMN: Record<EmployeeSortKey, string> = { name: 'e.name', department: 'd.name', location: 'e.location', status: 'e.status', joinedOn: 'e.joined_on' };
const GROUP_COLUMN = { department: 'd.name', location: 'e.location', status: 'e.status' } as const;

export class SqliteEmployeeRepository implements EmployeeRepository {
  constructor(private readonly db: Db) {}

  list(filter: EmployeeFilter, o: ListOptions): Page<EmployeeRow> {
    const { where, params } = buildWhere(filter, { search: o.search });
    const total = (this.db.prepare(`SELECT COUNT(*) AS n ${FROM} ${where}`).get(params) as { n: number }).n;
    const items = this.db.prepare(
      `SELECT e.id, e.name, e.email, e.designation, d.name AS department, e.location, e.status, e.joined_on AS joinedOn
       ${FROM} ${where} ORDER BY ${SORT_COLUMN[o.sort]} ${o.order === 'desc' ? 'DESC' : 'ASC'}, e.id ASC LIMIT @limit OFFSET @offset`,
    ).all({ ...params, limit: o.pageSize, offset: (o.page - 1) * o.pageSize }) as EmployeeRow[];
    return { items, total, page: o.page, pageSize: o.pageSize };
  }

  count(filter: EmployeeFilter): number {
    const { where, params } = buildWhere(filter);
    return (this.db.prepare(`SELECT COUNT(*) AS n ${FROM} ${where}`).get(params) as { n: number }).n;
  }

  countBy(field: 'department' | 'location' | 'status', filter: EmployeeFilter): Named[] {
    const col = GROUP_COLUMN[field]; const { where, params } = buildWhere(filter);
    return this.db.prepare(`SELECT ${col} AS name, COUNT(*) AS value ${FROM} ${where} GROUP BY ${col} ORDER BY value DESC, name ASC`).all(params) as Named[];
  }
}
