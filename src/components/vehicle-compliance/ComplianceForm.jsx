import React, { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Grid,
  Autocomplete,
} from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import DocUploadField from './DocUploadField';
import inputSx from '../../services/inputStyles';
import { useComplianceForm, RTO_STATUS_OPTIONS } from './useComplianceForm';

// ── Component ──────────────────────────────────────────────────
const ComplianceForm = forwardRef(({ onSubmit, readOnly = false, onClose }, ref) => {
  const {
    open, form, errors, isUpdateMode,
    invoices, invoiceLoading,
    selectedInvoiceId, selectedVehicleId, vehicleLabel, vehicleFetching,
    codDoc, setCodDoc, cvsDoc, setCvsDoc,
    handleChange, handleInvoiceSelect, getInvoiceLabel,
    handleSubmit, handleClose,
    openModal, closeModal,
  } = useComplianceForm({ onSubmit, readOnly, onClose });

  useImperativeHandle(ref, () => ({ open: openModal, close: closeModal }));

  // ── Render ───────────────────────────────────────────────────
  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title={
        readOnly
          ? 'View COD Compliance'
          : isUpdateMode
          ? 'Update COD / RTO Tracking'
          : 'Add COD Compliance Record'
      }
      maxWidth="md"
      actions={
        readOnly ? (
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              backgroundColor: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
            }}
          >
            Close
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} sx={{ color: 'var(--color-grey-600)' }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: 'var(--color-secondary-main)',
                '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
              }}
            >
              {isUpdateMode ? 'Update' : 'Create Record'}
            </Button>
          </>
        )
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* ── Invoice & Vehicle Selection (Create Only) ────────── */}
        {!isUpdateMode && (
          <>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}
            >
              Invoice & Vehicle
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  sx={{ width: '100%' }}
                  options={invoices}
                  getOptionLabel={(inv) => getInvoiceLabel(inv)}
                  value={invoices.find((i) => (i._id || i.id) === selectedInvoiceId) || null}
                  onChange={(e, newVal) => handleInvoiceSelect(newVal ? (newVal._id || newVal.id) : '')}
                  disabled={readOnly || invoiceLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Invoice Number"
                      fullWidth
                      sx={inputSx}
                      error={Boolean(errors.invoiceId)}
                      helperText={errors.invoiceId || (invoiceLoading ? 'Loading invoices...' : '')}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Vehicle"
                  value={vehicleFetching ? 'Loading...' : vehicleLabel || selectedVehicleId}
                  fullWidth
                  disabled
                  sx={inputSx}
                  error={Boolean(errors.vehicleId)}
                  helperText={errors.vehicleId}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* ── COD Section ─────────────────────────────────────── */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}
        >
          Certificate of Deposit (COD)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.codGenerated}
                  onChange={(e) => handleChange('codGenerated', e.target.checked)}
                  disabled={readOnly}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'var(--color-secondary-main)',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'var(--color-secondary-main)',
                    },
                  }}
                />
              }
              label="COD Generated"
            />
          </Grid>
          {form.codGenerated && (
            <>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="COD Inward Number"
                  value={form.codInwardNumber}
                  onChange={(e) => handleChange('codInwardNumber', e.target.value)}
                  fullWidth
                  disabled={readOnly}
                  sx={inputSx}
                  error={Boolean(errors.codInwardNumber)}
                  helperText={errors.codInwardNumber}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="COD Issue Date"
                  type="date"
                  value={form.codIssueDate}
                  onChange={(e) => handleChange('codIssueDate', e.target.value)}
                  fullWidth
                  disabled={readOnly}
                  sx={inputSx}
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.codIssueDate)}
                  helperText={errors.codIssueDate}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <DocUploadField
              label="COD Document"
              docState={codDoc}
              onChange={readOnly ? undefined : setCodDoc}
              readOnly={readOnly}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* ── CVS Section ─────────────────────────────────────── */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}
        >
          Certificate of Vehicle Scrapping (CVS)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.cvsGenerated}
                  onChange={(e) => handleChange('cvsGenerated', e.target.checked)}
                  disabled={readOnly}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'var(--color-secondary-main)',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'var(--color-secondary-main)',
                    },
                  }}
                />
              }
              label="CVS Generated"
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <DocUploadField
              label="CVS Document"
              docState={cvsDoc}
              onChange={readOnly ? undefined : setCvsDoc}
              readOnly={readOnly}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* ── RTO Section ─────────────────────────────────────── */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}
        >
          RTO Application
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="RTO Status"
              value={form.rtoStatus}
              onChange={(e) => handleChange('rtoStatus', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
            >
              {RTO_STATUS_OPTIONS.map((st) => (
                <MenuItem key={st} value={st}>
                  {st.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="RTO Office"
              value={form.rtoOffice}
              onChange={(e) => handleChange('rtoOffice', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.rtoOffice)}
              helperText={errors.rtoOffice}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* ── Remarks ─────────────────────────────────────────── */}
        <TextField
          label="Remarks"
          value={form.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          fullWidth
          multiline
          rows={3}
          disabled={readOnly}
          sx={inputSx}
        />
      </Box>
    </NormalModal>
  );
});

ComplianceForm.propTypes = {
  onSubmit: PropTypes.func,
  readOnly: PropTypes.bool,
  onClose: PropTypes.func,
};

ComplianceForm.displayName = 'ComplianceForm';

export default ComplianceForm;
