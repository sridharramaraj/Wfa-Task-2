import { Avatar, Box, Chip, Paper, Typography } from '@mui/material';
import { Dashboard } from '../api/schemas';

const initials = (n: string) => n.split(' ').map((p) => p[0]).join('');
const LABEL = { absent: 'was absent', leave: 'is on leave', late: 'arrived late' } as const;
const COLOR = { absent: 'error', leave: 'warning', late: 'default' } as const;
const when = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export default function Exceptions({ items }: { items: Dashboard['exceptions'] }) {
  return (
    <Paper variant="outlined" component="section" sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" component="h2" sx={{ fontSize: 18 }}>Recent activity</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Latest absences, leave and late arrivals</Typography>
      {items.length === 0 ? <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No exceptions in this range.</Typography> : (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {items.map((a) => (
            <Box component="li" key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderTop: 1, borderColor: 'divider' }}>
              <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: 'action.selected', color: 'text.primary' }}>{initials(a.employee)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap><b>{a.employee}</b> {LABEL[a.kind]}</Typography>
                <Typography variant="caption" color="text.secondary">{a.department} · {when(a.date)}</Typography>
              </Box>
              <Chip size="small" variant="outlined" color={COLOR[a.kind]} label={a.kind === 'leave' ? 'Leave' : a.kind === 'late' ? 'Late' : 'Absent'} />
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
