import { ReactNode, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { alpha, AppBar, Avatar, Box, Drawer, IconButton, InputBase, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import GridViewRounded from '@mui/icons-material/GridViewRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import ApartmentRounded from '@mui/icons-material/ApartmentRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import { brand, sidebarColor } from '../theme';
import { useFilters } from '../context/FiltersContext';

const NAV = [
  { label: 'Overview', to: '/', icon: <GridViewRounded /> },
  { label: 'Employees', to: '/employees', icon: <GroupsRounded /> },
  { label: 'Attendance', to: '/attendance', icon: <EventAvailableRounded /> },
  { label: 'Departments', to: '/departments', icon: <ApartmentRounded /> },
];
interface Props { mode: 'light' | 'dark'; onToggleMode: () => void; children: ReactNode }

export default function Shell({ mode, onToggleMode, children }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { search, setSearch } = useFilters();
  const rail = !isDesktop && !isMobile;
  const width = isDesktop ? 264 : 84;
  const bg = sidebarColor(mode);

  const onSearch = (v: string) => { setSearch(v); if (pathname !== '/employees') navigate('/employees'); };

  const sidebar = (compact: boolean) => (
    <Box component="nav" aria-label="Primary" sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: bg, color: '#E6EEF6', p: 2 }}>
      <Box component={NavLink} to="/" aria-label="Stackly home" sx={{ display: 'flex', alignItems: 'center', justifyContent: compact ? 'center' : 'flex-start', px: compact ? 0 : 1, py: 1.5, mb: 2.5 }}>
        <Box component="img" src={compact ? '/logo-mark-white.png' : '/logo-white.png'} alt="Stackly" sx={{ height: compact ? 34 : 32, width: 'auto' }} />
      </Box>
      {!compact && <Typography sx={{ px: 1.5, mb: 1, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: alpha('#fff', 0.45) }}>WORKSPACE</Typography>}
      <List disablePadding sx={{ flex: 1 }}>
        {NAV.map((n) => {
          const active = pathname === n.to;
          return (
            <Tooltip key={n.to} title={compact ? n.label : ''} placement="right">
              <ListItemButton component={NavLink} to={n.to} end onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}
                sx={{ position: 'relative', borderRadius: 2, mb: 0.5, py: 1.1, justifyContent: compact ? 'center' : 'flex-start', color: active ? '#fff' : alpha('#fff', 0.66), bgcolor: active ? alpha('#fff', 0.09) : 'transparent', '&:hover': { bgcolor: alpha('#fff', 0.07), color: '#fff' },
                  '&::before': active ? { content: '""', position: 'absolute', left: -16, top: 10, bottom: 10, width: 4, borderRadius: '0 4px 4px 0', bgcolor: brand.mint } : {} }}>
                <ListItemIcon sx={{ minWidth: compact ? 0 : 40, color: active ? brand.mint : 'inherit' }}>{n.icon}</ListItemIcon>
                {!compact && <ListItemText primary={n.label} primaryTypographyProps={{ fontSize: 14.5, fontWeight: active ? 700 : 500 }} />}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
      <Box sx={{ borderTop: 1, borderColor: alpha('#fff', 0.1), pt: 2, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: compact ? 'center' : 'flex-start' }}>
        <Avatar sx={{ width: 38, height: 38, bgcolor: brand.mint, color: '#0F2740', fontSize: 14, fontWeight: 700 }}>UK</Avatar>
        {!compact && <Box sx={{ lineHeight: 1.3, minWidth: 0 }}><Typography variant="body2" fontWeight={700} noWrap>Reddi Uday Kumar</Typography><Typography variant="caption" sx={{ color: alpha('#fff', 0.55) }}>Frontend Developer</Typography></Box>}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="a" href="#main" sx={{ position: 'absolute', left: -999, '&:focus': { left: 8, top: 8, zIndex: 2000, bgcolor: 'background.paper', p: 1, borderRadius: 1 } }}>Skip to content</Box>
      {isMobile ? (
        <Drawer open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 276, bgcolor: bg } }}>{sidebar(false)}</Drawer>
      ) : (
        <Drawer variant="permanent" PaperProps={{ sx: { width, bgcolor: bg, border: 0 } }} sx={{ width, '& .MuiDrawer-paper': { boxSizing: 'border-box' } }}>{sidebar(rail)}</Drawer>
      )}
      <Box sx={{ ml: isMobile ? 0 : `${width}px` }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, md: 72 } }}>
            {isMobile && <IconButton aria-label="Open navigation" edge="start" onClick={() => setOpen(true)}><MenuRounded /></IconButton>}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 0.75, flex: 1, maxWidth: 440, bgcolor: 'background.default', border: 1, borderColor: 'divider', borderRadius: 2.5, '&:focus-within': { borderColor: 'primary.main' } }}>
              <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
              <InputBase value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search employees by name, email or role" inputProps={{ 'aria-label': 'Search employees' }} sx={{ flex: 1, fontSize: 14 }} />
            </Box>
            <Box sx={{ flex: 1 }} />
            <Tooltip title={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              <IconButton onClick={onToggleMode} aria-label="Toggle colour theme" sx={{ border: 1, borderColor: 'divider' }}>{mode === 'dark' ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}</IconButton>
            </Tooltip>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, pl: 1.5, ml: 0.5, borderLeft: 1, borderColor: 'divider' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 13, fontWeight: 700 }}>UK</Avatar>
              <Box sx={{ lineHeight: 1.3, display: { xs: 'none', md: 'block' } }}><Typography variant="body2" fontWeight={700}>Uday Kumar</Typography><Typography variant="caption" color="text.secondary">HR Administrator</Typography></Box>
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="main" id="main" tabIndex={-1} sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1520, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}
