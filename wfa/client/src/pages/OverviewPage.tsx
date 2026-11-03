import { Alert, Box, LinearProgress, Typography } from '@mui/material';
import { fetchDashboard } from '../api/workforceApi';
import { DepartmentChart, DistributionDonut, TrendChart } from '../components/Charts';
import Exceptions from '../components/Exceptions';
import Filters from '../components/Filters';
import KpiCards from '../components/KpiCards';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useFilters } from '../context/FiltersContext';
import { useAsync } from '../hooks/useAsync';

export default function OverviewPage() {
  const { filters, reset } = useFilters();
  const { data, error, loading, reload } = useAsync((s) => fetchDashboard(filters, s), [filters]);
  const asOf = data?.asOf ? new Date(data.asOf).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) : null;

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography color="text.secondary">{asOf ? `Human capital performance and dynamics · daily figures as of ${asOf}` : 'Human capital performance and dynamics'}</Typography>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, md: 32 }, letterSpacing: -0.6 }}>Workforce Analytics</Typography>
      </Box>
      <Box sx={{ mb: 3 }}><Filters /></Box>
      {error ? <ErrorState message={error} onRetry={reload} />
        : !data ? <LoadingState />
        : data.kpis.totalEmployees.value === 0 ? <EmptyState title="No employees match these filters" text="Widen the date range or clear a filter to see workforce data again." actionLabel="Clear filters" onAction={reset} />
        : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {loading && <LinearProgress aria-label="Updating dashboard" />}
            {!data.asOf && <Alert severity="info">No attendance records fall in this date range, so daily figures show as zero.</Alert>}
            <KpiCards kpis={data.kpis} />
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
              <TrendChart data={data.trend} />
              <DistributionDonut byStatus={data.byStatus} byLocation={data.byLocation} total={data.kpis.totalEmployees.value} />
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1.2fr' } }}>
              <DepartmentChart data={data.byDepartment} />
              <Exceptions items={data.exceptions} />
            </Box>
          </Box>
        )}
    </>
  );
}
