import { Router } from 'express';
import type { z } from 'zod';
import type { Services } from '../services';
import { HttpError } from './errors';
import { attendanceQuery, dashboardQuery, employeesQuery } from './schemas';

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw new HttpError(400, 'Invalid request parameters', result.error.flatten());
  return result.data;
}

export function createRouter(s: Services): Router {
  const r = Router();
  r.get('/health', (_req, res) => res.json({ status: 'ok' }));
  r.get('/meta', (_req, res) => res.json(s.meta.get()));
  r.get('/dashboard', (req, res) => {
    const { from, to, ...filter } = parse(dashboardQuery, req.query);
    res.json(s.dashboard.getDashboard({ from, to }, filter));
  });
  r.get('/attendance', (req, res) => {
    const { from, to, department, location, status, ...options } = parse(attendanceQuery, req.query);
    res.json(s.attendance.list({ from, to }, { department, location, status }, options));
  });
  r.get('/departments', (req, res) => {
    const { from, to, ...filter } = parse(dashboardQuery, req.query);
    res.json(s.departments.summary({ from, to }, filter));
  });
  r.get('/employees', (req, res) => {
    const { department, location, status, ...options } = parse(employeesQuery, req.query);
    res.json(s.employees.list({ department, location, status }, options));
  });
  return r;
}
