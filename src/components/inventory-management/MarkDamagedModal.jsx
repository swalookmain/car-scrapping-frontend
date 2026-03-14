import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { calcAvailable } from './inventoryColumns';

const MarkDamagedModal = ({ open, onClose, item, onSubmit, loading = false }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const availableQty = item ? calcAvailable(item) : 0;

  useEffect(() => {
    if (open) {
      setQuantity('');
      setReason('');
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const errs = {};
    const qty = Number(quantity);
    if (!quantity || qty <= 0) {
      errs.quantity = 'Quantity must be greater than 0';
    } else if (qty > availableQty) {
      errs.quantity = `Cannot exceed available quantity (${availableQty})`;
    } else if (!Number.isInteger(qty)) {
      errs.quantity = 'Quantity must be a whole number';
    }
    if (!reason.trim()) {
      errs.reason = 'Reason is required';
    } else if (reason.trim().length < 5) {
      errs.reason = 'Reason must be at least 5 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      partId: item._id || item.id,
      newCondition: 'DAMAGED',
      quantityAffected: Number(quantity),
      reason: reason.trim(),
    });
  };

  if (!item) return null;

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title="Mark Part as Damaged"
      maxWidth="sm"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ borderRadius: '10px', color: 'var(--color-grey-600)' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              borderRadius: '10px',
              backgroundColor: '#e65100',
              boxShadow: '0 4px 14px rgba(230,81,0,0.25)',
              '&:hover': { backgroundColor: '#bf360c', boxShadow: '0 6px 20px rgba(230,81,0,0.35)' },
            }}
          >
            {loading ? 'Processing...' : 'Mark as Damaged'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Part Info Summary */}
        <Box
          sx={{
            p: 2,
            backgroundColor: '#fff3e0',
            borderRadius: '12px',
            border: '1px solid #ffe0b2',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
            Part Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Part Name
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
                {item.partName || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Item Code
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-700)' }}>
                {(item._id || item.id || '—')?.toString()?.slice(-8)?.toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Current Condition
              </Typography>
              <Box sx={{ mt: 0.3 }}>
                <Chip
                  label={item.condition || 'GOOD'}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    backgroundColor: item.condition === 'DAMAGED' ? '#ffebee' : '#e8f5e9',
                    color: item.condition === 'DAMAGED' ? '#c62828' : '#2e7d32',
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Available Quantity
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: availableQty > 0 ? '#2e7d32' : '#c62828' }}>
                {availableQty}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Quantity */}
        <TextField
          label="Quantity to Mark as Damaged"
          type="number"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
          }}
          error={Boolean(errors.quantity)}
          helperText={errors.quantity || `Max: ${availableQty}`}
          fullWidth
          size="small"
          inputProps={{ min: 1, max: availableQty, step: 1 }}
          sx={inputSx}
        />

        {/* Reason */}
        <TextField
          label="Reason for Damage"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
          }}
          error={Boolean(errors.reason)}
          helperText={errors.reason || 'e.g. Broken during removal, Inspection found crack'}
          fullWidth
          multiline
          rows={3}
          size="small"
          sx={inputSx}
        />

        {/* Warning */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: '#fce4ec',
            borderRadius: '8px',
            border: '1px solid #f8bbd0',
          }}
        >
          <Typography variant="caption" sx={{ color: '#ad1457', fontWeight: 500, lineHeight: 1.5 }}>
            ⚠️ Marking parts as damaged will reduce available good stock. Damaged parts cannot be added to sales invoices.
            This action will be recorded in the damage adjustment log.
          </Typography>
        </Box>
      </Box>
    </NormalModal>
  );
};

MarkDamagedModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default MarkDamagedModal;
