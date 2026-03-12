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
  useMediaQuery,
  useTheme
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAuth } from '../../context/AuthContext';
import { getFilteredSidebarConfig } from '../../config/roleConfig';

/* ── Sidebar palette ── */
const S = {
   // Modern deep gradient with smoother transitions
   bg: 'linear-gradient(180deg, #7C4DFF 0%, #6C3FC7 30%, #4A2D8A 65%, #2B1450 100%)',
  text: 'rgba(255,255,255,0.96)',
  muted: 'rgba(255,255,255,0.56)',
  // Expanded active (glass-like highlight)
  activeBg: 'rgba(255,255,255,0.12)',
  activeColor: '#FFFFFF',
  activeDot: '#EBDFFF',
  collapsedIconColor: '#673AB7',
  // Collapsed active — left indicator bar color (stronger)
  collapsedActiveBar: '#A78BFA',
  hoverBg: 'rgba(255,255,255,0.06)',
   border: 'rgba(255,255,255,0.08)',
};

const Sidebar = memo(({ drawerOpen, drawerToggle, drawerWidth, miniDrawerWidth, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const { user } = useAuth();

  const sidebarConfig = getFilteredSidebarConfig(user?.role) || [];

  const activeItemRef = useRef(null);
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname]);

  const handleNavigate = useCallback((e) => {
    const path = e.currentTarget.dataset.path;
    if (onItemClick) onItemClick();
    navigate(path);
  }, [navigate, onItemClick]);

  /* ─────────── drawer content ─────────── */
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Logo area ── */}
      <Box sx={{
        px: drawerOpen ? 2 : 0,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: drawerOpen ? 'flex-start' : 'center',
        gap: 1.5,
        borderBottom: `1px solid ${S.border}`,
        minHeight: '58px',
        overflowX: 'hidden',
      }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: '10px',
          background: 'linear-gradient(135deg, #A78BFA 0%, #7C4DFF 50%, #5B6CF9 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 14px rgba(124,77,255,0.4)',
        }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1 }}>
            R
          </Typography>
        </Box>
        {drawerOpen && (
          <Typography sx={{
            fontWeight: 700, fontSize: '1rem', color: '#fff',
            letterSpacing: '0.04em', whiteSpace: 'nowrap',
          }}>
            RVSF
          </Typography>
        )}
      </Box>

      {/* ── Navigation list ── */}
      <List sx={{
        px: drawerOpen ? 1 : 0.75,
        py: 1,
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 3 },
        '&::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', borderRadius: 4 },
        '&:hover::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)' },
      }}>
        {sidebarConfig.map((section, sIdx) => (
          <React.Fragment key={section.section}>
            {/* Section label (expanded) or divider (collapsed) */}
            {drawerOpen ? (
              <Typography sx={{
                fontSize: '0.58rem', fontWeight: 600, color: S.muted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                px: 1.5, pt: sIdx === 0 ? 1 : 2.5, pb: 0.75,
                userSelect: 'none',
              }}>
                {section.section}
              </Typography>
            ) : sIdx > 0 ? (
              <Box sx={{ mx: 'auto', my: 0.75, width: 24, height: '1px', bgcolor: S.border }} />
            ) : (
              <Box sx={{ pt: 0.5 }} />
            )}

            {/* Nav items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              const isCollapsed = !drawerOpen;
              return (
                <ListItemButton
                  key={item.path}
                  ref={active ? activeItemRef : null}
                  data-path={item.path}
                  onClick={handleNavigate}
                  className={isCollapsed && active ? 'collapsedActive' : undefined}
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    borderRadius: isCollapsed ? '10px' : '8px',
                    mb: 0.5,
                    py: isCollapsed ? 0.6 : 0.75,
                    px: isCollapsed ? 0 : 1.25,
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    minHeight: isCollapsed ? 44 : 36,
                    // collapsed: we show a subtle purple-tinted chip behind icon + small left bar when active; expanded: pill highlight
                    position: 'relative',
                    borderLeft: isCollapsed ? '4px solid transparent' : (active ? `4px solid ${S.collapsedActiveBar}` : '4px solid transparent'),
                    backgroundColor: !isCollapsed && active ? S.activeBg : 'transparent',
                    boxShadow: !isCollapsed && active ? 'inset 6px 0 12px rgba(138,99,255,0.06)' : 'none',
                    '&:hover': { backgroundColor: !isCollapsed && active ? S.activeBg : S.hoverBg },
                    '&.collapsedActive::after': isCollapsed ? {
                      content: '""',
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 28,
                      bgcolor: S.collapsedActiveBar,
                      borderRadius: 3,
                      boxShadow: '0 2px 8px rgba(138,99,255,0.18)'
                    } : {},
                    transition: 'background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
                  }}
                >
                  {/* Icon */}
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 0 : 1.25,
                    justifyContent: 'center',
                    color: active ? S.activeColor : S.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...(isCollapsed && active ? {
                      background: 'linear-gradient(135deg, #A78BFA 0%, #7C4DFF 50%, #6A4BFF 100%)',
                      width: 46, height: 46, borderRadius: '13px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(138,99,255,0.25)',
                      color: '#fff',
                    } : {}),
                    ...( !isCollapsed && active ? { boxShadow: '0 4px 12px rgba(103,58,183,0.08)' } : {}),
                  }}>
                    <Icon sx={{ fontSize: isCollapsed ? '1.2rem' : '1.1rem', color: 'inherit' }} />
                  </ListItemIcon>

                  {/* Label (hidden when collapsed) */}
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '0.82rem',
                          fontWeight: active ? 600 : 400,
                          color: active ? S.activeColor : S.text,
                          letterSpacing: '-0.01em',
                        },
                      }}
                    />
                  )}

                  {/* Active dot — expanded mode only */}
                  {active && !isCollapsed && (
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: S.activeDot, flexShrink: 0, ml: 1 }} />
                  )}
                </ListItemButton>
              );
            })}
          </React.Fragment>
        ))}
      </List>

      {/* ── Collapse toggle ── */}
      {matchUpMd && (
        <Box sx={{ px: 1, py: 1, borderTop: `1px solid ${S.border}` }}>
          <ListItemButton
            onClick={drawerToggle}
            sx={{
              borderRadius: '8px',
              py: 0.75,
              px: drawerOpen ? 1.25 : 0,
              minHeight: 36,
              justifyContent: drawerOpen ? 'initial' : 'center',
              color: S.muted,
              '&:hover': { backgroundColor: S.hoverBg, color: S.text },
              transition: 'all 0.15s ease',
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: drawerOpen ? 1.25 : 0, justifyContent: 'center', color: 'inherit' }}>
              {drawerOpen ? (
                <ChevronLeftIcon sx={{ fontSize: '1.1rem', transition: 'transform 0.2s ease' }} />
              ) : (
                /* Collapsed: show expand arrow inside a chip */
                <Box sx={{
                  width: 34, height: 34, borderRadius: '9px',
                  border: `1.5px solid ${S.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  '&:hover': { borderColor: 'rgba(255,255,255,0.18)' },
                  transition: 'border-color 0.15s ease',
                }}>
                  <ChevronLeftIcon sx={{ fontSize: '1rem', transform: 'rotate(180deg)' }} />
                </Box>
              )}
            </ListItemIcon>
            {drawerOpen && (
              <ListItemText
                primary="Collapse"
                sx={{ '& .MuiTypography-root': { fontSize: '0.8rem', fontWeight: 400, letterSpacing: '-0.01em' } }}
              />
            )}
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  /* ── Shared paper sx ── */
  const paperSx = {
    boxSizing: 'border-box',
    border: 'none',
    background: S.bg,
    overflowX: 'hidden',
    boxShadow: '4px 0 24px rgba(43,20,80,0.12)',
  };

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? (drawerOpen ? drawerWidth : miniDrawerWidth) : 'auto' }}>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={!matchUpMd && drawerOpen}
        onClose={drawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { ...paperSx, width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            ...paperSx,
            width: drawerOpen ? drawerWidth : miniDrawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
});

export default Sidebar;