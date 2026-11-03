import { useEffect, useState } from 'react';
import { Avatar, Box, Chip, LinearProgress, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from '@mui/material';
import { fetchEmployees } from '../api/workforceApi';
import { useFilters } from '../context/FiltersContext';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { EmptyState, ErrorState } from './States';

type SortKey = 'name' | 'department' | 'location' | 'status' | 'joinedOn';
const COLUMNS: { key: SortKey | 'designation'; label: string; sortable: boolean; hide?: object }[] = [
  { key: 'name', label: 'Employee', sortable: true }, { key: 'designation', label: 'Role', sortable: false, hide: { xs: 'none', md: 'table-cell' } },
  { key: 'department', label: 'Department', sortable: true, hide: { xs: 'none', sm: 'table-cell' } }, { key: 'location', label: 'Location', sortable: true, hide: { xs: 'none', md: 'table-cell' } },
  { key: 'status', label: 'Status', sortable: true }, { key: 'joinedOn', label: 'Joined', sortable: true, hide: { xs: 'none', lg: 'table-cell' } },
];
const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = { Active: 'success', Probation: 'warning', 'Notice period': 'error' };
const initials = (n: string) => n.split(' ').map((p) => p[0]).join('');

export default function EmployeeTable() {
  const { filters, search, setSearch, reset } = useFilters();
  const q = useDebounce(search.trim(), 300);
  const [sort, setSort] = useState<SortKey>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => setPage(0), [filters.department, filters.location, filters.status, q, pageSize]);
  const { data, error, loading, reload } = useAsync(
    (signal) => fetchEmployees(filters, { search: q, sort, order, page: page + 1, pageSize }, signal),
    [filters.department, filters.location, filters.status, q, sort, order, page, pageSize],
  );

  const onSort = (k: SortKey) => { setOrder(sort === k && order === 'asc' ? 'desc' : 'asc'); setSort(k); };

  return (
    <Paper variant="outlined" component="section" aria-label="Employee directory">
      <Box sx={{ p: 2.5, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontSize: 18 }}>Employee directory</Typography>
          <Typography variant="body2" color="text.secondary" aria-live="polite">{data ? `${data.total} employee${data.total === 1 ? '' : 's'} found` : 'Loading…'}</Typography>
        </Box>
        <TextField size="small" label="Search name, email or role" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: '100%', sm: 300 } }} />
      </Box>
      {loading && data && <LinearProgress aria-label="Updating" />}
      {error ? <Box sx={{ p: 2 }}><ErrorState message={error} onRetry={reload} /></Box>
        : data && data.total === 0 ? <Box sx={{ p: 2 }}><EmptyState title="No employees match" text="Try a different search term or clear the filters." actionLabel="Clear search and filters" onAction={reset} /></Box>
        : (
          <>
            <TableContainer>
              <Table size="medium" aria-label="Employees">
                <TableHead>
                  <TableRow>
                    {COLUMNS.map((c) => (
                      <TableCell key={c.key} sx={{ display: c.hide, fontWeight: 600, whiteSpace: 'nowrap' }} sortDirection={sort === c.key ? order : false}>
                        {c.sortable ? <TableSortLabel active={sort === c.key} direction={sort === c.key ? order : 'asc'} onClick={() => onSort(c.key as SortKey)}>{c.label}</TableSortLabel> : c.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!data ? Array.from({ length: 6 }, (_, i) => <TableRow key={i}>{COLUMNS.map((c) => <TableCell key={c.key} sx={{ display: c.hide }}><Skeleton /></TableCell>)}</TableRow>)
                    : data.items.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: 'action.selected', color: 'text.primary' }}>{initials(e.name)}</Avatar>
                          <Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={600} noWrap>{e.name}</Typography><Typography variant="caption" color="text.secondary" noWrap>{e.email}</Typography></Box>
                        </Box></TableCell>
                        <TableCell sx={{ display: COLUMNS[1].hide }}>{e.designation}</TableCell>
                        <TableCell sx={{ display: COLUMNS[2].hide }}>{e.department}</TableCell>
                        <TableCell sx={{ display: COLUMNS[3].hide }}>{e.location}</TableCell>
                        <TableCell><Chip size="small" variant="outlined" color={STATUS_COLOR[e.status] ?? 'default'} label={e.status} /></TableCell>
                        <TableCell sx={{ display: COLUMNS[5].hide, whiteSpace: 'nowrap' }}>{new Date(e.joinedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={data?.total ?? 0} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={pageSize} onRowsPerPageChange={(e) => setPageSize(Number(e.target.value))} rowsPerPageOptions={[10, 25, 50]} />
          </>
        )}
    </Paper>
  );
}
