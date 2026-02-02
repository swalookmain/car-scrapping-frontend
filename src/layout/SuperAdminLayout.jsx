import { useState, useEffect } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import useSidebarState from '../hooks/useSidebarState';

const drawerWidth = 260;
const miniDrawerWidth = 80;

const SuperAdminLayout = ({ children }) => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'));
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
          p: 3,
          width: { sm: `calc(100% - ${leftDrawerOpened ? drawerWidth : miniDrawerWidth}px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeInOut,
            duration: 300,
          }),
          marginTop: '80px',
          backgroundColor: 'var(--color-grey-100)',
          minHeight: '100vh',
          borderRadius: '12px 12px 0 0'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SuperAdminLayout;
