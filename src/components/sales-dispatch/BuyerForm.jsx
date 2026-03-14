import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  CircularProgress,
} from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';

// ── Constants ──────────────────────────────────────────────────
const BUYER_TYPES = ['COMPANY', 'INDIVIDUAL'];

const INITIAL_BUYER = {
  buyerName: '',
  buyerType: 'COMPANY',
  gstin: '',
  mobile: '',
  email: '',
  address: '',
};

// GSTIN format: 2-digit state code + 10-char PAN + 1 digit + Z + 1 alphanumeric
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// ── Component ──────────────────────────────────────────────────
const BuyerForm = forwardRef(({ onSubmit, readOnly = false }, ref) => {
  const [open, setOpen] = useState(false);
  const [buyer, setBuyer] = useState({ ...INITIAL_BUYER });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const editMode = Boolean(editingId);

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        setBuyer({
          buyerName: item.buyerName || '',
          buyerType: item.buyerType || 'COMPANY',
          gstin: item.gstin || '',
          mobile: item.mobile || '',
          email: item.email || '',
          address: item.address || '',
        });
        setEditingId(item._id || item.id || null);
      } else {
        setBuyer({ ...INITIAL_BUYER });
        setEditingId(null);
      }
      setErrors({});
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingId(null);
    },
  }));

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (field, value) => {
    if (readOnly) return;
    setBuyer((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!buyer.buyerName.trim()) err.buyerName = 'Buyer name is required';
    if (!buyer.buyerType) err.buyerType = 'Buyer type is required';
    if (!buyer.mobile.trim()) err.mobile = 'Mobile number is required';
    if (buyer.mobile && !/^[6-9]\d{9}$/.test(buyer.mobile.trim())) {
      err.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (buyer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim())) {
      err.email = 'Enter a valid email address';
    }
    if (buyer.gstin && !GSTIN_REGEX.test(buyer.gstin.trim().toUpperCase())) {
      err.gstin = 'Enter a valid GSTIN (e.g., 22AAAAA0000A1Z5)';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        buyerName: buyer.buyerName.trim(),
        buyerType: buyer.buyerType,
        gstin: buyer.gstin.trim().toUpperCase() || undefined,
        mobile: buyer.mobile.trim(),
        email: buyer.email.trim() || undefined,
        address: buyer.address.trim() || undefined,
      };
      await onSubmit({
        type: editingId ? 'update' : 'create',
        id: editingId,
        payload,
      });
      setOpen(false);
      setBuyer({ ...INITIAL_BUYER });
      setEditingId(null);
      setErrors({});
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setBuyer({ ...INITIAL_BUYER });
    setEditingId(null);
    setErrors({});
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title={readOnly ? 'View Buyer' : editMode ? 'Edit Buyer' : 'Add Buyer'}
      maxWidth="sm"
      actions={
        !readOnly && (
          <>
            <Button onClick={handleClose} sx={{ color: 'var(--color-grey-600)' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                backgroundColor: 'var(--color-secondary-main)',
                '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editMode ? 'Update' : 'Create'}
            </Button>
          </>
        )
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Buyer Name *"
              value={buyer.buyerName}
              onChange={(e) => handleChange('buyerName', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.buyerName)}
              helperText={errors.buyerName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Buyer Type *"
              value={buyer.buyerType}
              onChange={(e) => handleChange('buyerType', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.buyerType)}
              helperText={errors.buyerType}
            >
              {BUYER_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="GSTIN"
              value={buyer.gstin}
              onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.gstin)}
              helperText={errors.gstin}
              inputProps={{ maxLength: 15 }}
              placeholder="22AAAAA0000A1Z5"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mobile *"
              value={buyer.mobile}
              onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.mobile)}
              helperText={errors.mobile}
              inputProps={{ maxLength: 10 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              value={buyer.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.email)}
              helperText={errors.email}
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              value={buyer.address}
              onChange={(e) => handleChange('address', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={{ ...inputSx, minWidth: { xs: '100%', sm: 520 } }}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </Box>
    </NormalModal>
  );
});

BuyerForm.displayName = 'BuyerForm';

BuyerForm.propTypes = {
  onSubmit: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default BuyerForm;
