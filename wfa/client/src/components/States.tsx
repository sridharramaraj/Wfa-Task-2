import { Box, Button, Paper, Skeleton, Typography } from '@mui/material';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import SearchOffRounded from '@mui/icons-material/SearchOffRounded';

const Panel = ({ icon, title, text, action }: { icon: JSX.Element; title: string; text: string; action: JSX.Element }) => (
  <Paper variant="outlined" role="status" sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
    <Box sx={{ color: 'text.secondary', mb: 1 }}>{icon}</Box>
    <Typography variant="h6">{title}</Typography>
    <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: 440, mx: 'auto' }}>{text}</Typography>
    {action}
  </Paper>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Panel icon={<ErrorOutlineRounded sx={{ fontSize: 44, color: 'error.main' }} />} title="We couldn't load this data" text={message} action={<Button variant="contained" onClick={onRetry}>Try again</Button>} />
);

export const EmptyState = ({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel: string; onAction: () => void }) => (
  <Panel icon={<SearchOffRounded sx={{ fontSize: 44 }} />} title={title} text={text} action={<Button variant="contained" onClick={onAction}>{actionLabel}</Button>} />
);

export const LoadingState = () => (
  <Box aria-busy="true" aria-label="Loading dashboard">
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' } }}>
      {Array.from({ length: 5 }, (_, i) => <Paper key={i} variant="outlined" sx={{ p: 2.25 }}><Skeleton width="55%" /><Skeleton height={52} width="40%" /><Skeleton width="45%" /></Paper>)}
    </Box>
    <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
      <Skeleton variant="rounded" height={400} /><Skeleton variant="rounded" height={400} />
    </Box>
  </Box>
);
