import { Box, LinearProgress, Paper, Skeleton, Typography } from '@mui/material';
import { fetchDepartments } from '../api/workforceApi';
import Filters from '../components/Filters';
import { EmptyState, ErrorState } from '../components/States';
import { useFilters } from '../context/FiltersContext';
import { useAsync } from '../hooks/useAsync';

const rateTone = (r: number) => (r >= 94 ? 'success' : r >= 90 ? 'primary' : 'warning') as 'success' | 'primary' | 'warning';

export default function DepartmentsPage() {
  const { filters, reset } = useFilters();
  const { data, error, reload } = useAsync((s) => fetchDepartments(filters, s), [filters]);
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, md: 32 }, letterSpacing: -0.6 }}>Departments</Typography>
        <Typography color="text.secondary">Headcount and attendance health for each team across the selected range.</Typography>
      </Box>
      <Box sx={{ mb: 3 }}><Filters /></Box>
      {error ? <ErrorState message={error} onRetry={reload} />
        : !data ? <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' } }}>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} variant="rounded" height={210} />)}</Box>
        : data.length === 0 ? <EmptyState title="No departments match" text="Clear the filters to see every department." actionLabel="Clear filters" onAction={reset} />
        : (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' } }}>
            {data.map((d) => (
              <Paper key={d.name} variant="outlined" component="article" sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box><Typography variant="h6" component="h2" sx={{ fontSize: 18 }}>{d.name}</Typography><Typography variant="body2" color="text.secondary">{d.headcount} employees</Typography></Box>
                  <Box sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: -0.8 }} color={`${rateTone(d.attendanceRate)}.main`}>{d.attendanceRate.toFixed(1)}%</Typography><Typography variant="caption" color="text.secondary">attendance</Typography></Box>
                </Box>
                <LinearProgress variant="determinate" value={d.attendanceRate} color={rateTone(d.attendanceRate)} aria-label={`${d.name} attendance rate`} sx={{ my: 2.25, height: 8, borderRadius: 4 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {[['Absent days', d.absent, 'error.main'], ['Leave days', d.onLeave, 'warning.main'], ['Late arrivals', d.late, 'text.primary']].map(([l, v, c]) => (
                    <Box key={l as string} sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}><Typography sx={{ fontSize: 20, fontWeight: 700 }} color={c as string}>{v}</Typography><Typography variant="caption" color="text.secondary">{l}</Typography></Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
    </>
  );
}
