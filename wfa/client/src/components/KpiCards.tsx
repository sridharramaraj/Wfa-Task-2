import { alpha, Box, Paper, Typography } from '@mui/material';
import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import SouthEastRounded from '@mui/icons-material/SouthEastRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import HowToRegRounded from '@mui/icons-material/HowToRegRounded';
import PersonOffRounded from '@mui/icons-material/PersonOffRounded';
import BeachAccessRounded from '@mui/icons-material/BeachAccessRounded';
import DonutLargeRounded from '@mui/icons-material/DonutLargeRounded';
import { Dashboard } from '../api/schemas';

type Key = keyof Dashboard['kpis'];
type Tone = 'primary' | 'success' | 'error' | 'warning' | 'secondary';
const CARDS: { key: Key; label: string; icon: JSX.Element; tone: Tone; goodWhenUp: boolean; unit: string; format: (n: number) => string }[] = [
  { key: 'totalEmployees', label: 'Total employees', icon: <GroupsRounded />, tone: 'primary', goodWhenUp: true, unit: '', format: String },
  { key: 'present', label: 'Present', icon: <HowToRegRounded />, tone: 'success', goodWhenUp: true, unit: 'vs prev. day', format: String },
  { key: 'absent', label: 'Absent', icon: <PersonOffRounded />, tone: 'error', goodWhenUp: false, unit: 'vs prev. day', format: String },
  { key: 'onLeave', label: 'On leave', icon: <BeachAccessRounded />, tone: 'warning', goodWhenUp: false, unit: 'vs prev. day', format: String },
  { key: 'attendanceRate', label: 'Attendance rate', icon: <DonutLargeRounded />, tone: 'secondary', goodWhenUp: true, unit: 'pts vs earlier', format: (n) => `${n.toFixed(1)}%` },
];

export default function KpiCards({ kpis }: { kpis: Dashboard['kpis'] }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', xl: 'repeat(5, 1fr)' }, '& > :first-of-type': { gridColumn: { xs: '1 / -1', md: 'auto' } } }}>
      {CARDS.map((c) => {
        const { value, delta } = kpis[c.key];
        const good = delta === null || delta === 0 || delta > 0 === c.goodWhenUp;
        return (
          <Paper key={c.key} variant="outlined" sx={{ p: 2.25, transition: 'box-shadow .2s, transform .2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(16,40,64,.08)' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>{c.label}</Typography>
              <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: 2, display: 'grid', placeItems: 'center', color: `${c.tone}.main`, bgcolor: (t) => alpha(t.palette[c.tone].main, 0.12) }}>{c.icon}</Box>
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, mt: 1, mb: 0.75, letterSpacing: -1 }}>{c.format(value)}</Typography>
            {delta === null ? (
              <Typography variant="caption" color="text.secondary">{c.key === 'totalEmployees' ? 'in current selection' : 'not enough data'}</Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: good ? 'success.main' : 'error.main' }}>
                {delta >= 0 ? <ArrowOutwardRounded sx={{ fontSize: 16 }} /> : <SouthEastRounded sx={{ fontSize: 16 }} />}
                <Typography variant="caption" fontWeight={700}>{delta > 0 ? '+' : ''}{delta}</Typography>
                <Typography variant="caption" color="text.secondary">{c.unit}</Typography>
              </Box>
            )}
          </Paper>
        );
      })}
    </Box>
  );
}
