import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const ConfirmDialog = ({ open, title = 'Confirm', description = 'Are you sure?', onConfirm, onClose, confirmText = 'Yes', cancelText = 'Cancel' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(18,25,38,0.35)',
          backdropFilter: 'blur(4px)',
        },
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1rem', pt: 2.5, pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ borderRadius: '10px', color: 'var(--color-grey-600)' }}> {cancelText} </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            borderRadius: '10px',
            backgroundColor: 'var(--color-secondary-main)',
            boxShadow: '0 4px 14px rgba(103,58,183,0.25)',
            '&:hover': {
              backgroundColor: 'var(--color-secondary-dark)',
              boxShadow: '0 6px 20px rgba(103,58,183,0.35)',
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string
};

export default ConfirmDialog;
