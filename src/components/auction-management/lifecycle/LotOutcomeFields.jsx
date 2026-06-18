import React, { useMemo } from 'react';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';
import inputSx from '../../../services/inputStyles';
import { LOT_OUTCOME_OPTIONS, defaultPaymentDueDate } from './lotLifecycleConstants';
import { formatINR } from '../../../services/taxEngine';

const LotOutcomeFields = ({ lot, value, onChange, disabled = false }) => {
  const form = value || {};
  const isDealDone = form.outcomeStatus === 'DEAL_DONE';

  const balance = useMemo(() => {
    const total = Number(form.totalAmount) || 0;
    const preEmd = Number(form.preEmdAmount) || 0;
    return Math.max(0, total - preEmd);
  }, [form.totalAmount, form.preEmdAmount]);

  const handleChange = (field, val) => {
    onChange({ ...form, [field]: val });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Outcome status"
          value={form.outcomeStatus || lot.outcomeStatus || 'PENDING'}
          onChange={(e) => handleChange('outcomeStatus', e.target.value)}
          disabled={disabled}
          sx={inputSx}
        >
          {LOT_OUTCOME_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {isDealDone && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Total amount"
              value={form.totalAmount ?? ''}
              onChange={(e) => handleChange('totalAmount', e.target.value)}
              disabled={disabled}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Pre-EMD amount"
              value={form.preEmdAmount ?? lot.preEmdAmount ?? ''}
              onChange={(e) => handleChange('preEmdAmount', e.target.value)}
              disabled={disabled || !!lot.preEmdAmount}
              helperText={!lot.preEmdAmount && !form.preEmdAmount ? 'Not set at create — enter manually' : ''}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Balance (amount to pay)"
              value={formatINR(balance)}
              InputProps={{ readOnly: true }}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Closing date & time"
              InputLabelProps={{ shrink: true }}
              value={form.dealClosedAt ?? ''}
              onChange={(e) => handleChange('dealClosedAt', e.target.value)}
              disabled={disabled}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Payment due date"
              InputLabelProps={{ shrink: true }}
              value={form.paymentDueDate ?? defaultPaymentDueDate()}
              onChange={(e) => handleChange('paymentDueDate', e.target.value)}
              disabled={disabled}
              sx={inputSx}
            />
          </Grid>
          {!disabled && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Daily SMS reminders will be sent until the payment due date with the balance amount.
              </Typography>
            </Grid>
          )}
        </>
      )}

      {disabled && lot.deal && (
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Total: {formatINR(lot.deal.totalAmount)} · Pre-EMD: {formatINR(lot.deal.preEmdAmount)} ·
            Balance: {formatINR(lot.deal.balanceAmount)}
            {lot.deal.dealClosedAt && ` · Closed: ${new Date(lot.deal.dealClosedAt).toLocaleString()}`}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default LotOutcomeFields;
