import type { Db } from '../db/connection';
import { SqliteAttendanceRepository } from '../repositories/sqliteAttendanceRepository';
import { SqliteDepartmentRepository } from '../repositories/sqliteDepartmentRepository';
import { SqliteEmployeeRepository } from '../repositories/sqliteEmployeeRepository';
import { AttendanceService } from './attendanceService';
import { DashboardService } from './dashboardService';
import { DepartmentService } from './departmentService';
import { EmployeeService } from './employeeService';
import { MetaService } from './metaService';

export interface Services { dashboard: DashboardService; employees: EmployeeService; meta: MetaService; attendance: AttendanceService; departments: DepartmentService }

/** Composition root: the only place that knows which repository implementation is used. */
export function buildServices(db: Db): Services {
  const employees = new SqliteEmployeeRepository(db);
  const attendance = new SqliteAttendanceRepository(db);
  return {
    dashboard: new DashboardService(employees, attendance),
    attendance: new AttendanceService(attendance),
    departments: new DepartmentService(employees, attendance),
    employees: new EmployeeService(employees),
    meta: new MetaService(new SqliteDepartmentRepository(db)),
  };
}
