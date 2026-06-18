import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { LANDING_HOME_URL } from '../../config/appUrls';

export default function AuthLogo() {
  return (
    <Box
      component="a"
      href={LANDING_HOME_URL}
      aria-label="Back to ScrapNiti website"
      sx={{
        display: 'inline-flex',
        mb: 0,
        cursor: 'pointer',
        textDecoration: 'none',
        borderRadius: '16px',
        transition: 'box-shadow 0.25s ease',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(103,58,183,0.2)',
        },
        '&:focus-visible': {
          outline: '2px solid var(--color-secondary-main)',
          outlineOffset: 4,
        },
      }}
    >
      <motion.img
        src="/logo.png"
        alt="ScrapNiti"
        whileHover={{ scale: 1.04, rotate: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        style={{
          width: 156,
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}
