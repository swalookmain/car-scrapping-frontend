import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Switch, FormControlLabel, Button, MenuItem } from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';

const AdminForm = forwardRef(({ onSubmit, organizations = [] }, ref) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationId: '', isActive: true });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        setForm({
          name: item.name || '',
          email: item.email || '',
          password: '',
          organizationId: item.organizationId || item.organization || '',
          isActive: Boolean(item.isActive)
        });
        setEditingId(item._id || item.id || null);
      } else {
        setForm({ name: '', email: '', password: '', organizationId: '', isActive: true });
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
    if (form.password.length < 6) err.password = 'Password must be at least 6 characters';
    if (!form.organizationId) err.organizationId = 'Select organization';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form };
    onSubmit(payload, editingId);
    setForm({ name: '', email: '', password: '', organizationId: '', isActive: true });
    setErrors({});
    setEditingId(null);
    setOpen(false);
  };

  return (
    <NormalModal
      open={open}
      onClose={() => setOpen(false)}
      title={editingId ? 'Edit Admin' : 'Add Admin User'}
      showCloseButton={!editingId}
      actions={<>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: 'var(--color-secondary-main)', '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } }}>{editingId ? 'Save' : 'Create'}</Button>
      </>}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.name)} helperText={errors.name} />
        <TextField label="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.email)} helperText={errors.email} />
        <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.password)} helperText={errors.password} />
        <TextField select label="Organization" value={form.organizationId} onChange={(e) => setForm((p) => ({ ...p, organizationId: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.organizationId)} helperText={errors.organizationId}>
          <MenuItem value="">Select Organization</MenuItem>
          {Array.isArray(organizations) && organizations.map(org => (
            <MenuItem key={org._id || org.id} value={org._id || org.id}>{org.name}</MenuItem>
          ))}
        </TextField>
        <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' } }} />} label="Is Active" />
      </Box>
    </NormalModal>
  );
});

AdminForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  organizations: PropTypes.array,
};

export default AdminForm;
