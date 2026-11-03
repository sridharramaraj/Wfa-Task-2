import { LOCATIONS, STATUSES, type DepartmentRepository } from '../domain/types';
export class MetaService {
  constructor(private readonly departments: DepartmentRepository) {}
  get() { return { departments: this.departments.names(), locations: [...LOCATIONS], statuses: [...STATUSES] }; }
}
