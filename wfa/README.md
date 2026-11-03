# Stackly · Workforce Analytics Platform (Task 2)

React + TypeScript + Vite + Material UI + Recharts on the front end; Node.js + Express + SQLite on the back end.
No hardcoded data: every KPI, chart and table row is read from the SQLite database through the REST API.

## Quick start (Node 20+)
```bash
npm run setup        # installs root, server and client dependencies
npm run dev          # API on :4000 and UI on http://localhost:5173
```
The database file is created and seeded automatically on first start (`server/data/wfa.db`).
Re-seed with fresh dates at any time: `npm run db:reset`. Demo data is relative to today, so reset it if the data looks old.

Other commands: `npm test` (server + client tests) · `npm run build` (type-check + production build).

## Architecture
```
client/src
  api/          http.ts (typed GET, error mapping) · schemas.ts (zod response validation) · workforceApi.ts (service functions)
  hooks/        useAsync (cancellable loading/error state) · useDebounce
  context/      FiltersContext (shared date/department/location/status/search state)
  components/   Shell, Filters, KpiCards, Charts, Exceptions, EmployeeTable, AttendanceTable, States  (presentation only)
  pages/        OverviewPage, PeoplePage (Employees), AttendancePage, DepartmentsPage
  utils/        csv.ts (CSV export)
  types/        filters.ts (filter model + validation)
server/src
  http/         routes.ts · schemas.ts (zod request validation) · errors.ts   → HTTP layer
  services/     dashboardService (KPI business logic) · employeeService · metaService
  domain/       types.ts (DTOs + repository interfaces)
  repositories/ sqlite*Repository.ts (all SQL lives here)                      → data layer
  db/           schema.sql · connection.ts · seed.ts · reset.ts
```
- **Layering:** routes → services → repository *interfaces* → SQLite implementations. Services never import SQLite (Dependency Inversion); `services/index.ts` is the single composition root.
- **Single responsibility:** one repository per aggregate, one service per use-case, UI components hold no fetch logic.
- **Safety:** all SQL values are bound parameters; sort keys are mapped through a whitelist; query strings are validated with zod (dates, ranges ≤ 365 days, enums, page size ≤ 100). The client validates API responses with zod too.

## Database
Existing databases are upgraded automatically on start (adds `attendance.check_out`). Schema: `server/src/db/schema.sql` — `departments`, `employees` (FK → departments), `attendance` (FK → employees, unique per employee/day, status `present|absent|leave`, `is_late`). Indexed on attendance date, employee department and location.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness |
| GET | `/api/meta` | Filter options (departments, locations, statuses) |
| GET | `/api/dashboard?from&to&department&location&status` | KPIs, trend, distributions, exceptions |
| GET | `/api/attendance?from&to&search&attendance&sort&order&page&pageSize&department&location&status` | Paginated attendance records (check-in/out) |
| GET | `/api/departments?from&to&department&location&status` | Headcount + attendance health per department |
| GET | `/api/employees?search&sort&order&page&pageSize&department&location&status` | Paginated, sortable, searchable directory |

KPI definitions: Total = employees matching filters · Present/Absent/On leave = counts on the latest working day in the range (delta vs previous day) · Attendance rate = present ÷ (present + absent + on leave) across the range.

## Features
- **Branding:** Stackly logo (`client/public/logo*.png`), navy + mint palette taken from the logo, Plus Jakarta Sans typography. Replace the files in `client/public` to re-brand.
- **Navigation:** navy sidebar (full / icon rail / drawer by screen size), search header, profile, light/dark theme.
- **Overview:** five KPI cards, attendance trend, department headcount, status/location donut, recent activity.
- **Employees:** debounced search, sortable columns, pagination.
- **Attendance:** records table with check-in/out, status chips, attendance-status filter, sorting, pagination and CSV export (up to 2,000 rows).
- **Departments:** per-team headcount, attendance rate and absence/leave/late totals.
- **Shared filters:** date range (with presets), department, location, employment status — all pages respond.
- Loading, empty and error states · skip link, landmarks, chart text summaries, keyboard-visible focus.

## Testing
`npm test` runs Vitest suites for the data layer (aggregation consistency, filters, pagination, validation) and the client filter logic.
Manual checks: stop the API to see the error state; filter to a combination with no employees to see the empty state.

## Submission checklist
Figma link: _add here_ · Screenshots (1440 / 1024 / 390 px, both themes) · Demo walkthrough: UI → API → repository → SQL.
