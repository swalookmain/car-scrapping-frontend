import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Switch, FormControlLabel, Button } from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';

const OrganizationForm = forwardRef(({ onSubmit }, ref) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', isActive: true });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        setForm({ name: item.name || '', isActive: Boolean(item.isActive) });
        setEditingId(item._id || item.id || null);
      } else {
        setForm({ name: '', isActive: true });
        setEditingId(null);
      }
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingId(null);
    }
  }));

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form };
    onSubmit(payload, editingId);
    setForm({ name: '', isActive: true });
    setErrors({});
    setEditingId(null);
    setOpen(false);
  };

  return (
    <NormalModal
      open={open}
      onClose={() => setOpen(false)}
      title="Add Organization"
      actions={<>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: 'var(--color-secondary-main)', '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } }}>Add</Button>
      </>}
        showCloseButton={!editingId}
      >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Organization Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} fullWidth sx={inputSx} error={Boolean(errors.name)} helperText={errors.name} />
        <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' } }} />} label="Is Active" />
      </Box>
    </NormalModal>
  );
});

OrganizationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default OrganizationForm;
