import { Filters, toParams } from '../types/filters';
import { get } from './http';
import { attendancePageSchema, dashboardSchema, departmentListSchema, employeePageSchema, metaSchema } from './schemas';

export interface EmployeeQuery { search: string; sort: string; order: 'asc' | 'desc'; page: number; pageSize: number }
export interface AttendanceQuery extends EmployeeQuery { attendance: string }

export const fetchMeta = (signal?: AbortSignal) => get('/meta', metaSchema, {}, signal);
export const fetchDashboard = (f: Filters, signal?: AbortSignal) => get('/dashboard', dashboardSchema, toParams(f), signal);
export const fetchDepartments = (f: Filters, signal?: AbortSignal) => get('/departments', departmentListSchema, toParams(f), signal);
export const fetchAttendance = (f: Filters, q: AttendanceQuery, signal?: AbortSignal) =>
  get('/attendance', attendancePageSchema, { ...toParams(f), ...q, attendance: q.attendance === 'All' ? undefined : q.attendance }, signal);
export const fetchEmployees = (f: Filters, q: EmployeeQuery, signal?: AbortSignal) => {
  const { from: _from, to: _to, ...filters } = toParams(f);
  return get('/employees', employeePageSchema, { ...filters, ...q }, signal);
};
