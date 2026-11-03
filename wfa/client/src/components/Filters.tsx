import { useEffect, useState } from 'react';
import { Box, Button, Chip, MenuItem, Paper, TextField } from '@mui/material';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import { fetchMeta } from '../api/workforceApi';
import { useFilters } from '../context/FiltersContext';
import { useAsync } from '../hooks/useAsync';
import { ALL, Filters as F, isoDay, validateFilters } from '../types/filters';

const PRESETS = [7, 14, 30, 60];

export default function Filters() {
  const { filters, setFilters, reset } = useFilters();
  const { data: meta } = useAsync(fetchMeta, []);
  const [draft, setDraft] = useState({ from: filters.from, to: filters.to });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setDraft({ from: filters.from, to: filters.to }); setError(null); }, [filters.from, filters.to]);

  const setDate = (key: 'from' | 'to', value: string) => {
    const next = { ...draft, [key]: value }; const err = validateFilters(next);
    setDraft(next); setError(err);
    if (!err) setFilters({ ...filters, ...next });
  };
  const select = (key: 'department' | 'location' | 'status', label: string, options: string[] = []) => (
    <TextField select size="small" label={label} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value } as F)}>
      <MenuItem value={ALL}>All</MenuItem>
      {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
    </TextField>
  );

  return (
    <Paper variant="outlined" component="section" aria-label="Filters" sx={{ p: 2 }}>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr) auto' } }}>
        <TextField size="small" type="date" label="From" value={draft.from} onChange={(e) => setDate('from', e.target.value)} InputLabelProps={{ shrink: true }} error={!!error} helperText={error} />
        <TextField size="small" type="date" label="To" value={draft.to} onChange={(e) => setDate('to', e.target.value)} InputLabelProps={{ shrink: true }} error={!!error} />
        {select('department', 'Department', meta?.departments)}
        {select('location', 'Location', meta?.locations)}
        {select('status', 'Employment status', meta?.statuses)}
        <Button onClick={reset} startIcon={<RestartAltRounded />} color="inherit" sx={{ color: 'text.secondary', alignSelf: 'start', height: 40 }}>Reset</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }} role="group" aria-label="Quick date ranges">
        {PRESETS.map((d) => {
          const active = filters.to === isoDay(0) && filters.from === isoDay(d - 1);
          return <Chip key={d} size="small" label={`Last ${d} days`} clickable color={active ? 'primary' : 'default'} variant={active ? 'filled' : 'outlined'} onClick={() => setFilters({ ...filters, from: isoDay(d - 1), to: isoDay(0) })} />;
        })}
      </Box>
    </Paper>
  );
}
