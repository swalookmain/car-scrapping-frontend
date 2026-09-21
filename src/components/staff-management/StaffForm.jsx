import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  InputAdornment,
  Checkbox,
  FormGroup,
  Typography,
  FormControlLabel as MuiFormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LockResetIcon from '@mui/icons-material/LockReset';
import NormalModal from '../../ui/NormalModal';
import UpdatePasswordModal from '../../ui/UpdatePasswordModal';
import inputSx from '../../services/inputStyles';
import { usersApi } from '../../services/api';

const emptyForm = { name: '', phone: '', email: '', password: '', isActive: true, allowedModules: [] };

const StaffForm = forwardRef(({ onSubmit }, ref) => {
  const [formData, setFormData] = useState(emptyForm);
  const [initialData, setInitialData] = useState(null);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [updatePwdOpen, setUpdatePwdOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const refs = {
    name: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    password: useRef(null)
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    usersApi.getAssignableModules()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setModules(list.filter((m) => m.assignableToStaff));
      })
      .catch(() => {
        if (!cancelled) setModules([]);
      });
    return () => { cancelled = true; };
  }, [open]);

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        const loaded = {
          name: item.name || '',
          phone: item.phone || '',
          email: item.email || '',
          password: '',
          isActive: item.status === 'Active' || Boolean(item.isActive),
          allowedModules: Array.isArray(item.allowedModules) ? item.allowedModules : [],
        };
        setFormData(loaded);
        setInitialData(loaded);
        setEditingId(item._id || item.id || null);
      } else {
        setFormData(emptyForm);
        setInitialData(null);
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

  const toggleModule = (id) => {
    setFormData((p) => {
      const has = p.allowedModules.includes(id);
      return {
        ...p,
        allowedModules: has
          ? p.allowedModules.filter((m) => m !== id)
          : [...p.allowedModules, id],
      };
    });
  };

  const selectAllModules = () => {
    setFormData((p) => ({ ...p, allowedModules: modules.map((m) => m.id) }));
  };

  const deselectAllModules = () => {
    setFormData((p) => ({ ...p, allowedModules: [] }));
  };

  const validateAll = () => {
    const current = {
      name: validateField('name', formData.name),
      phone: validateField('phone', formData.phone),
      email: validateField('email', formData.email),
      ...(editingId ? {} : { password: validateField('password', formData.password) })
    };
    setErrors(current);
    return { valid: Object.values(current).every((e) => !e), current };
  };

  const isDirty = !editingId || !initialData || JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSubmit = () => {
    const { valid, current } = validateAll();
    if (!valid) {
      const firstInvalid = Object.keys(current).find((k) => current[k]);
      if (firstInvalid && refs[firstInvalid] && refs[firstInvalid].current) refs[firstInvalid].current.focus();
      return;
    }
    onSubmit({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      isActive: formData.isActive,
      allowedModules: formData.allowedModules,
    }, editingId);
    setFormData(emptyForm);
    setInitialData(null);
    setErrors({});
    setEditingId(null);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(emptyForm);
    setInitialData(null);
    setErrors({});
  };

  return (
    <>
    <NormalModal open={open} onClose={handleClose} title={editingId ? 'Edit Staff' : 'Add New Staff'} actions={<>
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
      <Button onClick={handleSubmit} disabled={!isDirty} variant="contained" sx={{ backgroundColor: 'var(--color-secondary-main)', '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } }}>{editingId ? 'Save' : 'Add Staff'}</Button>
    </>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField inputRef={refs.name} label="Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.name)} helperText={errors.name} />
        <TextField inputRef={refs.phone} label="Phone Number" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.phone)} helperText={errors.phone} />
        <TextField inputRef={refs.email} label="Email ID" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.email)} helperText={errors.email} />
        {!editingId && (
          <TextField 
            inputRef={refs.password} 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            value={formData.password} 
            onChange={(e) => handleChange('password', e.target.value)} 
            fullWidth 
            sx={inputSx} 
            error={Boolean(errors.password)} 
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'var(--color-grey-600)' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
        <FormControlLabel sx={{ alignItems: 'center' }} control={<Switch checked={formData.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} sx={{ transform: 'translateY(4px)', '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-switchTrack': { backgroundColor: 'var(--color-secondary-main)' } }} />} label="Is Active" />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Permission catalog</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={selectAllModules}>Select all</Button>
              <Button size="small" onClick={deselectAllModules}>Deselect all</Button>
            </Box>
          </Box>
          <FormGroup>
            {modules.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
                No assignable modules returned from the server catalog.
              </Typography>
            ) : (
              modules.map((mod) => (
                <MuiFormControlLabel
                  key={mod.id}
                  control={
                    <Checkbox
                      checked={formData.allowedModules.includes(mod.id)}
                      onChange={() => toggleModule(mod.id)}
                      sx={{ color: 'var(--color-secondary-main)', '&.Mui-checked': { color: 'var(--color-secondary-main)' } }}
                    />
                  }
                  label={mod.label}
                />
              ))
            )}
          </FormGroup>
        </Box>
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

StaffForm.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default StaffForm;
