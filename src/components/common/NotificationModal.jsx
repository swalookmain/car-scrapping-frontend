import React, { useState, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { IoChevronDown, IoStorefrontOutline } from 'react-icons/io5';
import { HiOutlineMail } from 'react-icons/hi';
import { Popper, Paper, Box, Typography, Button, ClickAwayListener, Avatar } from '@mui/material';

// Sample notification data
const initialNotifications = [
  {
    id: 1,
    type: 'user',
    avatar: null,
    name: 'John Doe',
    message: 'It is a long established fact that a reader will be distracted',
    time: '2 min ago',
    isUnread: true,
    isNew: true,
  },
  {
    id: 2,
    type: 'store',
    icon: IoStorefrontOutline,
    iconBg: 'bg-success-main',
    name: 'Store Verification Done',
    message: 'We have successfully received your request.',
    time: '2 min ago',
    isUnread: true,
    isNew: false,
  },
  {
    id: 3,
    type: 'mail',
    icon: HiOutlineMail,
    iconBg: 'bg-primary-main',
    name: 'New Message',
    message: 'You have a new message in your inbox.',
    time: '10 min ago',
    isUnread: false,
    isNew: false,
  },
];

const NotificationModal = memo(function NotificationModal({ isOpen, onClose, anchorRef }) {
  const [filter, setFilter] = useState('All Notification');
  const filterOptions = ['All Notification', 'Unread', 'New'];
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const modalRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    if (!isOpen) setShowFilterDropdown(false);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'All Notification') return true;
    if (filter === 'Unread') return n.isUnread;
    if (filter === 'New') return n.isNew;
    return true;
  });

  return (
    <Popper
      open={isOpen}
      anchorEl={anchorRef && anchorRef.current}
      placement="bottom-end"
      modifiers={[{ name: 'offset', options: { offset: [0, 8] } }, { name: 'preventOverflow', options: { boundary: 'viewport' } }]}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 1 }}
    >
      <ClickAwayListener
        onClickAway={(e) => {
          if (anchorRef?.current && anchorRef.current.contains(e.target)) return;
          onClose();
        }}
      >
        <Paper
          ref={modalRef}
          elevation={3}
          sx={{
            width: 360,
            maxHeight: 420,
            overflow: 'hidden',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: '1px solid var(--color-grey-100)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-grey-900)' }}>All Notification</Typography>
              {unreadCount > 0 && (
                <Typography component="span" sx={{ bgcolor: 'var(--color-secondary-main)', color: '#fff', fontSize: '0.65rem', px: 1, py: 0.4, borderRadius: 1 }}>
                  {unreadCount.toString().padStart(2, '0')}
                </Typography>
              )}
            </Box>
            <Button size="small" onClick={handleMarkAllRead} sx={{ textTransform: 'none' }}>Mark all read</Button>
          </Box>

          <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid var(--color-grey-100)' }}>
            <Box ref={filterRef} sx={{ position: 'relative' }}>
              <Button fullWidth variant="outlined" onClick={() => setShowFilterDropdown(!showFilterDropdown)} endIcon={<IoChevronDown className={showFilterDropdown ? 'rotate-180' : ''} />} sx={{ justifyContent: 'space-between', textTransform: 'none' }}>
                <Typography sx={{ color: 'var(--color-grey-700)', fontSize: '0.875rem' }}>{filter}</Typography>
              </Button>

              {showFilterDropdown && (
                <Paper sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 1, zIndex: 10 }}>
                  {filterOptions.map((option) => (
                    <Box key={option} sx={{ px: 2, py: 1, cursor: 'pointer', '&:hover': { bgcolor: 'var(--color-grey-50)' } }} onClick={() => { setFilter(option); setShowFilterDropdown(false); }}>
                      <Typography sx={{ fontSize: '0.9rem', color: filter === option ? 'var(--color-secondary-main)' : 'var(--color-grey-700)', fontWeight: filter === option ? 600 : 400 }}>{option}</Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          </Box>

          <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
            {filteredNotifications.map((notification) => {
              const IconComp = notification.icon;
              return (
                <Box key={notification.id} sx={{ display: 'flex', gap: 2, px: 2, py: 1.25, borderBottom: '1px solid var(--color-grey-100)', alignItems: 'flex-start' }}>
                  {notification.type === 'user' ? (
                    notification.avatar ? (
                      <Avatar src={notification.avatar} sx={{ width: 40, height: 40 }} />
                    ) : (
                      <Avatar sx={{ bgcolor: 'var(--color-secondary-main)', width: 40, height: 40 }}>{(notification.name?.charAt(0) || '?').toUpperCase()}</Avatar>
                    )
                  ) : (
                    <Avatar sx={{ bgcolor: notification.iconBg === 'bg-success-main' ? 'var(--color-success-main)' : 'var(--color-primary-main)', width: 40, height: 40 }}>
                      {IconComp ? <IconComp style={{ color: '#fff' }} /> : null}
                    </Avatar>
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography noWrap sx={{ fontWeight: 700, color: 'var(--color-grey-900)', fontSize: '0.95rem' }}>{notification.name}</Typography>
                      <Typography sx={{ color: 'var(--color-grey-500)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{notification.time}</Typography>
                    </Box>
                    <Typography sx={{ color: 'var(--color-grey-600)', fontSize: '0.9rem', mt: 0.5 }} noWrap>{notification.message}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {notification.isUnread && <Box sx={{ color: 'var(--color-secondary-main)', border: '1px solid var(--color-secondary-main)', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem' }}>Unread</Box>}
                      {notification.isNew && <Box sx={{ color: 'var(--color-warning-dark)', border: '1px solid var(--color-warning-dark)', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem' }}>New</Box>}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ px: 2, py: 1.25, borderTop: '1px solid var(--color-grey-100)', textAlign: 'center' }}>
            <Button size="small" sx={{ textTransform: 'none' }}>View All</Button>
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
});

NotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  anchorRef: PropTypes.object,
};

export default NotificationModal;
