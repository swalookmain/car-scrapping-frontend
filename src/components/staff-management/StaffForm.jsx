import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Switch, FormControlLabel, Button } from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';

const StaffForm = forwardRef(({ onSubmit }, ref) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', isActive: true });
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const refs = {
    name: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    password: useRef(null)
  };

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        setFormData({ name: item.name || '', phone: item.phone || '', email: item.email || '', password: '', isActive: item.status === 'Active' || Boolean(item.isActive) });
        setEditingId(item._id || item.id || null);
      } else {
        setFormData({ name: '', phone: '', email: '', password: '', isActive: true });
        setEditingId(null);
      }
      setOpen(true);
    },
    close: () => { setOpen(false); setEditingId(null); }
  }));

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'phone':
        return value.trim() ? '' : 'Phone number is required';
      case 'email':
        // stricter-ish regex: allow subdomains and TLDs 2-24 chars
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,24}$/.test(value) ? '' : 'Enter a valid email';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      default:
        return '';
    }
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (field === 'email') {
      return;
    }
    setErrors((p) => ({ ...p, [field]: validateField(field, value) }));
  };

  const validateAll = () => {
    const current = {
      name: validateField('name', formData.name),
      phone: validateField('phone', formData.phone),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password)
    };
    setErrors(current);
    return { valid: Object.values(current).every((e) => !e), current };
  };

  const handleSubmit = () => {
    const { valid, current } = validateAll();
    if (!valid) {
      const firstInvalid = Object.keys(current).find((k) => current[k]);
      if (firstInvalid && refs[firstInvalid] && refs[firstInvalid].current) refs[firstInvalid].current.focus();
      return;
    }
    onSubmit({ name: formData.name, phone: formData.phone, email: formData.email, isActive: formData.isActive }, editingId);
    setFormData({ name: '', phone: '', email: '', password: '', isActive: true });
    setErrors({});
    setEditingId(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', phone: '', email: '', password: '', isActive: true });
    setErrors({});
  };

  return (
    <NormalModal open={open} onClose={handleClose} title={editingId ? 'Edit Staff' : 'Add New Staff'} actions={<>
      <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: 'var(--color-secondary-main)', '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } }}>{editingId ? 'Save' : 'Add Staff'}</Button>
    </>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField inputRef={refs.name} label="Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.name)} helperText={errors.name} />
        <TextField inputRef={refs.phone} label="Phone Number" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.phone)} helperText={errors.phone} />
        <TextField inputRef={refs.email} label="Email ID" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.email)} helperText={errors.email} />
        <TextField inputRef={refs.password} label="Password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.password)} helperText={errors.password} />
        <FormControlLabel control={<Switch checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' } }} />} label="Is Active" />
      </Box>
    </NormalModal>
  );
});

StaffForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default StaffForm;
