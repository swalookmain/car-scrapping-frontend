import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  CircularProgress,
  Typography,
  Autocomplete,
} from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { useQuery } from '@tanstack/react-query';
import { salesInvoicesApi } from '../../services/api';
import { TRANSPORT_MODES } from '../../services/taxEngine';
import DocUploadField from '../vehicle-compliance/DocUploadField';

// ── Initial State ──────────────────────────────────────────────
const INITIAL_EWAY = {
  salesInvoiceId: '',
  ewayBillNumber: '',
  ewayGeneratedDate: '',
  transportMode: 'ROAD',
  vehicleNumber: '',
  documentUrl: '',
};

// ── Component ──────────────────────────────────────────────────
const EwayBillForm = forwardRef(({ onSubmit }, ref) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_EWAY });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Document state: null | string (existing URL) | { name, type, dataUrl }
  const [docFile, setDocFile] = useState(null);

  // ── Fetch confirmed sales invoices for dropdown ──────────────
  const { data: invoicesData = [] } = useQuery({
    queryKey: ['sales-invoices-confirmed-for-eway'],
    queryFn: async () => {
      let allInvoices = [];
      let pg = 1;
      const limit = 100;
      const res = await salesInvoicesApi.getAll(pg, limit, { status: 'CONFIRMED' }, { useCache: false });
      const list = Array.isArray(res?.data) ? res.data : [];
      allInvoices = list;
      const totalPages = res?.meta?.totalPages || 1;
      while (pg < totalPages) {
        pg++;
        const nextRes = await salesInvoicesApi.getAll(pg, limit, { status: 'CONFIRMED' }, { useCache: false });
        const nextList = Array.isArray(nextRes?.data) ? nextRes.data : [];
        allInvoices = [...allInvoices, ...nextList];
      }
      return allInvoices;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const confirmedInvoices = useMemo(() => invoicesData, [invoicesData]);

  useImperativeHandle(ref, () => ({
    open: () => {
      setForm({ ...INITIAL_EWAY });
      setDocFile(null);
      setErrors({});
      setOpen(true);
    },
    close: () => setOpen(false),
  }));

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.salesInvoiceId) err.salesInvoiceId = 'Sales invoice is required';
    if (!form.ewayBillNumber.trim()) err.ewayBillNumber = 'E-Way bill number is required';
    if (!form.ewayGeneratedDate) err.ewayGeneratedDate = 'Generated date is required';
    if (!form.transportMode) err.transportMode = 'Transport mode is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Resolve document state to URL string (base64 dataUrl or existing URL)
  const resolveDoc = (doc) => {
    if (!doc) return undefined;
    if (typeof doc === 'string') return doc;
    return doc.dataUrl || undefined;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        salesInvoiceId: form.salesInvoiceId,
        ewayBillNumber: form.ewayBillNumber.trim(),
        ewayGeneratedDate: form.ewayGeneratedDate,
        transportMode: form.transportMode,
        vehicleNumber: form.vehicleNumber.trim() || undefined,
        documentUrl: resolveDoc(docFile),
      };
      await onSubmit(payload);
      setOpen(false);
      setForm({ ...INITIAL_EWAY });
      setDocFile(null);
      setErrors({});
    } catch {
      // handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ ...INITIAL_EWAY });
    setDocFile(null);
    setErrors({});
  };

  const getInvoiceLabel = (inv) => {
    if (!inv) return '';
    const num = inv.invoiceNumber || '';
    const buyer = inv.buyer?.buyerName || inv.buyerName || '';
    return `${num}${buyer ? ` — ${buyer}` : ''}`;
  };

  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title="Add E-Way Bill Record"
      maxWidth="sm"
      actions={
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
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Save E-Way Bill'}
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
          E-Way Bill Details
        </Typography>

        <Grid container spacing={2}>
          {/* Sales Invoice Selection */}
          <Grid item xs={12}>
            <Autocomplete
              options={confirmedInvoices}
              getOptionLabel={getInvoiceLabel}
              value={confirmedInvoices.find((i) => (i._id || i.id) === form.salesInvoiceId) || null}
              onChange={(_, newVal) => handleChange('salesInvoiceId', newVal ? (newVal._id || newVal.id) : '')}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sales Invoice (Confirmed) *"
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.salesInvoiceId)}
                  helperText={errors.salesInvoiceId || 'Only confirmed invoices can have E-Way bills'}
                />
              )}
            />
          </Grid>

          {/* E-Way Bill Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="E-Way Bill Number *"
              value={form.ewayBillNumber}
              onChange={(e) => handleChange('ewayBillNumber', e.target.value)}
              fullWidth
              sx={inputSx}
              error={Boolean(errors.ewayBillNumber)}
              helperText={errors.ewayBillNumber}
            />
          </Grid>

          {/* Generated Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Generated Date *"
              type="date"
              value={form.ewayGeneratedDate}
              onChange={(e) => handleChange('ewayGeneratedDate', e.target.value)}
              fullWidth
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.ewayGeneratedDate)}
              helperText={errors.ewayGeneratedDate}
            />
          </Grid>

          {/* Transport Mode */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Transport Mode *"
              value={form.transportMode}
              onChange={(e) => handleChange('transportMode', e.target.value)}
              fullWidth
              sx={inputSx}
              error={Boolean(errors.transportMode)}
              helperText={errors.transportMode}
            >
              {TRANSPORT_MODES.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Vehicle Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vehicle Number"
              value={form.vehicleNumber}
              onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())}
              fullWidth
              sx={inputSx}
              placeholder="e.g. MH01AB1234"
            />
          </Grid>

          {/* Document Upload */}
          <Grid item xs={12}>
            <DocUploadField
              label="Signed E-Way Bill Document"
              docState={docFile}
              onChange={setDocFile}
              readOnly={false}
            />
          </Grid>
        </Grid>
      </Box>
    </NormalModal>
  );
});

EwayBillForm.displayName = 'EwayBillForm';

EwayBillForm.propTypes = {
  onSubmit: PropTypes.func,
};

export default EwayBillForm;
