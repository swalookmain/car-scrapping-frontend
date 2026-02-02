import { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

const useSidebarState = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'));

  // Get initial state from localStorage or default to true
  const getInitialState = () => {
    const stored = localStorage.getItem('sidebarOpen');
    return stored !== null ? JSON.parse(stored) : true;
  };

  const [leftDrawerOpened, setLeftDrawerOpened] = useState(getInitialState);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(leftDrawerOpened));
  }, [leftDrawerOpened]);

  // Handle responsive behavior: close on mobile
  useEffect(() => {
    if (matchDownMd) {
      setLeftDrawerOpened(false);
    } else {
      // On desktop, restore from localStorage or keep current
      const stored = localStorage.getItem('sidebarOpen');
      if (stored !== null) {
        setLeftDrawerOpened(JSON.parse(stored));
      }
    }
  }, [matchDownMd]);

  const handleDrawerToggle = () => {
    setLeftDrawerOpened(!leftDrawerOpened);
  };

  const handleMobileItemClick = () => {
    if (matchDownMd) {
      setLeftDrawerOpened(false);
    }
  };

  return {
    leftDrawerOpened,
    handleDrawerToggle,
    handleMobileItemClick
  };
};

export default useSidebarState;