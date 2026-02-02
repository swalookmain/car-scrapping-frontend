import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Box, InputBase, Avatar, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune'; 
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import NotificationModal from './NotificationModal';
import ProfileModal from './ProfileModal';

const Header = memo(({ handleDrawerToggle, drawerWidth, isSidebarOpen, isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Mobile Search State
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  // Notification Modal State
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationButtonRef = useRef(null);
    // Profile Modal State
    const [profileOpen, setProfileOpen] = useState(false);
    const profileButtonRef = useRef(null);
    // Fullscreen State
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
      const onFsChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsFullscreen(!!document.fullscreenElement);
        }
      };

      document.addEventListener('fullscreenchange', onFsChange);
      window.addEventListener('keydown', onKeyDown);

      return () => {
        document.removeEventListener('fullscreenchange', onFsChange);
        window.removeEventListener('keydown', onKeyDown);
      };
    }, []);

    const toggleFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (err) {
        // ignore or log
        // console.error('Fullscreen toggle failed', err);
      }
    };

  // Use useCallback for event handlers
  const handleFullscreenToggle = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, [isFullscreen]);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'var(--color-paper)',
        color: 'text.primary',
        transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
        width: { md: `calc(100% - ${isSidebarOpen ? 260 : 80}px)` },
        ml: { md: `${isSidebarOpen ? 260 : 80}px` },
        borderBottom: 'none',
      }}
    >
      {/* --- LOADER (Only visible when isLoading is true) --- */}
      <Box sx={{ width: '100%', height: '3px' }}>
         {isLoading && <LinearProgress color="secondary" sx={{ height: '3px' }} />}
      </Box>

      <Toolbar sx={{ paddingY: 1.5, justifyContent: 'space-between' }}>
        
        {mobileSearchOpen && isMobile ? (
             <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'var(--color-grey-50)',
                    border: '1px solid var(--color-grey-200)',
                    borderRadius: '12px',
                    padding: '4px 16px',
                    flex: 1
                  }}
                >
                  <SearchIcon sx={{ color: 'var(--color-grey-500)' }} />
                  <InputBase
                    placeholder="Search"
                    autoFocus
                    sx={{ ml: 1, flex: 1, color: 'var(--color-grey-900)' }}
                  />
                  <IconButton size="small">
                      <TuneIcon sx={{ color: 'var(--color-grey-500)' }} />
                  </IconButton>
                </Box>
                
                <Box
                    onClick={() => setMobileSearchOpen(false)}
                    sx={{
                        bgcolor: 'var(--color-orange-light)',
                        borderRadius: '8px',
                        width: 38,
                        height: 38,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <CloseIcon sx={{ color: 'var(--color-orange-dark)' }} />
                </Box>
             </Box>
        ) : (
            // --- NORMAL HEADER VIEW ---
            <>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Toggle Button */}
                    <Box
                    sx={{
                        width: 34,
                        height: 34,
                        bgcolor: 'var(--color-secondary-light)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'var(--color-secondary-200)' }
                    }}
                    onClick={handleDrawerToggle}
                    >
                    <MenuIcon sx={{ color: 'var(--color-secondary-dark)', fontSize: '1.3rem' }} />
                    </Box>

                    {/* Desktop Search Bar */}
                    <Box
                    sx={{
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        bgcolor: 'transparent',
                        border: '1px solid var(--color-grey-200)',
                        borderRadius: '12px',
                        padding: '4px 16px',
                        width: '100%',
                        maxWidth: '400px'
                    }}
                    >
                        <SearchIcon sx={{ color: 'var(--color-grey-500)' }} />
                        <InputBase
                            placeholder="Search"
                            sx={{ ml: 1, flex: 1, color: 'var(--color-grey-900)' }}
                        />
                        <IconButton size="small">
                            <TuneIcon sx={{ color: 'var(--color-grey-500)' }} />
                        </IconButton>
                    </Box>

                    {/* Mobile Search Icon Trigger */}
                    <Box
                       sx={{
                           display: { xs: 'flex', sm: 'none' },
                           bgcolor: 'var(--color-secondary-light)',
                           borderRadius: '8px',
                           width: 34,
                           height: 34,
                           alignItems: 'center',
                           justifyContent: 'center',
                           cursor: 'pointer',
                           mr: 2
                       }}
                       onClick={() => setMobileSearchOpen(true)}
                    >
                        <SearchIcon sx={{ color: 'var(--color-secondary-dark)', fontSize: '1.2rem' }} />
                    </Box>
                </Box>

                {/* Right Side Icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Fullscreen Toggle */}
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: 'var(--color-secondary-light)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? (
                      <FullscreenExitIcon sx={{ color: 'var(--color-secondary-dark)', fontSize: '1.2rem' }} />
                    ) : (
                      <FullscreenIcon sx={{ color: 'var(--color-secondary-dark)', fontSize: '1.2rem' }} />
                    )}
                  </Box>
                    <Box sx={{ position: 'relative' }}>
                        <Box
                            ref={notificationButtonRef}
                            onClick={() => setNotificationOpen(!notificationOpen)}
                            sx={{
                            width: 34,
                            height: 34,
                            bgcolor: 'var(--color-warning-light)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            }}
                        >
                            <NotificationsNoneIcon sx={{ color: 'var(--color-warning-dark)', fontSize: '1.3rem' }} />
                        </Box>
                        <NotificationModal 
                            isOpen={notificationOpen} 
                            onClose={() => setNotificationOpen(false)}
                            anchorRef={notificationButtonRef}
                        />
                    </Box>

                    <Box
                    ref={profileButtonRef}
                    onClick={() => setProfileOpen(!profileOpen)}
                    sx={{
                        bgcolor: 'var(--color-primary-light)',
                        height: '48px',
                        borderRadius: '27px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 10px',
                        cursor: 'pointer',
                        gap: 1
                    }}
                    >
                        <Avatar 
                            src="" 
                            sx={{ width: 34, height: 34, bgcolor: 'var(--color-warning-main)' }} 
                        />
                        <SettingsIcon sx={{ color: 'var(--color-primary-main)' }} />
                    </Box>
                    <ProfileModal
                      isOpen={profileOpen}
                      onClose={() => setProfileOpen(false)}
                      anchorRef={profileButtonRef}
                    />
                </Box>
            </>
        )}
      </Toolbar>
    </AppBar>
  );
});

export default Header;