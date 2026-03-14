import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress,
  MenuItem,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taxComplianceApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import { INDIAN_STATE_CODES } from '../../services/taxEngine';

// ==============================|| TAX CONFIGURATION FORM ||============================== //

const TaxConfigForm = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    defaultGstRate: '',
    stateCode: '',
    gstEnabled: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Fetch existing config ────────────────────────────────────
  const { data: configData, isLoading } = useQuery({
    queryKey: ['tax-config'],
    queryFn: () => taxComplianceApi.getConfig({ useCache: false }),
  });

  useEffect(() => {
    const cfg = configData?.data || configData;
    if (cfg) {
      setForm({
        defaultGstRate: cfg.defaultGstRate ?? cfg.default_gst_rate ?? '',
        stateCode: cfg.stateCode ?? cfg.state_code ?? '',
        gstEnabled: cfg.gstEnabled ?? cfg.gst_enabled ?? true,
      });
    }
  }, [configData]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const err = {};
    if (form.gstEnabled) {
      if (!form.defaultGstRate && form.defaultGstRate !== 0) err.defaultGstRate = 'Default GST rate is required';
      if (form.defaultGstRate && (Number(form.defaultGstRate) < 0 || Number(form.defaultGstRate) > 100)) {
        err.defaultGstRate = 'Rate must be between 0 and 100';
      }
      if (!form.stateCode) err.stateCode = 'Organization state is required for intra/inter state detection';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        defaultGstRate: Number(form.defaultGstRate) || 0,
        stateCode: form.stateCode,
        gstEnabled: form.gstEnabled,
      };
      await taxComplianceApi.upsertConfig(payload);
      toast.success('Tax configuration saved successfully');
      queryClient.invalidateQueries({ queryKey: ['tax-config'] });
    } catch (err) {
      console.error('Tax config save error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save tax configuration');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress color="secondary" size={36} />
      </Box>
    );
  }

  const selectedState = INDIAN_STATE_CODES.find((s) => s.code === form.stateCode);

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid var(--color-grey-100)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid var(--color-grey-100)',
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        <SettingsIcon sx={{ color: 'var(--color-secondary-main)', fontSize: 22 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-grey-800)', fontSize: '1rem' }}>
          Tax Configuration
        </Typography>
        <Chip
          label={form.gstEnabled ? 'GST Enabled' : 'GST Disabled'}
          size="small"
          sx={{
            ml: 'auto',
            fontWeight: 600,
            fontSize: '0.75rem',
            backgroundColor: form.gstEnabled ? '#e8f5e9' : '#ffebee',
            color: form.gstEnabled ? '#2e7d32' : '#c62828',
          }}
        />
      </Box>

      {/* ── Form Body ───────────────────────────────────────── */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
          Configure your organization&apos;s GST settings. These settings are used for automatic tax calculations on purchase and sales invoices.
        </Typography>

        <Grid container spacing={3} alignItems="center">
          {/* GST Enable Toggle */}
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.gstEnabled}
                  onChange={(e) => handleChange('gstEnabled', e.target.checked)}
                  color="secondary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Enable GST
                </Typography>
              }
            />
          </Grid>

          {/* Default GST Rate */}
          <Grid item xs={12} sm={4}>
            <TextField
              label="Default GST Rate (%)"
              type="number"
              value={form.defaultGstRate}
              onChange={(e) => handleChange('defaultGstRate', e.target.value)}
              fullWidth
              disabled={!form.gstEnabled}
              sx={inputSx}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              error={Boolean(errors.defaultGstRate)}
              helperText={errors.defaultGstRate || 'Standard rate for tax calculations'}
            />
          </Grid>

          {/* Organization State */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Organization State *"
              value={form.stateCode}
              onChange={(e) => handleChange('stateCode', e.target.value)}
              fullWidth
              disabled={!form.gstEnabled}
              sx={inputSx}
              error={Boolean(errors.stateCode)}
              helperText={errors.stateCode || 'Used for intra/inter state GST detection'}
            >
              <MenuItem value="">Select State</MenuItem>
              {INDIAN_STATE_CODES.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider />

        {/* ── Info Card ─────────────────────────────────────── */}
        {form.gstEnabled && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: '#f3e5f5',
              border: '1px solid #ce93d8',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6a1b9a', mb: 1 }}>
              How GST is calculated
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, color: '#4a148c', fontSize: '0.8rem', lineHeight: 1.8 }}>
              <li>
                <strong>Intra-State (same state):</strong> CGST = rate/2, SGST = rate/2, IGST = 0
              </li>
              <li>
                <strong>Inter-State (different state):</strong> CGST = 0, SGST = 0, IGST = full rate
              </li>
              <li>
                <strong>RCM (Reverse Charge):</strong> Tax computed but NOT added to payable amount
              </li>
            </Box>
            {selectedState && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#7b1fa2' }}>
                Current org state: <strong>{selectedState.name} ({selectedState.code})</strong>
              </Typography>
            )}
          </Box>
        )}

        {/* ── Save Button ───────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <SaveIcon />}
            sx={{
              backgroundColor: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
              textTransform: 'none',
              px: 4,
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TaxConfigForm;
