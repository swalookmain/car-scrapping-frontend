import React, { memo, useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Tooltip,
  Collapse,
  Popover,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

const pathMatches = (pathname, path) => pathname === path;

const Sidebar = memo(({ drawerOpen, drawerToggle, drawerWidth, miniDrawerWidth, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const { user } = useAuth();

  const sidebarConfig = getFilteredSidebarConfig(user?.role) || [];
  const [openGroups, setOpenGroups] = useState({});
  const [flyout, setFlyout] = useState({ anchor: null, item: null });

  useEffect(() => {
    const next = {};
    for (const section of sidebarConfig) {
      for (const item of section.items) {
        if (!item.children?.length) continue;
        if (item.children.some((c) => pathMatches(location.pathname, c.path))) {
          next[item.label] = true;
        }
      }
    }
    if (Object.keys(next).length) {
      setOpenGroups((prev) => ({ ...prev, ...next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to route; config is role-stable
  }, [location.pathname, user?.role]);

  useEffect(() => {
    if (drawerOpen) setFlyout({ anchor: null, item: null });
  }, [drawerOpen]);

  const activeItemRef = useRef(null);
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname]);

  const handleNavigate = useCallback((e) => {
    const path = e.currentTarget.dataset.path;
    if (onItemClick) onItemClick();
    setFlyout({ anchor: null, item: null });
    navigate(path);
  }, [navigate, onItemClick]);

  const navigateTo = useCallback((path) => {
    if (onItemClick) onItemClick();
    setFlyout({ anchor: null, item: null });
    navigate(path);
  }, [navigate, onItemClick]);

  const toggleGroup = useCallback((label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const openFlyout = useCallback((event, item) => {
    setFlyout({ anchor: event.currentTarget, item });
  }, []);

  const closeFlyout = useCallback(() => {
    setFlyout({ anchor: null, item: null });
  }, []);

  const renderNavButton = (item, { nested = false } = {}) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    const isCollapsed = !drawerOpen;

    const navButton = (
      <ListItemButton
        key={item.path}
        ref={active ? activeItemRef : null}
        data-path={item.path}
        onClick={handleNavigate}
        className={isCollapsed && active ? 'collapsedActive' : undefined}
        aria-current={active ? 'page' : undefined}
        aria-label={isCollapsed ? item.label : undefined}
        sx={{
          borderRadius: isCollapsed ? '10px' : '8px',
          mb: 0.5,
          py: isCollapsed ? 0.6 : nested ? 0.55 : 0.75,
          px: isCollapsed ? 0 : nested ? 1 : 1.25,
          pl: !isCollapsed && nested ? 2.5 : undefined,
          justifyContent: isCollapsed ? 'center' : 'initial',
          minHeight: isCollapsed ? 44 : nested ? 32 : 36,
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
          <Icon sx={{ fontSize: isCollapsed ? '1.25rem' : nested ? '1.05rem' : '1.15rem', color: 'inherit' }} />
        </ListItemIcon>

        {!isCollapsed && (
          <ListItemText
            primary={item.label}
            sx={{
              '& .MuiTypography-root': {
                fontSize: nested ? '0.78rem' : '0.82rem',
                fontWeight: active ? 600 : 400,
                color: active ? S.activeColor : S.text,
                letterSpacing: '-0.01em',
              },
            }}
          />
        )}

        {active && !isCollapsed && (
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: S.activeDot, flexShrink: 0, ml: 1 }} />
        )}
      </ListItemButton>
    );

    if (!isCollapsed) return navButton;

    return (
      <Tooltip
        key={item.path}
        title={item.label}
        placement="right"
        arrow
        enterDelay={200}
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: '#2B1450',
              fontSize: '0.75rem',
              fontWeight: 600,
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(43,20,80,0.35)',
            },
          },
          arrow: { sx: { color: '#2B1450' } },
        }}
      >
        {navButton}
      </Tooltip>
    );
  };

  const renderGroupItem = (item) => {
    const Icon = item.icon;
    const isCollapsed = !drawerOpen;
    const childActive = item.children.some((c) => pathMatches(location.pathname, c.path));
    const open = !!openGroups[item.label] || childActive;
    const flyoutOpen = flyout.item?.label === item.label;

    if (isCollapsed) {
      const collapsedBtn = (
        <ListItemButton
          onClick={(e) => openFlyout(e, item)}
          className={childActive || flyoutOpen ? 'collapsedActive' : undefined}
          aria-label={item.label}
          aria-haspopup="menu"
          aria-expanded={flyoutOpen}
          sx={{
            borderRadius: '10px',
            mb: 0.5,
            py: 0.6,
            px: 0,
            justifyContent: 'center',
            minHeight: 44,
            position: 'relative',
            borderLeft: '4px solid transparent',
            '&:hover': { backgroundColor: S.hoverBg },
            '&.collapsedActive::after': {
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
            },
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0,
            justifyContent: 'center',
            color: childActive || flyoutOpen ? '#fff' : S.text,
            display: 'flex', alignItems: 'center',
            ...(childActive || flyoutOpen ? {
              background: 'linear-gradient(135deg, #A78BFA 0%, #7C4DFF 50%, #6A4BFF 100%)',
              width: 46, height: 46, borderRadius: '13px',
              boxShadow: '0 8px 24px rgba(138,99,255,0.25)',
            } : {}),
          }}>
            <Icon sx={{ fontSize: '1.25rem', color: 'inherit' }} />
          </ListItemIcon>
        </ListItemButton>
      );

      return (
        <Tooltip
          key={item.label}
          title={item.label}
          placement="right"
          arrow
          enterDelay={150}
          disableHoverListener={flyoutOpen}
          slotProps={{
            tooltip: {
              sx: {
                bgcolor: '#2B1450',
                fontSize: '0.75rem',
                fontWeight: 600,
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(43,20,80,0.35)',
              },
            },
            arrow: { sx: { color: '#2B1450' } },
          }}
        >
          {collapsedBtn}
        </Tooltip>
      );
    }

    return (
      <React.Fragment key={item.label}>
        <ListItemButton
          onClick={() => toggleGroup(item.label)}
          sx={{
            borderRadius: '8px',
            mb: 0.25,
            py: 0.75,
            px: 1.25,
            borderLeft: childActive ? `4px solid ${S.collapsedActiveBar}` : '4px solid transparent',
            backgroundColor: childActive ? S.activeBg : 'transparent',
            '&:hover': { backgroundColor: childActive ? S.activeBg : S.hoverBg },
          }}
        >
          <ListItemIcon sx={{
            minWidth: 0,
            mr: 1.25,
            justifyContent: 'center',
            color: childActive ? S.activeColor : S.text,
          }}>
            <Icon sx={{ fontSize: '1.15rem', color: 'inherit' }} />
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            sx={{
              '& .MuiTypography-root': {
                fontSize: '0.82rem',
                fontWeight: childActive ? 600 : 400,
                color: childActive ? S.activeColor : S.text,
                letterSpacing: '-0.01em',
              },
            }}
          />
          {open ? (
            <ExpandLessIcon sx={{ fontSize: '1.1rem', color: S.muted }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: '1.1rem', color: S.muted }} />
          )}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ mb: 0.5 }}>
            {item.children.map((child) => renderNavButton(child, { nested: true }))}
          </List>
        </Collapse>
      </React.Fragment>
    );
  };

  /* ─────────── drawer content ─────────── */
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Logo area ── */}
      <Box sx={{
        px: drawerOpen ? 2 : 0,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1px solid ${S.border}`,
        minHeight: '64px',
        overflowX: 'hidden',
      }}>
        {drawerOpen ? (
          <Box sx={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            borderRadius: '12px', 
            p: 1, 
            px: 1.5,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: '140px',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>
        ) : (
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            borderRadius: '10px', 
            width: 40,
            height: 40,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.4)',
            flexShrink: 0,
          }}>
            <Box
              component="img"
              src="/logo1.png"
              alt="Logo"
              sx={{
                width: '28px',
                height: '28px',
                objectFit: 'contain',
              }}
            />
          </Box>
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
            {section.items.map((item) =>
              item.children?.length
                ? renderGroupItem(item)
                : renderNavButton(item),
            )}
          </React.Fragment>
        ))}
      </List>

      {/* ── Collapse toggle ── */}
      {matchUpMd && (
        <Box sx={{ px: 1, py: 1, borderTop: `1px solid ${S.border}` }}>
          <Tooltip
            title={drawerOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            placement="right"
            arrow
            disableHoverListener={drawerOpen}
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor: '#2B1450',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                },
              },
              arrow: { sx: { color: '#2B1450' } },
            }}
          >
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
          </Tooltip>
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

      {/* Collapsed parent → flyout children menu */}
      <Popover
        open={Boolean(flyout.anchor) && Boolean(flyout.item)}
        anchorEl={flyout.anchor}
        onClose={closeFlyout}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              ml: 1,
              minWidth: 200,
              bgcolor: '#2B1450',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 12px 40px rgba(43,20,80,0.45)',
              overflow: 'hidden',
            },
          },
        }}
      >
        {flyout.item && (
          <Box sx={{ py: 0.75 }}>
            <Typography sx={{
              px: 1.75, pt: 0.5, pb: 0.75,
              fontSize: '0.65rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.45)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {flyout.item.label}
            </Typography>
            <List disablePadding dense>
              {flyout.item.children.map((child) => {
                const ChildIcon = child.icon;
                const active = location.pathname === child.path;
                return (
                  <ListItemButton
                    key={child.path}
                    onClick={() => navigateTo(child.path)}
                    sx={{
                      px: 1.5, py: 0.85, mx: 0.5, mb: 0.25, borderRadius: '8px',
                      backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: 1.25, color: active ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                      <ChildIcon sx={{ fontSize: '1.05rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={child.label}
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '0.8rem',
                          fontWeight: active ? 600 : 400,
                          color: active ? '#fff' : 'rgba(255,255,255,0.9)',
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        )}
      </Popover>
    </Box>
  );
});

export default Sidebar;