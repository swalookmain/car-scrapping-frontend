import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const highlights = [
  { value: '7 Days', label: 'Free trial' },
  { value: '100%', label: 'ERP access' },
  { value: '0', label: 'Credit card' },
];

const features = [
  'Leads & auctions in one place',
  'Yard, GST & accounting built-in',
  'Built for scrap yards',
];

export default function AuthBrandPanel({ isSignup }) {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        flex: '0 0 42%',
        maxWidth: 420,
        pr: 4,
      }}
    >
      <motion.div
        key={isSignup ? 'signup-brand' : 'login-brand'}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Typography
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: '2rem',
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #4527a0 0%, #673ab7 40%, #2196f3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1.5,
          }}
        >
          {isSignup ? 'Launch your yard in minutes' : 'Your scrap empire awaits'}
        </Typography>

        <Typography
          sx={{
            color: 'var(--color-grey-600)',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            mb: 3,
            maxWidth: 340,
          }}
        >
          {isSignup
            ? 'Create your organization and start managing leads, inventory, and auctions today.'
            : 'Sign in to pick up where you left off — auctions, compliance, and yard ops.'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {highlights.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <Box
                sx={{
                  px: 1.75,
                  py: 1.25,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(103,58,183,0.12)',
                  backdropFilter: 'blur(8px)',
                  textAlign: 'center',
                  minWidth: 88,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: 'var(--color-secondary-main)',
                    lineHeight: 1.2,
                  }}
                >
                  {item.value}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'var(--color-grey-500)', mt: 0.25 }}>
                  {item.label}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {features.map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07 }}
            >
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-grey-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&::before': {
                    content: '""',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #673ab7, #2196f3)',
                    flexShrink: 0,
                    boxShadow: '0 0 8px rgba(103,58,183,0.5)',
                  },
                }}
              >
                {text}
              </Typography>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}
