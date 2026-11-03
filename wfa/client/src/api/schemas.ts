import { z } from 'zod';

const metric = z.object({ value: z.number(), delta: z.number().nullable() });
const named = z.object({ name: z.string(), value: z.number() });

export const dashboardSchema = z.object({
  asOf: z.string().nullable(),
  kpis: z.object({ totalEmployees: metric, present: metric, absent: metric, onLeave: metric, attendanceRate: metric }),
  trend: z.array(z.object({ date: z.string(), present: z.number(), absent: z.number(), onLeave: z.number(), late: z.number() })),
  byDepartment: z.array(named), byStatus: z.array(named), byLocation: z.array(named),
  exceptions: z.array(z.object({ id: z.number(), employee: z.string(), department: z.string(), date: z.string(), kind: z.enum(['absent', 'leave', 'late']) })),
});

export const employeeSchema = z.object({ id: z.number(), name: z.string(), email: z.string(), designation: z.string(), department: z.string(), location: z.string(), status: z.string(), joinedOn: z.string() });
export const employeePageSchema = z.object({ items: z.array(employeeSchema), total: z.number(), page: z.number(), pageSize: z.number() });
export const metaSchema = z.object({ departments: z.array(z.string()), locations: z.array(z.string()), statuses: z.array(z.string()) });

export const attendanceRowSchema = z.object({
  id: z.number(), date: z.string(), employeeId: z.number(), employee: z.string(), department: z.string(), location: z.string(),
  status: z.enum(['present', 'absent', 'leave']), isLate: z.boolean(), checkIn: z.string().nullable(), checkOut: z.string().nullable(),
});
export const attendancePageSchema = z.object({ items: z.array(attendanceRowSchema), total: z.number(), page: z.number(), pageSize: z.number() });
export const departmentSummarySchema = z.object({ name: z.string(), headcount: z.number(), present: z.number(), absent: z.number(), onLeave: z.number(), late: z.number(), attendanceRate: z.number() });
export const departmentListSchema = z.array(departmentSummarySchema);

export type AttendanceRow = z.infer<typeof attendanceRowSchema>;
export type AttendancePage = z.infer<typeof attendancePageSchema>;
export type DepartmentSummary = z.infer<typeof departmentSummarySchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type EmployeePage = z.infer<typeof employeePageSchema>;
export type Meta = z.infer<typeof metaSchema>;
