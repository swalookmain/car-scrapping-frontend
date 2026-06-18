import { Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

export const authStaggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const authFieldVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AuthCard({ title, subtitle, children, maxWidth = 440, compact }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '22px',
        border: '1px solid rgba(255,255,255,0.7)',
        maxWidth,
        width: '100%',
        p: compact ? { xs: 2.5, sm: 3 } : { xs: 3, sm: 3.5 },
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        boxShadow:
          '0 32px 64px rgba(103,58,183,0.12), 0 12px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #673ab7, #2196f3, #673ab7, transparent)',
          backgroundSize: '200% 100%',
          animation: 'authShimmer 5s linear infinite',
        },
        '@keyframes authShimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      }}
    >
      <Box sx={{ mb: subtitle ? 1.5 : 2 }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            color: 'var(--color-secondary-main)',
            fontWeight: 700,
            fontSize: '1.25rem',
            lineHeight: 1.3,
            textAlign: 'center',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: 'var(--color-grey-500)',
              fontSize: '0.8125rem',
              mt: 0.5,
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <motion.div variants={authStaggerVariants} initial="hidden" animate="visible">
        {children}
      </motion.div>
    </Paper>
  );
}
