import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Visibility';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import {
  facilitySettingsApi,
  inventoryAuditApi,
} from '../../services/api';
import inputSx from '../../services/inputStyles';

const PERIODS = [
  { id: 'fy', label: 'Yearly (FY)' },
  { id: 'month', label: 'Monthly' },
  { id: 'week', label: 'Weekly' },
  { id: 'custom', label: 'Custom' },
];

export default function InventoryAuditPage() {
  const [period, setPeriod] = useState('fy');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [facilityForm, setFacilityForm] = useState(null);

  const { data: facility, refetch: refetchFacility } = useQuery({
    queryKey: ['facility-settings'],
    queryFn: () => facilitySettingsApi.get(),
  });

  const queryParams = useMemo(() => {
    if (period === 'custom') {
      return { period: 'custom', from, to };
    }
    return { period };
  }, [period, from, to]);

  const handlePreview = async () => {
    if (period === 'custom' && (!from || !to)) {
      toast.error('Select custom from/to dates');
      return;
    }
    setLoadingPreview(true);
    try {
      const data = await inventoryAuditApi.preview(queryParams);
      setPreview(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Preview failed');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    if (period === 'custom' && (!from || !to)) {
      toast.error('Select custom from/to dates');
      return;
    }
    setLoadingPdf(true);
    try {
      const blob = await inventoryAuditApi.downloadPdf(queryParams);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'FORM-3-inventory-audit.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          'PDF download failed — map materials / vehicle weights first',
      );
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleSaveFacility = async () => {
    const payload = facilityForm || facility;
    if (!payload) return;
    try {
      await facilitySettingsApi.update({
        name: payload.name,
        registrationNumber: payload.registrationNumber,
        validity: payload.validity,
        authorisedCapacity: payload.authorisedCapacity,
      });
      toast.success('Facility settings saved');
      refetchFacility();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  const f = facilityForm || facility || {
    name: '',
    registrationNumber: '',
    validity: '',
    authorisedCapacity: { L: 0, M: 0, N: 0, OTHER: 0 },
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Year / month / week / custom report. Page 1 filled from inventory; page 2 blank for customer fill.
      </Typography>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Facility header &amp; authorised capacity
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="NAME"
              value={f.name || ''}
              onChange={(e) => setFacilityForm({ ...f, name: e.target.value })}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Registration number"
              value={f.registrationNumber || ''}
              onChange={(e) =>
                setFacilityForm({ ...f, registrationNumber: e.target.value })
              }
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Validity"
              value={f.validity || ''}
              onChange={(e) =>
                setFacilityForm({ ...f, validity: e.target.value })
              }
              sx={inputSx}
            />
          </Grid>
          {['L', 'M', 'N', 'OTHER'].map((k) => (
            <Grid item xs={6} md={3} key={k}>
              <TextField
                fullWidth
                type="number"
                label={`Authorised ${k}`}
                value={f.authorisedCapacity?.[k] ?? 0}
                onChange={(e) =>
                  setFacilityForm({
                    ...f,
                    authorisedCapacity: {
                      ...(f.authorisedCapacity || {}),
                      [k]: Number(e.target.value) || 0,
                    },
                  })
                }
                sx={inputSx}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleSaveFacility}>
              Save facility settings
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {PERIODS.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              color={period === p.id ? 'primary' : 'default'}
              onClick={() => setPeriod(p.id)}
              clickable
            />
          ))}
        </Box>
        {period === 'custom' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                sx={inputSx}
              />
            </Grid>
          </Grid>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={
              loadingPreview ? <CircularProgress size={16} /> : <PreviewIcon />
            }
            onClick={handlePreview}
            disabled={loadingPreview}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={
              loadingPdf ? <CircularProgress size={16} /> : <DownloadIcon />
            }
            onClick={handleDownload}
            disabled={loadingPdf}
          >
            Download PDF
          </Button>
        </Box>
      </Paper>

      {preview && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            {preview.header?.name || 'Facility'} · FY{' '}
            {preview.header?.financialYear} · {preview.header?.periodLabel}
          </Typography>
          {preview.guards?.unmappedPartCount > 0 && (
            <Typography color="error" variant="body2" sx={{ mb: 1 }}>
              Unmapped parts: {preview.guards.unmappedPartCount} (map materials
              before PDF)
            </Typography>
          )}
          {preview.guards?.missingGrossWeightCount > 0 && (
            <Typography color="warning.main" variant="body2" sx={{ mb: 1 }}>
              Vehicles missing inbound weight:{' '}
              {preview.guards.missingGrossWeightCount}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Inwards (A): {preview.massFlow?.inwardsGrandTotal} KG
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Outwards subtotal (i): {preview.massFlow?.outwardsSubTotal} KG
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Haz reprocess (ii): {preview.massFlow?.hazReprocessSubTotal} KG
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Haz landfill (iii): {preview.massFlow?.hazLandfillSubTotal} KG
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Mass balance (A−B): {preview.massFlow?.massBalance} KG
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
