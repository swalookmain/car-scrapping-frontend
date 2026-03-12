import { useState, useEffect } from 'react';
import { Box, CssBaseline, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import useSidebarState from '../hooks/useSidebarState';

const drawerWidth = 240;
const miniDrawerWidth = 72;

const SuperAdminLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const { leftDrawerOpened, handleDrawerToggle, handleMobileItemClick } = useSidebarState();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 320);
    return () => clearTimeout(timer);
  }, [leftDrawerOpened]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={leftDrawerOpened ? drawerWidth : miniDrawerWidth}
        isSidebarOpen={leftDrawerOpened}
        isLoading={isLoading}
      />
      <Sidebar 
        drawerOpen={leftDrawerOpened} 
        drawerToggle={handleDrawerToggle} 
        drawerWidth={drawerWidth}
        miniDrawerWidth={miniDrawerWidth}
        onItemClick={handleMobileItemClick}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 2.5, md: 3 },
          width: { sm: `calc(100% - ${leftDrawerOpened ? drawerWidth : miniDrawerWidth}px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeInOut,
            duration: 300,
          }),
          marginTop: '64px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #eef1f8 50%, #f0ecf5 100%)',
          minHeight: '100vh',
          borderRadius: '16px 0 0 0',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(180deg, rgba(103,58,183,0.03) 0%, transparent 100%)',
            borderRadius: '16px 0 0 0',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminLayout;
