export const LOCATIONS = ['Chennai', 'Bengaluru', 'Hyderabad', 'Remote'] as const;
export const STATUSES = ['Active', 'Probation', 'Notice period'] as const;
export const SORT_KEYS = ['name', 'department', 'location', 'status', 'joinedOn'] as const;
export type EmployeeSortKey = (typeof SORT_KEYS)[number];

export interface EmployeeFilter { department?: string; location?: string; status?: string }
export interface DateRange { from: string; to: string }
export interface EmployeeRow { id: number; name: string; email: string; designation: string; department: string; location: string; status: string; joinedOn: string }
export interface ListOptions { search?: string; sort: EmployeeSortKey; order: 'asc' | 'desc'; page: number; pageSize: number }
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number }
export interface Named { name: string; value: number }
export interface DayCounts { present: number; absent: number; onLeave: number; late: number }
export interface TrendPoint extends DayCounts { date: string }
export interface ExceptionRow { id: number; employee: string; department: string; date: string; kind: 'absent' | 'leave' | 'late' }

/** Repository contracts: services depend on these abstractions, never on SQLite directly. */
export interface EmployeeRepository {
  list(filter: EmployeeFilter, options: ListOptions): Page<EmployeeRow>;
  count(filter: EmployeeFilter): number;
  countBy(field: 'department' | 'location' | 'status', filter: EmployeeFilter): Named[];
}
export interface AttendanceRepository {
  latestDate(range: DateRange, filter: EmployeeFilter): string | null;
  dayCounts(date: string, filter: EmployeeFilter): DayCounts;
  trend(range: DateRange, filter: EmployeeFilter): TrendPoint[];
  exceptions(range: DateRange, filter: EmployeeFilter, limit: number): ExceptionRow[];
  list(range: DateRange, filter: EmployeeFilter, options: AttendanceListOptions): Page<AttendanceRow>;
  byDepartment(range: DateRange, filter: EmployeeFilter): DepartmentStats[];
}
export const ATTENDANCE_STATUSES = ['present', 'absent', 'leave', 'late'] as const;
export const ATTENDANCE_SORT_KEYS = ['date', 'employee', 'department', 'status'] as const;
export type AttendanceStatusFilter = (typeof ATTENDANCE_STATUSES)[number];
export type AttendanceSortKey = (typeof ATTENDANCE_SORT_KEYS)[number];
export interface AttendanceRow { id: number; date: string; employeeId: number; employee: string; department: string; location: string; status: 'present' | 'absent' | 'leave'; isLate: boolean; checkIn: string | null; checkOut: string | null }
export interface AttendanceListOptions { search?: string; attendance?: AttendanceStatusFilter; sort: AttendanceSortKey; order: 'asc' | 'desc'; page: number; pageSize: number }
export interface DepartmentStats extends DayCounts { name: string }
export interface DepartmentSummary { name: string; headcount: number; present: number; absent: number; onLeave: number; late: number; attendanceRate: number }

export interface DepartmentRepository { names(): string[] }
