import type { AttendanceListOptions, AttendanceRepository, DateRange, EmployeeFilter } from '../domain/types';
export class AttendanceService {
  constructor(private readonly attendance: AttendanceRepository) {}
  list(range: DateRange, filter: EmployeeFilter, options: AttendanceListOptions) { return this.attendance.list(range, filter, options); }
}
