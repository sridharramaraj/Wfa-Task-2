export interface Filters { from: string; to: string; department: string; location: string; status: string }
export const ALL = 'All';

export const isoDay = (daysAgo = 0) => new Date(Date.now() - daysAgo * 864e5).toISOString().slice(0, 10);
export const defaultFilters = (): Filters => ({ from: isoDay(13), to: isoDay(0), department: ALL, location: ALL, status: ALL });

const ISO = /^\d{4}-\d{2}-\d{2}$/;
/** Returns an error message, or null when the filters are valid. */
export function validateFilters(f: Pick<Filters, 'from' | 'to'>): string | null {
  if (!ISO.test(f.from) || !ISO.test(f.to)) return 'Choose a valid date range.';
  if (f.from > f.to) return '"From" must be on or before "To".';
  if ((Date.parse(f.to) - Date.parse(f.from)) / 864e5 > 365) return 'The date range cannot exceed one year.';
  return null;
}

const opt = (v: string) => (v === ALL ? undefined : v);
export const toParams = (f: Filters) => ({ from: f.from, to: f.to, department: opt(f.department), location: opt(f.location), status: opt(f.status) });
