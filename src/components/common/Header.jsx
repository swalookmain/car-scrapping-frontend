import React, { memo, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  LinearProgress,
  Typography,
  Avatar,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationModal from './NotificationModal';
import ProfileModal from './ProfileModal';
import { useAuth } from '../../context/AuthContext';
import { getPageLabel } from '../../config/roleConfig';

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
};

const Header = memo(({ handleDrawerToggle, drawerWidth, isSidebarOpen, isLoading }) => {
  const location = useLocation();
  const { user } = useAuth();
  const pageLabel = getPageLabel(location.pathname);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationButtonRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef(null);

  const displayName = user?.name || user?.email || 'User';
  const displayRole = user?.role ? roleLabels[user.role] || user.role : '';
  const initial = (displayName.charAt(0) || '?').toUpperCase();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: 'text.primary',
        transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
        width: { md: `calc(100% - ${isSidebarOpen ? drawerWidth : 72}px)` },
        ml: { md: `${isSidebarOpen ? drawerWidth : 72}px` },
        borderBottom: '1px solid rgba(103,58,183,0.08)',
      }}
    >
      <Box sx={{ width: '100%', height: '3px' }}>
        {isLoading && (
          <LinearProgress
            color="secondary"
            sx={{ height: '3px', '& .MuiLinearProgress-bar': { borderRadius: '4px' } }}
          />
        )}
      </Box>

      <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, px: { xs: 1.5, sm: 2.5 }, gap: 2 }}>
        {/* Left: mobile menu + ERP context */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          <IconButton
            onClick={handleDrawerToggle}
            size="small"
            sx={{
              display: { xs: 'flex', md: 'none' },
              color: 'var(--color-grey-700)',
              borderRadius: '10px',
              bgcolor: 'var(--color-secondary-light)',
              '&:hover': { bgcolor: 'var(--color-secondary-200)' },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'var(--color-success-main)',
                  boxShadow: '0 0 0 3px rgba(0,230,118,0.2)',
                  flexShrink: 0,
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-secondary-main)',
                  fontSize: '0.65rem',
                  lineHeight: 1,
                }}
              >
                ScrapNiti ERP
              </Typography>
            </Box>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                fontWeight: 700,
                color: 'var(--color-grey-900)',
                letterSpacing: '-0.02em',
                mt: 0.25,
              }}
            >
              {pageLabel}
            </Typography>
          </Box>
        </Box>

        {/* Right: notifications + profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              ref={notificationButtonRef}
              onClick={() => setNotificationOpen((o) => !o)}
              size="small"
              aria-label="Notifications"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                bgcolor: 'var(--color-warning-light)',
                color: 'var(--color-warning-dark)',
                border: '1px solid rgba(255,193,7,0.25)',
                '&:hover': {
                  bgcolor: '#fff8e1',
                  transform: 'scale(1.04)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Badge variant="dot" color="error" overlap="circular">
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
            <NotificationModal
              isOpen={notificationOpen}
              onClose={() => setNotificationOpen(false)}
              anchorRef={notificationButtonRef}
            />
          </Box>

          <Box
            ref={profileButtonRef}
            onClick={() => setProfileOpen((o) => !o)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setProfileOpen((o) => !o);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pl: 0.5,
              pr: 1.25,
              py: 0.5,
              borderRadius: '14px',
              cursor: 'pointer',
              border: '1px solid var(--color-grey-200)',
              bgcolor: '#fff',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'var(--color-secondary-200)',
                boxShadow: '0 4px 16px rgba(103,58,183,0.1)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.85rem',
                fontWeight: 700,
                bgcolor: 'var(--color-secondary-main)',
              }}
            >
              {initial}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-grey-900)', lineHeight: 1.2 }}
              >
                {displayName}
              </Typography>
              <Typography noWrap sx={{ fontSize: '0.68rem', color: 'var(--color-grey-500)', lineHeight: 1.2 }}>
                {displayRole}
              </Typography>
            </Box>
            <KeyboardArrowDownIcon
              sx={{ fontSize: 18, color: 'var(--color-grey-500)', display: { xs: 'none', sm: 'block' } }}
            />
          </Box>
          <ProfileModal
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            anchorRef={profileButtonRef}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = 'Header';

export default Header;
