import React from 'react';
import { Box, Button, Grid, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import inputSx from '../../../services/inputStyles';

const OFFICER_TYPES = ['MSTC', 'GEM', 'OTHERS', 'SELLER'];

const emptyOfficer = () => ({ name: '', email: '', phoneNumber: '', officerType: 'MSTC' });

const OfficerFieldsGroup = ({ officers = [], onChange, disabled = false }) => {
  const list = officers.length ? officers : [emptyOfficer()];

  const updateOfficer = (index, field, value) => {
    const next = list.map((o, i) => (i === index ? { ...o, [field]: value } : o));
    onChange(next);
  };

  const addOfficer = () => onChange([...list, emptyOfficer()]);

  const removeOfficer = (index) => {
    if (list.length <= 1) return;
    onChange(list.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Officer details
      </Typography>
      {list.map((officer, idx) => (
        <Box key={idx} sx={{ mb: 2, p: 1.5, border: '1px solid var(--color-grey-200)', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Name"
                value={officer.name || ''}
                onChange={(e) => updateOfficer(idx, 'name', e.target.value)}
                disabled={disabled}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Email"
                value={officer.email || ''}
                onChange={(e) => updateOfficer(idx, 'email', e.target.value)}
                disabled={disabled}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Phone"
                value={officer.phoneNumber || ''}
                onChange={(e) => updateOfficer(idx, 'phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={disabled}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Type"
                value={officer.officerType || 'MSTC'}
                onChange={(e) => updateOfficer(idx, 'officerType', e.target.value)}
                disabled={disabled}
                sx={inputSx}
              >
                {OFFICER_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
              {!disabled && list.length > 1 && (
                <IconButton size="small" onClick={() => removeOfficer(idx)} color="error">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              )}
            </Grid>
          </Grid>
        </Box>
      ))}
      {!disabled && (
        <Button startIcon={<AddIcon />} onClick={addOfficer} size="small" sx={{ textTransform: 'none' }}>
          Add officer
        </Button>
      )}
    </Box>
  );
};

export default OfficerFieldsGroup;
