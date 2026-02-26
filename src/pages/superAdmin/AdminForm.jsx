import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Switch, FormControlLabel, Button, MenuItem } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import NormalModal from '../../ui/NormalModal';
import UpdatePasswordModal from '../../ui/UpdatePasswordModal';
import inputSx from '../../services/inputStyles';

const AdminForm = forwardRef(({ onSubmit, organizations = [] }, ref) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationId: '', isActive: true });
  const [initialForm, setInitialForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [updatePwdOpen, setUpdatePwdOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        const loaded = {
          name: item.name || '',
          email: item.email || '',
          password: '',
          organizationId: item.organizationId || item.organization || '',
          isActive: Boolean(item.isActive)
        };
        setForm(loaded);
        setInitialForm(loaded);
        setEditingId(item._id || item.id || null);
      } else {
        setForm({ name: '', email: '', password: '', organizationId: '', isActive: true });
        setInitialForm(null);
        setEditingId(null);
      }
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingId(null);
    }
  }));

  useEffect(() => {
    if (organizations.length === 1) setForm((p) => ({ ...p, organizationId: organizations[0]._id || organizations[0].id }));
  }, [organizations]);

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,24}$/.test(form.email)) err.email = 'Enter a valid email';
    if (!editingId && form.password.length < 6) err.password = 'Password must be at least 6 characters';
    if (!form.organizationId) err.organizationId = 'Select organization';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const isDirty = !editingId || !initialForm || JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form };
    onSubmit(payload, editingId);
    setForm({ name: '', email: '', password: '', organizationId: '', isActive: true });
    setInitialForm(null);
    setErrors({});
    setEditingId(null);
    setOpen(false);
  };

  return (
    <>
    <NormalModal
      open={open}
      onClose={() => setOpen(false)}
      title={editingId ? 'Edit Admin' : 'Add Admin User'}
      showCloseButton={!editingId}
      actions={<>
        {editingId && (
          <Button
            startIcon={<LockResetIcon />}
            onClick={() => setUpdatePwdOpen(true)}
            variant="outlined"
            sx={{ mr: 'auto', borderColor: 'var(--color-secondary-main)', color: 'var(--color-secondary-main)', '&:hover': { borderColor: 'var(--color-secondary-dark)', backgroundColor: 'rgba(103,58,183,0.06)' } }}
          >
            Update Password
          </Button>
        )}
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!isDirty} variant="contained" sx={{ backgroundColor: 'var(--color-secondary-main)', '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } }}>{editingId ? 'Save' : 'Create'}</Button>
      </>}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.name)} helperText={errors.name} />
        <TextField label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.email)} helperText={errors.email} />
        {!editingId && (
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.password)} helperText={errors.password} />
        )}
        <TextField select label="Organization" value={form.organizationId} onChange={(e) => setForm((p) => ({ ...p, organizationId: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.organizationId)} helperText={errors.organizationId}>
          <MenuItem value="">Select Organization</MenuItem>
          {Array.isArray(organizations) && organizations.map(org => (
            <MenuItem key={org._id || org.id} value={org._id || org.id}>{org.name}</MenuItem>
          ))}
        </TextField>
        <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' } }} />} label="Is Active" />
      </Box>
    </NormalModal>

    <UpdatePasswordModal
      open={updatePwdOpen}
      onClose={() => setUpdatePwdOpen(false)}
      userId={editingId}
      onSuccess={() => {}}
    />
    </>
  );
});

AdminForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  organizations: PropTypes.array,
};

export default AdminForm;
