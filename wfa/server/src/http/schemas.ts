import { z } from 'zod';
import { ATTENDANCE_SORT_KEYS, ATTENDANCE_STATUSES, LOCATIONS, SORT_KEYS, STATUSES } from '../domain/types';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date');
const filterShape = {
  department: z.string().trim().min(1).max(60).optional(),
  location: z.enum(LOCATIONS).optional(),
  status: z.enum(STATUSES).optional(),
};

type Range = { from: string; to: string };
const isOrdered = (q: Range) => q.from <= q.to;
const isBounded = (q: Range) => (Date.parse(q.to) - Date.parse(q.from)) / 864e5 <= 365;

export const dashboardQuery = z.object({ from: date, to: date, ...filterShape }).refine(isOrdered, { message: '"from" must be on or before "to"', path: ['from'] }).refine(isBounded, { message: 'Date range cannot exceed 365 days', path: ['to'] });

export const attendanceQuery = z.object({
  from: date, to: date, ...filterShape,
  search: z.string().trim().max(80).optional(),
  attendance: z.enum(ATTENDANCE_STATUSES).optional(),
  sort: z.enum(ATTENDANCE_SORT_KEYS).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
}).refine(isOrdered, { message: '"from" must be on or before "to"', path: ['from'] }).refine(isBounded, { message: 'Date range cannot exceed 365 days', path: ['to'] });

export const employeesQuery = z.object({
  ...filterShape,
  search: z.string().trim().max(80).optional(),
  sort: z.enum(SORT_KEYS).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
