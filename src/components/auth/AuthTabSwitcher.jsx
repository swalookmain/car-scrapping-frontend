import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', label: 'Log In' },
  { path: '/signup', label: 'Sign Up' },
];

export default function AuthTabSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeIndex = location.pathname === '/signup' ? 1 : 0;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        bgcolor: 'rgba(103,58,183,0.08)',
        borderRadius: '14px',
        p: '4px',
        border: '1px solid rgba(103,58,183,0.12)',
        mb: 2.5,
      }}
    >
      <motion.div
        layout
        layoutId="auth-tab-pill"
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: `calc(${activeIndex * 50}% + 4px)`,
          width: 'calc(50% - 8px)',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #673ab7 0%, #7e57c2 50%, #5c6bc0 100%)',
          boxShadow: '0 4px 20px rgba(103,58,183,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      />
      {tabs.map((tab) => {
        const isActive =
          tab.path === '/signup'
            ? location.pathname === '/signup'
            : location.pathname !== '/signup';
        return (
          <Box
            key={tab.path}
            component="button"
            type="button"
            onClick={() => navigate(tab.path)}
            sx={{
              flex: 1,
              position: 'relative',
              zIndex: 1,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              py: 1,
              px: 2,
              borderRadius: '10px',
              transition: 'color 0.2s ease',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: isActive ? '#fff' : 'var(--color-grey-600)',
                letterSpacing: '0.02em',
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
