import type { AttendanceRepository, DateRange, DayCounts, EmployeeFilter, EmployeeRepository, ExceptionRow, Named, TrendPoint } from '../domain/types';

export interface Metric { value: number; delta: number | null }
export interface DashboardDto {
  asOf: string | null;
  kpis: { totalEmployees: Metric; present: Metric; absent: Metric; onLeave: Metric; attendanceRate: Metric };
  trend: TrendPoint[];
  byDepartment: Named[]; byStatus: Named[]; byLocation: Named[];
  exceptions: ExceptionRow[];
}

const ZERO: DayCounts = { present: 0, absent: 0, onLeave: 0, late: 0 };
const sum = (pts: TrendPoint[], k: 'present' | 'absent' | 'onLeave') => pts.reduce((s, p) => s + p[k], 0);
/** Attendance rate = present ÷ (present + absent + on leave), as a percentage with one decimal. */
const rateOf = (pts: TrendPoint[]) => {
  const present = sum(pts, 'present'); const roster = present + sum(pts, 'absent') + sum(pts, 'onLeave');
  return roster ? Math.round((present / roster) * 1000) / 10 : 0;
};

export class DashboardService {
  constructor(private readonly employees: EmployeeRepository, private readonly attendance: AttendanceRepository) {}

  getDashboard(range: DateRange, filter: EmployeeFilter): DashboardDto {
    const trend = this.attendance.trend(range, filter);
    const asOf = trend.length ? trend[trend.length - 1].date : null;
    const today = asOf ? this.attendance.dayCounts(asOf, filter) : ZERO;
    const prev = trend.length > 1 ? trend[trend.length - 2] : null;
    const diff = (now: number, before: number | undefined) => (prev && before !== undefined ? now - before : null);
    const half = Math.floor(trend.length / 2);
    const rateDelta = trend.length > 3 ? Math.round((rateOf(trend.slice(half)) - rateOf(trend.slice(0, half))) * 10) / 10 : null;

    return {
      asOf,
      kpis: {
        totalEmployees: { value: this.employees.count(filter), delta: null },
        present: { value: today.present, delta: diff(today.present, prev?.present) },
        absent: { value: today.absent, delta: diff(today.absent, prev?.absent) },
        onLeave: { value: today.onLeave, delta: diff(today.onLeave, prev?.onLeave) },
        attendanceRate: { value: rateOf(trend), delta: rateDelta },
      },
      trend,
      byDepartment: this.employees.countBy('department', filter),
      byStatus: this.employees.countBy('status', filter),
      byLocation: this.employees.countBy('location', filter),
      exceptions: this.attendance.exceptions(range, filter, 8),
    };
  }
}
