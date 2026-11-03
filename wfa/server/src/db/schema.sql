-- Workforce Analytics Platform · SQLite schema
CREATE TABLE IF NOT EXISTS departments (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS employees (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  designation   TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  location      TEXT NOT NULL CHECK (location IN ('Chennai','Bengaluru','Hyderabad','Remote')),
  status        TEXT NOT NULL CHECK (status IN ('Active','Probation','Notice period')),
  joined_on     TEXT NOT NULL            -- ISO date YYYY-MM-DD
);

CREATE TABLE IF NOT EXISTS attendance (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,             -- ISO date YYYY-MM-DD
  status      TEXT NOT NULL CHECK (status IN ('present','absent','leave')),
  check_in    TEXT,                      -- HH:MM, null unless present
  check_out   TEXT,                      -- HH:MM, null unless present
  is_late     INTEGER NOT NULL DEFAULT 0 CHECK (is_late IN (0,1)),
  UNIQUE (employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_location ON employees(location);
