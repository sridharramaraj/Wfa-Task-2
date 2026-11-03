import { beforeAll, describe, expect, it } from 'vitest';
import { openDatabase } from './db/connection';
import { seedIfEmpty } from './db/seed';
import { dashboardQuery } from './http/schemas';
import { buildServices, type Services } from './services';

const to = new Date().toISOString().slice(0, 10);
const from = new Date(Date.now() - 13 * 864e5).toISOString().slice(0, 10);
let s: Services;
beforeAll(() => { const db = openDatabase(':memory:'); seedIfEmpty(db); s = buildServices(db); });

describe('dashboard service', () => {
  it('present + absent + on leave equals total employees on the reference day', () => {
    const k = s.dashboard.getDashboard({ from, to }, {}).kpis;
    expect(k.present.value + k.absent.value + k.onLeave.value).toBe(k.totalEmployees.value);
  });
  it('applies the department filter', () => {
    const all = s.dashboard.getDashboard({ from, to }, {}).kpis.totalEmployees.value;
    const eng = s.dashboard.getDashboard({ from, to }, { department: 'Engineering' });
    expect(eng.kpis.totalEmployees.value).toBeLessThan(all);
    expect(eng.byDepartment).toHaveLength(1);
  });
  it('returns zeros, not errors, for a range with no records', () => {
    const d = s.dashboard.getDashboard({ from: '2000-01-01', to: '2000-01-02' }, {});
    expect(d.asOf).toBeNull();
    expect(d.kpis.attendanceRate.value).toBe(0);
  });
});

describe('employee service', () => {
  it('paginates and sorts', () => {
    const p1 = s.employees.list({}, { sort: 'name', order: 'asc', page: 1, pageSize: 10 });
    const p2 = s.employees.list({}, { sort: 'name', order: 'asc', page: 2, pageSize: 10 });
    expect(p1.items).toHaveLength(10);
    expect(p2.items[0].id).not.toBe(p1.items[0].id);
    expect(p1.items[0].name.localeCompare(p1.items[9].name)).toBeLessThanOrEqual(0);
  });
  it('returns nothing for a search with no match', () => {
    expect(s.employees.list({}, { search: 'zzzz-no-match', sort: 'name', order: 'asc', page: 1, pageSize: 10 }).total).toBe(0);
  });
});

describe('request validation', () => {
  it('rejects inverted ranges, malformed dates and unknown locations', () => {
    expect(dashboardQuery.safeParse({ from: '2026-02-01', to: '2026-01-01' }).success).toBe(false);
    expect(dashboardQuery.safeParse({ from: 'yesterday', to: '2026-01-01' }).success).toBe(false);
    expect(dashboardQuery.safeParse({ from, to, location: 'Mars' }).success).toBe(false);
  });
});

describe('attendance records and departments', () => {
  const range = { from, to };
  const opts = { sort: 'date' as const, order: 'desc' as const, page: 1, pageSize: 10 };
  it('filters records by attendance status', () => {
    const r = s.attendance.list(range, {}, { ...opts, attendance: 'absent' });
    expect(r.total).toBeGreaterThan(0);
    expect(r.items.every((i) => i.status === 'absent' && i.checkIn === null)).toBe(true);
  });
  it('returns check-in and check-out for present records, newest first', () => {
    const r = s.attendance.list(range, {}, { ...opts, attendance: 'present' });
    expect(r.items[0].checkOut).not.toBeNull();
    expect(r.items[0].date >= r.items[9].date).toBe(true);
  });
  it('department headcounts add up to the total workforce', () => {
    const total = s.dashboard.getDashboard(range, {}).kpis.totalEmployees.value;
    expect(s.departments.summary(range, {}).reduce((n, d) => n + d.headcount, 0)).toBe(total);
  });
});
