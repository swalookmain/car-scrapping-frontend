import { createTheme } from '@mui/material/styles';

const FONT = "'Inter', 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif";

const theme = createTheme({
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    '0 2px 6px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
    '0 4px 12px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.03)',
    '0 6px 16px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03)',
    '0 8px 24px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)',
    '0 12px 32px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
    '0 16px 40px rgba(0,0,0,0.09), 0 4px 16px rgba(0,0,0,0.05)',
    '0 20px 48px rgba(0,0,0,0.10), 0 6px 20px rgba(0,0,0,0.05)',
    ...Array(16).fill('0 24px 56px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)'),
  ],
  typography: {
    fontFamily: FONT,
    allVariants: {
      fontFamily: FONT,
    },
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body2: { fontSize: '0.8125rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { fontFamily: FONT },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: FONT,
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '10px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 14px rgba(103,58,183,0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: '14px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
          border: '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontFamily: FONT },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: FONT,
          borderRadius: '8px',
          margin: '2px 6px',
          '&:hover': {
            backgroundColor: 'rgba(103,58,183,0.06)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontFamily: FONT },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: FONT,
          borderRadius: '8px',
          fontSize: '0.75rem',
          padding: '6px 12px',
          backgroundColor: 'rgba(18,25,38,0.92)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .Mui-checked': {
            color: '#673ab7',
          },
          '& .Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#673ab7',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 14px rgba(103,58,183,0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(103,58,183,0.4)',
          },
        },
      },
    },
  },
});

export default theme;
