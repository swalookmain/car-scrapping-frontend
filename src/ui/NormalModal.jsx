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
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          pt: 3,
          px: 3
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'var(--color-grey-900)' }}>
          {title}
        </Typography>
        {showCloseButton && (
          <IconButton
            onClick={onClose}
            sx={{
              color: 'var(--color-grey-500)',
              '&:hover': {
                backgroundColor: 'var(--color-grey-100)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Box sx={{ pt: 1 }}>
          {children}
        </Box>
      </DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 3 }}>
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