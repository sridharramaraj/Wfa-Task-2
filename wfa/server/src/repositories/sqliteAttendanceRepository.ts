import type { Db } from '../db/connection';
import type { AttendanceListOptions, AttendanceRepository, AttendanceRow, AttendanceSortKey, AttendanceStatusFilter, DateRange, DayCounts, DepartmentStats, EmployeeFilter, ExceptionRow, Page, TrendPoint } from '../domain/types';
import { buildWhere } from './sql';

const FROM = 'FROM attendance a JOIN employees e ON e.id = a.employee_id JOIN departments d ON d.id = e.department_id';
const COUNTS = `COALESCE(SUM(a.status = 'present'), 0) AS present, COALESCE(SUM(a.status = 'absent'), 0) AS absent,
  COALESCE(SUM(a.status = 'leave'), 0) AS onLeave, COALESCE(SUM(a.is_late), 0) AS late`;

// Whitelists: API values are mapped to SQL fragments here, so user input never reaches the query text.
const SORT_COLUMN: Record<AttendanceSortKey, string> = { date: 'a.date', employee: 'e.name', department: 'd.name', status: 'a.status' };
const STATUS_CLAUSE: Record<AttendanceStatusFilter, string> = { present: "a.status = 'present'", absent: "a.status = 'absent'", leave: "a.status = 'leave'", late: 'a.is_late = 1' };

export class SqliteAttendanceRepository implements AttendanceRepository {
  constructor(private readonly db: Db) {}

  private inRange(filter: EmployeeFilter, range: DateRange) {
    return buildWhere(filter, { clauses: ['a.date BETWEEN @from AND @to'], params: { from: range.from, to: range.to } });
  }

  latestDate(range: DateRange, filter: EmployeeFilter): string | null {
    const { where, params } = this.inRange(filter, range);
    return (this.db.prepare(`SELECT MAX(a.date) AS d ${FROM} ${where}`).get(params) as { d: string | null }).d;
  }

  dayCounts(date: string, filter: EmployeeFilter): DayCounts {
    const { where, params } = buildWhere(filter, { clauses: ['a.date = @date'], params: { date } });
    return this.db.prepare(`SELECT ${COUNTS} ${FROM} ${where}`).get(params) as DayCounts;
  }

  trend(range: DateRange, filter: EmployeeFilter): TrendPoint[] {
    const { where, params } = this.inRange(filter, range);
    return this.db.prepare(`SELECT a.date AS date, ${COUNTS} ${FROM} ${where} GROUP BY a.date ORDER BY a.date ASC`).all(params) as TrendPoint[];
  }

  exceptions(range: DateRange, filter: EmployeeFilter, limit: number): ExceptionRow[] {
    const { where, params } = this.inRange(filter, range);
    const w = `${where} AND (a.status != 'present' OR a.is_late = 1)`;
    return this.db.prepare(
      `SELECT a.id AS id, e.name AS employee, d.name AS department, a.date AS date,
        CASE WHEN a.status = 'absent' THEN 'absent' WHEN a.status = 'leave' THEN 'leave' ELSE 'late' END AS kind
       ${FROM} ${w} ORDER BY a.date DESC, a.id DESC LIMIT @limit`,
    ).all({ ...params, limit }) as ExceptionRow[];
  }

  list(range: DateRange, filter: EmployeeFilter, o: AttendanceListOptions): Page<AttendanceRow> {
    const clauses = ['a.date BETWEEN @from AND @to']; if (o.attendance) clauses.push(STATUS_CLAUSE[o.attendance]);
    const { where, params } = buildWhere(filter, { clauses, params: { from: range.from, to: range.to }, search: o.search });
    const total = (this.db.prepare(`SELECT COUNT(*) AS n ${FROM} ${where}`).get(params) as { n: number }).n;
    const rows = this.db.prepare(
      `SELECT a.id AS id, a.date AS date, e.id AS employeeId, e.name AS employee, d.name AS department, e.location AS location,
        a.status AS status, a.is_late AS isLate, a.check_in AS checkIn, a.check_out AS checkOut
       ${FROM} ${where} ORDER BY ${SORT_COLUMN[o.sort]} ${o.order === 'desc' ? 'DESC' : 'ASC'}, a.date DESC, e.name ASC, a.id ASC LIMIT @limit OFFSET @offset`,
    ).all({ ...params, limit: o.pageSize, offset: (o.page - 1) * o.pageSize }) as (Omit<AttendanceRow, 'isLate'> & { isLate: number })[];
    return { items: rows.map((r) => ({ ...r, isLate: r.isLate === 1 })), total, page: o.page, pageSize: o.pageSize };
  }

  byDepartment(range: DateRange, filter: EmployeeFilter): DepartmentStats[] {
    const { where, params } = this.inRange(filter, range);
    return this.db.prepare(`SELECT d.name AS name, ${COUNTS} ${FROM} ${where} GROUP BY d.name`).all(params) as DepartmentStats[];
  }
}
