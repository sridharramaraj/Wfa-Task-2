import { ReactNode, useState } from 'react';
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { Dashboard } from '../api/schemas';
import { display } from '../theme';

function ChartCard({ title, subtitle, summary, height, action, children }: { title: string; subtitle: string; summary: string; height: number; action?: ReactNode; children: ReactNode }) {
  return (
    <Paper variant="outlined" component="section" sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Box><Typography variant="h6" component="h2" sx={{ fontSize: 18 }}>{title}</Typography><Typography variant="body2" color="text.secondary">{subtitle}</Typography></Box>
        {action}
      </Box>
      <Box role="img" aria-label={summary} sx={{ height, position: 'relative' }}>{children}</Box>
    </Paper>
  );
}

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper variant="outlined" sx={{ px: 1.5, py: 1, boxShadow: 3 }}>
      {label && <Typography variant="caption" color="text.secondary">{label}</Typography>}
      {payload.map((p: any) => <Typography key={p.name} variant="body2" fontWeight={600}>{p.name}: {p.value}</Typography>)}
    </Paper>
  );
};
const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function TrendChart({ data }: { data: Dashboard['trend'] }) {
  const t = useTheme(); const axis = { fill: t.palette.text.secondary, fontSize: 12 };
  const avg = data.length ? Math.round(data.reduce((s, d) => s + d.present, 0) / data.length) : 0;
  return (
    <ChartCard title="Attendance trend" subtitle="Daily present, absent and on-leave headcount" height={320} summary={`Attendance over ${data.length} working days, averaging ${avg} present per day.`}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs><linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.palette.primary.main} stopOpacity={0.3} /><stop offset="1" stopColor={t.palette.primary.main} stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke={t.palette.divider} vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmt} tickLine={false} axisLine={false} tick={axis} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} tick={axis} />
          <Tooltip content={<Tip />} labelFormatter={fmt} />
          <Area type="monotone" dataKey="present" name="Present" stroke={t.palette.primary.main} strokeWidth={2.5} fill="url(#pf)" />
          <Line type="monotone" dataKey="absent" name="Absent" stroke={t.palette.error.main} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="onLeave" name="On leave" stroke={t.palette.warning.main} strokeWidth={2} dot={false} strokeDasharray="5 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DepartmentChart({ data }: { data: Dashboard['byDepartment'] }) {
  const t = useTheme();
  return (
    <ChartCard title="People by department" subtitle="Headcount in the current selection" height={300} summary={`Headcount by department: ${data.map((d) => `${d.name} ${d.value}`).join(', ')}.`}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barSize={14}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={88} tickLine={false} axisLine={false} tick={{ fill: t.palette.text.primary, fontSize: 13 }} />
          <Tooltip content={<Tip />} cursor={{ fill: t.palette.action.hover }} />
          <Bar dataKey="value" name="Employees" radius={[0, 8, 8, 0]} fill={t.palette.primary.main} label={{ position: 'right', fill: t.palette.text.secondary, fontSize: 12 }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DistributionDonut({ byStatus, byLocation, total }: { byStatus: Dashboard['byStatus']; byLocation: Dashboard['byLocation']; total: number }) {
  const t = useTheme(); const [view, setView] = useState<'status' | 'location'>('status');
  const data = view === 'status' ? byStatus : byLocation;
  const colors = [t.palette.primary.main, t.palette.secondary.main, t.palette.warning.main, t.palette.text.secondary];
  return (
    <ChartCard title="Workforce mix" subtitle={`Employees by ${view}`} height={290} summary={`Workforce by ${view}: ${data.map((d) => `${d.name} ${d.value}`).join(', ')}.`}
      action={<ToggleButtonGroup exclusive size="small" value={view} onChange={(_, v) => v && setView(v)} aria-label="Distribution view"><ToggleButton value="status">Status</ToggleButton><ToggleButton value="location">Location</ToggleButton></ToggleButtonGroup>}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="84%" paddingAngle={2} stroke={t.palette.background.paper} strokeWidth={3}>
            {data.map((d, i) => <Cell key={d.name} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip content={<Tip />} />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', textAlign: 'center', pb: 3 }}>
        <Box><Typography sx={{ fontFamily: display, fontSize: 34, lineHeight: 1 }}>{total}</Typography><Typography variant="caption" color="text.secondary">employees</Typography></Box>
      </Box>
      <Box sx={{ position: 'absolute', bottom: -6, left: 0, right: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
        {data.map((d, i) => <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colors[i % colors.length] }} /><Typography variant="caption" color="text.secondary">{d.name}</Typography></Box>)}
      </Box>
    </ChartCard>
  );
}
