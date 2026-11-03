import { createTheme, PaletteMode } from '@mui/material';

export const display = '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
/** Stackly brand colours, sampled from the logo. */
export const brand = { navy: '#204C6E', mint: '#8ED8C0' };
export const sidebarColor = (mode: PaletteMode) => (mode === 'dark' ? '#08121D' : '#0F2740');

export const buildTheme = (mode: PaletteMode) => {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#7DB4E6' : '#204C6E', contrastText: dark ? '#08121D' : '#FFFFFF' },
      secondary: { main: dark ? '#6FD3B0' : '#2FAE86', contrastText: '#08121D' },
      success: { main: dark ? '#4FD1A1' : '#1E9E6A' },
      error: { main: dark ? '#F07A7A' : '#D64545' },
      warning: { main: dark ? '#F0B24D' : '#D98A1C' },
      info: { main: dark ? '#6FB1F0' : '#2F7FD1' },
      background: { default: dark ? '#0B1622' : '#F2F5F9', paper: dark ? '#112030' : '#FFFFFF' },
      text: { primary: dark ? '#E6EEF6' : '#15283B', secondary: dark ? '#93A4B7' : '#5A6B7D' },
      divider: dark ? '#1E3248' : '#E3E9F0',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: display,
      h4: { fontWeight: 700 }, h5: { fontWeight: 700 }, h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { WebkitFontSmoothing: 'antialiased' }, ':focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 } } },
      MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' }, outlined: { boxShadow: dark ? 'none' : '0 1px 2px rgba(16,40,64,.04)' } } },
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: dark ? '#1E3248' : '#E9EEF4' },
          head: { fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: dark ? '#93A4B7' : '#5A6B7D', backgroundColor: dark ? '#0E1B29' : '#F7F9FC' },
        },
      },
    },
  });
};
