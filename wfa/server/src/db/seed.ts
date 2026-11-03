import type { Db } from './connection';

const DEPARTMENTS: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'QA Engineer', 'DevOps Engineer', 'Tech Lead'],
  Design: ['UI/UX Designer', 'Product Designer', 'Design Lead'],
  Sales: ['Account Executive', 'Sales Manager', 'Business Developer'],
  Operations: ['Operations Analyst', 'Project Coordinator', 'Operations Manager'],
  Finance: ['Accountant', 'Financial Analyst', 'Finance Manager'],
  People: ['HR Executive', 'Recruiter', 'People Partner'],
};
const WEIGHTED = ['Engineering', 'Engineering', 'Engineering', 'Design', 'Sales', 'Sales', 'Operations', 'Operations', 'Finance', 'People'];
const LOCATIONS = ['Chennai', 'Chennai', 'Bengaluru', 'Bengaluru', 'Hyderabad', 'Remote'];
const FIRST = ['Aarav', 'Meera', 'Karthik', 'Divya', 'Rahul', 'Ananya', 'Vikram', 'Priya', 'Sanjay', 'Nisha', 'Arjun', 'Kavya', 'Ishaan', 'Lakshmi', 'Rohan', 'Sneha', 'Harini', 'Deepak', 'Pooja', 'Suresh'];
const LAST = ['Raman', 'Iyer', 'Nair', 'Reddy', 'Kumar', 'Menon', 'Das', 'Pillai', 'Sharma', 'Naidu', 'Gupta', 'Subramanian', 'Krishnan', 'Rao'];

function mulberry32(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Populates an empty database with deterministic demo data. No-op if employees already exist. */
export function seedIfEmpty(db: Db, today = new Date(), employeeCount = 220, historyDays = 75): void {
  if ((db.prepare('SELECT COUNT(*) AS n FROM employees').get() as { n: number }).n > 0) return;
  const rand = mulberry32(2026);
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(rand() * a.length)];
  const day = (n: number) => iso(new Date(today.getTime() - n * 864e5));

  const insertDept = db.prepare('INSERT INTO departments (name) VALUES (?)');
  const insertEmp = db.prepare('INSERT INTO employees (name, email, designation, department_id, location, status, joined_on) VALUES (?,?,?,?,?,?,?)');
  const insertAtt = db.prepare('INSERT INTO attendance (employee_id, date, status, check_in, check_out, is_late) VALUES (?,?,?,?,?,?)');

  db.transaction(() => {
    const deptIds = new Map<string, number>();
    for (const name of Object.keys(DEPARTMENTS)) deptIds.set(name, Number(insertDept.run(name).lastInsertRowid));

    const people: { id: number; joined: string }[] = [];
    for (let i = 0; i < employeeCount; i++) {
      const dept = pick(WEIGHTED); const first = pick(FIRST); const last = pick(LAST);
      const recent = rand() < 0.08;
      const joined = recent ? day(12 + Math.floor(rand() * 58)) : day(120 + Math.floor(rand() * 2000));
      const r = rand(); const status = r < 0.86 ? 'Active' : r < 0.95 ? 'Probation' : 'Notice period';
      const id = Number(insertEmp.run(`${first} ${last}`, `${first}.${last}${i + 1}@rosterly.example`.toLowerCase(), pick(DEPARTMENTS[dept]), deptIds.get(dept), pick(LOCATIONS), status, joined).lastInsertRowid);
      people.push({ id, joined });
    }

    for (let n = historyDays; n >= 0; n--) {
      const date = day(n); const dow = new Date(date).getUTCDay();
      if (dow === 0 || dow === 6) continue;
      const presentOdds = 0.91 + rand() * 0.06;
      for (const p of people) {
        if (p.joined > date) continue;
        if (rand() < presentOdds) {
          const late = rand() < 0.09;
          insertAtt.run(p.id, date, 'present', late ? `09:${35 + Math.floor(rand() * 24)}` : `08:${40 + Math.floor(rand() * 20)}`, `17:${10 + Math.floor(rand() * 50)}`, late ? 1 : 0);
        } else insertAtt.run(p.id, date, rand() < 0.5 ? 'absent' : 'leave', null, null, 0);
      }
    }
  })();
}
