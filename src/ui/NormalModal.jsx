import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useModalLock } from '../context/ModalLockContext';

const NormalModal = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true
}) => {
  const { lock, unlock } = useModalLock();

  useEffect(() => {
    if (open) lock();
    else unlock();
    return () => {
      // ensure unlock on unmount
      unlock();
    };
  }, [open, lock, unlock]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(18,25,38,0.4)',
          backdropFilter: 'blur(4px)',
        },
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          margin: { xs: '8px', sm: '16px', md: '32px' },
          maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)', md: 'calc(100% - 64px)' },
          width: { xs: 'calc(100% - 16px)', sm: undefined },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          pt: 2,
          px: 2.5,
          borderBottom: '1px solid var(--color-grey-100)',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-grey-900)' }}>
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'var(--color-grey-400)',
              '&:hover': {
                backgroundColor: 'var(--color-secondary-light)',
                color: 'var(--color-secondary-dark)',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: '1.1rem' }} />
          </IconButton>
        )}
      </DialogTitle>
          <DialogContent sx={{ px: 2.5, pt: 5, mt: 1, pb: 3, overflowY: 'auto', '& > *:first-of-type': { mt: 1 } }}>
            {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid var(--color-grey-100)' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

NormalModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  actions: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool
};

export default NormalModal;