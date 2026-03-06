import React, { memo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Box,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { getFilteredSidebarConfig } from '../../config/roleConfig';

const Sidebar = memo(({ drawerOpen, drawerToggle, drawerWidth, miniDrawerWidth, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const { user } = useAuth();

  const sidebarConfig = getFilteredSidebarConfig(user?.role) || [];

  // Auto-scroll active sidebar item into view on route change
  const activeItemRef = useRef(null);
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Stable handler — reads target path from data-path attribute to avoid
  // creating a new function reference on every render iteration.
  const handleNavigate = useCallback((e) => {
    const path = e.currentTarget.dataset.path;
    if (onItemClick) onItemClick();
    navigate(path);
  }, [navigate, onItemClick]);

  const drawerContent = (
    <>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, height: '88px', overflowX: 'hidden' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
             <circle cx="16" cy="16" r="14" fill="url(#paint0_linear)" />
             <defs>
                 <linearGradient id="paint0_linear" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                   <stop stopColor="#673ab7"/>
                   <stop offset="1" stopColor="#2196f3"/>
                 </linearGradient>
             </defs>
          </svg>
           {drawerOpen && (
             <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.6rem', color: '#121926' }}>
               RVSF
             </Typography>
           )}
      </Box>

        <List sx={{ px: 2, overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 140px)', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'transparent' }, '&:hover': { '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.12)' } } }}>
          {sidebarConfig.map((section, sectionIndex) => (
            <React.Fragment key={section.section}>
              {drawerOpen && (
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, display: 'block', ml: 1, fontSize: '0.95rem', mt: sectionIndex === 0 ? 0.5 : 0 }}>
                  {section.section}
                </Typography>
              )}
              <Box sx={{ pl: drawerOpen ? 2.5 : 0, mb: 0.5 }}>
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <ListItemButton
                      key={item.path}
                      ref={location.pathname === item.path ? activeItemRef : null}
                      data-path={item.path}
                      onClick={handleNavigate}
                      sx={{
                        borderRadius: '10px',
                        mb: 0.5,
                        backgroundColor: location.pathname === item.path ? 'var(--color-secondary-light)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'var(--color-secondary-light)'
                        },
                        justifyContent: drawerOpen ? 'initial' : 'center',
                        minHeight: 44,
                        px: 1.5
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: drawerOpen ? 2 : 'auto', justifyContent: 'center' }}>
                        <IconComponent sx={{ color: 'var(--color-secondary-main)' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        sx={{ opacity: drawerOpen ? 1 : 0, color: 'var(--color-secondary-main)', fontWeight: 600 }}
                        primaryTypographyProps={{ fontSize: '1rem' }}
                      />
                    </ListItemButton>
                  );
                })}
              </Box>
              {sectionIndex < sidebarConfig.length - 1 && (
                <Divider sx={{ my: 2.5, mx: 1, borderColor: 'var(--color-grey-200)' }} />
              )}
            </React.Fragment>
          ))}
        </List>
    </>
  );

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? (drawerOpen ? drawerWidth : miniDrawerWidth) : 'auto' }}>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={!matchUpMd && drawerOpen}
        onClose={drawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
             boxSizing: 'border-box', 
             width: drawerWidth, 
             border: 'none',
             bgcolor: 'var(--color-paper)',
             overflowX: 'hidden'
           },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerOpen ? drawerWidth : miniDrawerWidth,
            borderRight: 'none', 
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            bgcolor: 'var(--color-paper)',
            boxShadow: 'none'
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
});

export default Sidebar;