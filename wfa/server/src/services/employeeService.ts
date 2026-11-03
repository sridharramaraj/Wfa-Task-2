import type { EmployeeFilter, EmployeeRepository, ListOptions } from '../domain/types';
export class EmployeeService {
  constructor(private readonly employees: EmployeeRepository) {}
  list(filter: EmployeeFilter, options: ListOptions) { return this.employees.list(filter, options); }
}
