import { useMemo, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import Shell from './components/Shell';
import { FiltersProvider } from './context/FiltersContext';
import OverviewPage from './pages/OverviewPage';
import AttendancePage from './pages/AttendancePage';
import DepartmentsPage from './pages/DepartmentsPage';
import PeoplePage from './pages/PeoplePage';
import { buildTheme } from './theme';

type Mode = 'light' | 'dark';

export default function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('rosterly-mode') as Mode) ?? (prefersDark ? 'dark' : 'light'));
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const toggle = () => setMode((m) => { const n = m === 'light' ? 'dark' : 'light'; localStorage.setItem('rosterly-mode', n); return n; });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <FiltersProvider>
          <Shell mode={mode} onToggleMode={toggle}>
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/employees" element={<PeoplePage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        </FiltersProvider>
      </HashRouter>
    </ThemeProvider>
  );
}
