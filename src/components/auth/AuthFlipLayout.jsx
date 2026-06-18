import { useRef, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import AuthBackground from './AuthBackground';
import AuthLogo from './AuthLogo';
import AuthTabSwitcher from './AuthTabSwitcher';
import AuthBrandPanel from './AuthBrandPanel';

const burstVariants = {
  initial: { scale: 0, opacity: 0.9 },
  animate: {
    scale: 2.8,
    opacity: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const panelVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 72 : -72,
    scale: 0.9,
    rotateX: dir > 0 ? 8 : -8,
    filter: 'blur(14px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateX: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.055,
      delayChildren: 0.12,
    },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -56 : 56,
    scale: 0.92,
    rotateX: dir > 0 ? -6 : 6,
    filter: 'blur(10px)',
    transition: { duration: 0.4, ease: [0.4, 0, 0.9, 1] },
  }),
};

export default function AuthFlipLayout() {
  const location = useLocation();
  const isSignup = location.pathname === '/signup';
  const prevPath = useRef(location.pathname);
  const directionRef = useRef(0);

  useLayoutEffect(() => {
    if (prevPath.current !== location.pathname) {
      directionRef.current = isSignup ? 1 : -1;
      prevPath.current = location.pathname;
    }
  }, [location.pathname, isSignup]);

  const direction = directionRef.current;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #f8f6fc 0%, #ece6f5 40%, #e2daf0 100%)',
        perspective: '1200px',
        py: { xs: 3, md: 4 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <AuthBackground />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 960,
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0, md: 2 },
        }}
      >
        <AuthBrandPanel isSignup={isSignup} />

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,
            transformStyle: 'preserve-3d',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <AuthLogo />
          </Box>

          <Box sx={{ width: '100%', maxWidth: 440, position: 'relative' }}>
            <AuthTabSwitcher />

            <Box sx={{ position: 'relative', transformStyle: 'preserve-3d' }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={location.pathname}
                  custom={direction}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{
                    transformOrigin: 'center center',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                <motion.div
                  key={`burst-${location.pathname}`}
                  variants={burstVariants}
                  initial="initial"
                  animate="animate"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 120,
                    height: 120,
                    marginLeft: -60,
                    marginTop: -60,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle, rgba(103,58,183,0.35) 0%, rgba(33,150,243,0.15) 40%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
