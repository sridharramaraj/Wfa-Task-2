import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, LinearProgress, MenuItem, Paper, Skeleton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from '@mui/material';
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded';
import { AttendanceRow } from '../api/schemas';
import { fetchAttendance } from '../api/workforceApi';
import { useFilters } from '../context/FiltersContext';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { downloadCsv } from '../utils/csv';
import { EmptyState, ErrorState } from './States';

type SortKey = 'date' | 'employee' | 'department' | 'status';
const COLUMNS: { key: string; label: string; sort?: SortKey; hide?: object }[] = [
  { key: 'date', label: 'Date', sort: 'date' }, { key: 'employee', label: 'Employee', sort: 'employee' },
  { key: 'department', label: 'Department', sort: 'department', hide: { xs: 'none', md: 'table-cell' } }, { key: 'location', label: 'Location', hide: { xs: 'none', lg: 'table-cell' } },
  { key: 'status', label: 'Status', sort: 'status' }, { key: 'in', label: 'Check-in', hide: { xs: 'none', sm: 'table-cell' } }, { key: 'out', label: 'Check-out', hide: { xs: 'none', sm: 'table-cell' } },
];
const OPTIONS = [['All', 'All statuses'], ['present', 'Present'], ['absent', 'Absent'], ['leave', 'On leave'], ['late', 'Late arrivals']];
const initials = (n: string) => n.split(' ').map((p) => p[0]).join('');
const code = (id: number) => `EMP-${String(id).padStart(3, '0')}`;
const day = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const label = (r: AttendanceRow) => (r.status === 'absent' ? 'Absent' : r.status === 'leave' ? 'On leave' : r.isLate ? 'Late' : 'Present');
const tone = (r: AttendanceRow) => (r.status === 'absent' ? 'error' : r.status === 'leave' ? 'info' : r.isLate ? 'warning' : 'success') as 'error' | 'info' | 'warning' | 'success';

export default function AttendanceTable() {
  const { filters, search, setSearch, reset } = useFilters();
  const q = useDebounce(search.trim(), 300);
  const [attendance, setAttendance] = useState('All');
  const [sort, setSort] = useState<SortKey>('date');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const deps = [filters, q, attendance, sort, order];
  useEffect(() => setPage(0), [...deps, pageSize]);
  const { data, error, loading, reload } = useAsync((s) => fetchAttendance(filters, { search: q, attendance, sort, order, page: page + 1, pageSize }, s), [...deps, page, pageSize]);

  const onSort = (k: SortKey) => { setOrder(sort === k && order === 'desc' ? 'asc' : 'desc'); setSort(k); };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows: AttendanceRow[] = [];
      for (let p = 1; p <= 20; p++) { // up to 2,000 rows
        const r = await fetchAttendance(filters, { search: q, attendance, sort, order, page: p, pageSize: 100 });
        rows.push(...r.items); if (rows.length >= r.total) break;
      }
      downloadCsv(`attendance_${filters.from}_to_${filters.to}.csv`, [
        ['Date', 'Employee ID', 'Employee', 'Department', 'Location', 'Status', 'Check-in', 'Check-out'],
        ...rows.map((r) => [r.date, code(r.employeeId), r.employee, r.department, r.location, label(r), r.checkIn, r.checkOut]),
      ]);
    } catch { setExportError(true); } finally { setExporting(false); }
  };

  return (
    <Paper variant="outlined" component="section" aria-label="Attendance records">
      <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontSize: 18 }}>Attendance records</Typography>
          <Typography variant="body2" color="text.secondary" aria-live="polite">{data ? `${data.total.toLocaleString('en-IN')} records in range` : 'Loading…'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
          <TextField size="small" label="Search employee" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: { xs: '1 1 100%', sm: '0 0 220px' } }} />
          <TextField select size="small" label="Attendance" value={attendance} onChange={(e) => setAttendance(e.target.value)} sx={{ minWidth: 160, flex: { xs: 1, sm: 'none' } }}>
            {OPTIONS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </TextField>
          <Button variant="outlined" startIcon={<FileDownloadRounded />} onClick={exportCsv} disabled={exporting || !data?.total} sx={{ height: 40 }}>{exporting ? 'Exporting…' : 'Export CSV'}</Button>
        </Box>
      </Box>
      {loading && data && <LinearProgress aria-label="Updating" />}
      {error ? <Box sx={{ p: 2 }}><ErrorState message={error} onRetry={reload} /></Box>
        : data && data.total === 0 ? <Box sx={{ p: 2 }}><EmptyState title="No attendance records found" text="Try a different date range, status or search term." actionLabel="Clear filters" onAction={() => { reset(); setAttendance('All'); }} /></Box>
        : (
          <>
            <TableContainer>
              <Table aria-label="Attendance records">
                <TableHead>
                  <TableRow>{COLUMNS.map((c) => (
                    <TableCell key={c.key} sx={{ display: c.hide, whiteSpace: 'nowrap' }} sortDirection={c.sort && sort === c.sort ? order : false}>
                      {c.sort ? <TableSortLabel active={sort === c.sort} direction={sort === c.sort ? order : 'asc'} onClick={() => onSort(c.sort!)}>{c.label}</TableSortLabel> : c.label}
                    </TableCell>))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!data ? Array.from({ length: 6 }, (_, i) => <TableRow key={i}>{COLUMNS.map((c) => <TableCell key={c.key} sx={{ display: c.hide }}><Skeleton /></TableCell>)}</TableRow>)
                    : data.items.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{day(r.date)}</TableCell>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700, bgcolor: 'action.selected', color: 'text.primary' }}>{initials(r.employee)}</Avatar>
                          <Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={600} noWrap>{r.employee}</Typography><Typography variant="caption" color="text.secondary">{code(r.employeeId)}</Typography></Box>
                        </Box></TableCell>
                        <TableCell sx={{ display: COLUMNS[2].hide }}>{r.department}</TableCell>
                        <TableCell sx={{ display: COLUMNS[3].hide }}>{r.location}</TableCell>
                        <TableCell><Chip size="small" color={tone(r)} variant="outlined" label={label(r)} /></TableCell>
                        <TableCell sx={{ display: COLUMNS[5].hide }}>{r.checkIn ?? '—'}</TableCell>
                        <TableCell sx={{ display: COLUMNS[6].hide }}>{r.checkOut ?? '—'}</TableCell>
                      </TableRow>))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={data?.total ?? 0} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={pageSize} onRowsPerPageChange={(e) => setPageSize(Number(e.target.value))} rowsPerPageOptions={[10, 25, 50]} />
          </>
        )}
      <Snackbar open={exportError} autoHideDuration={5000} onClose={() => setExportError(false)}><Alert severity="error" onClose={() => setExportError(false)}>Export failed. Please try again.</Alert></Snackbar>
    </Paper>
  );
}
