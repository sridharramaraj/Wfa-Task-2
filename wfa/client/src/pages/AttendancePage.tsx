import { Box, Skeleton, Typography } from '@mui/material';
import { fetchDashboard } from '../api/workforceApi';
import AttendanceTable from '../components/AttendanceTable';
import Filters from '../components/Filters';
import KpiCards from '../components/KpiCards';
import { useFilters } from '../context/FiltersContext';
import { useAsync } from '../hooks/useAsync';

export default function AttendancePage() {
  const { filters } = useFilters();
  const { data } = useAsync((s) => fetchDashboard(filters, s), [filters]);
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, md: 32 }, letterSpacing: -0.6 }}>Attendance Management</Typography>
        <Typography color="text.secondary">Review daily attendance, spot late arrivals and export records.</Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Filters />
        {data ? <KpiCards kpis={data.kpis} /> : <Skeleton variant="rounded" height={118} />}
        <AttendanceTable />
      </Box>
    </>
  );
}
