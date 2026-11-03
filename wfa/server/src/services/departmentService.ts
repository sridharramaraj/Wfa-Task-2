import type { AttendanceRepository, DateRange, DepartmentSummary, EmployeeFilter, EmployeeRepository } from '../domain/types';

export class DepartmentService {
  constructor(private readonly employees: EmployeeRepository, private readonly attendance: AttendanceRepository) {}

  /** Headcount per department plus attendance totals (person-days) across the selected range. */
  summary(range: DateRange, filter: EmployeeFilter): DepartmentSummary[] {
    const stats = new Map(this.attendance.byDepartment(range, filter).map((s) => [s.name, s]));
    return this.employees.countBy('department', filter).map(({ name, value }) => {
      const s = stats.get(name); const present = s?.present ?? 0; const absent = s?.absent ?? 0; const onLeave = s?.onLeave ?? 0;
      const roster = present + absent + onLeave;
      return { name, headcount: value, present, absent, onLeave, late: s?.late ?? 0, attendanceRate: roster ? Math.round((present / roster) * 1000) / 10 : 0 };
    });
  }
}
