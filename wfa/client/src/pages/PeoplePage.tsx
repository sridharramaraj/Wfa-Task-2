import { Box, Typography } from '@mui/material';
import EmployeeTable from '../components/EmployeeTable';
import Filters from '../components/Filters';

export default function PeoplePage() {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: 26, md: 32 }, letterSpacing: -0.6 }}>Employees</Typography>
        <Typography color="text.secondary">Search, sort and browse everyone in the selected teams and locations.</Typography>
      </Box>
      <Box sx={{ mb: 3 }}><Filters /></Box>
      <EmployeeTable />
    </>
  );
}
