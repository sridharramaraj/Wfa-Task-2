import type { EmployeeFilter } from '../domain/types';

type Params = Record<string, string | number>;

/** Builds a parameterised WHERE clause. Values are always bound, never interpolated. */
export function buildWhere(filter: EmployeeFilter, extra: { clauses?: string[]; params?: Params; search?: string } = {}) {
  const clauses = [...(extra.clauses ?? [])];
  const params: Params = { ...(extra.params ?? {}) };
  if (filter.department) { clauses.push('d.name = @department'); params.department = filter.department; }
  if (filter.location) { clauses.push('e.location = @location'); params.location = filter.location; }
  if (filter.status) { clauses.push('e.status = @status'); params.status = filter.status; }
  if (extra.search) { clauses.push('(e.name LIKE @q OR e.email LIKE @q OR e.designation LIKE @q)'); params.q = `%${extra.search}%`; }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}
