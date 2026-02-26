import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Button } from '@mui/material';
import NormalModal from './NormalModal';
import inputSx from '../services/inputStyles';
import { usersApi } from '../services/api';
import toast from 'react-hot-toast';

const UpdatePasswordModal = ({ open, onClose, userId, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const validate = () => {
    const e = {};
    if (!newPassword || newPassword.length < 6) e.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!userId) return;
    setSubmitting(true);
    try {
      await usersApi.updateUser(userId, { password: newPassword });
      if (onSuccess) onSuccess();
      onClose();
      toast.success('Password updated successfully');
    } catch (err) {
      console.error('Password update failed', err);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title="Update Password"
      maxWidth="xs"
      actions={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting} sx={{ backgroundColor: 'var(--color-secondary-main)', '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } }}>Update</Button>
      </>}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.newPassword)} helperText={errors.newPassword} />
        <TextField label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword} />
      </Box>
    </NormalModal>
  );
};

UpdatePasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
};

UpdatePasswordModal.defaultProps = {
  userId: null,
  onSuccess: null,
};

export default UpdatePasswordModal;
