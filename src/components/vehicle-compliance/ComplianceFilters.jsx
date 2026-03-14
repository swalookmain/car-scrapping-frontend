import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { invoicesApi } from '../../services/api';

const BOOL_FILTER = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const RTO_FILTER = [
  { value: '', label: 'All' },
  { value: 'NOT_APPLIED', label: 'Not Applied' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: 'var(--color-grey-200)' },
    '&:hover fieldset': { borderColor: 'var(--color-grey-400)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--color-secondary-main)' },
  },
};

const ComplianceFilters = ({
  filterCod,
  onCodChange,
  filterCvs,
  onCvsChange,
  filterRto,
  onRtoChange,
  invoices,
  invoiceLoading,
  selectedInvoiceId,
  setSelectedInvoiceId,
  selectedVehicleLabel,
  setSelectedVehicleLabel,
  filterVehicleId,
  setFilterVehicleId,
  filterInvoiceId,
  setFilterInvoiceId,
  vehicleFetching,
  setVehicleFetching,
  onClearFilters,
}) => {
  const handleInvoiceChange = async (_, newVal) => {
    const invId = newVal ? (newVal._id || newVal.id) : '';
    setSelectedInvoiceId(invId);
    setFilterInvoiceId(invId);
    if (!invId) {
      setSelectedVehicleLabel('');
      setFilterVehicleId('');
      return;
    }
    setVehicleFetching(true);
    setSelectedVehicleLabel('');
    setFilterVehicleId('');
    try {
      const vehRes = await invoicesApi.getVehicleById(invId);
      const vehicles = Array.isArray(vehRes?.data)
        ? vehRes.data
        : vehRes?.data
        ? [vehRes.data]
        : [];
      if (vehicles.length > 0) {
        const v = vehicles[0];
        const vid = v._id || v.id || '';
        const label =
          [v.make, v.model_name || v.model, v.registration_number].filter(Boolean).join(' • ') || vid;
        setSelectedVehicleLabel(label);
        setFilterVehicleId(vid);
      } else {
        setSelectedVehicleLabel('No vehicle found');
        setFilterVehicleId('');
      }
    } catch {
      setSelectedVehicleLabel('No vehicle found');
      setFilterVehicleId('');
    } finally {
      setVehicleFetching(false);
    }
  };

  return (
    <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* COD Generated */}
      <TextField
        select
        label="COD Generated"
        value={filterCod}
        onChange={(e) => onCodChange(e.target.value)}
        size="small"
        sx={{ minWidth: 150, ...fieldSx }}
      >
        {BOOL_FILTER.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      {/* CVS Generated */}
      <TextField
        select
        label="CVS Generated"
        value={filterCvs}
        onChange={(e) => onCvsChange(e.target.value)}
        size="small"
        sx={{ minWidth: 150, ...fieldSx }}
      >
        {BOOL_FILTER.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      {/* RTO Status */}
      <TextField
        select
        label="RTO Status"
        value={filterRto}
        onChange={(e) => onRtoChange(e.target.value)}
        size="small"
        sx={{ minWidth: 180, ...fieldSx }}
      >
        {RTO_FILTER.map((o) => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </TextField>

      {/* Invoice autocomplete */}
      <Autocomplete
        sx={{ width: { xs: '100%', sm: 300, md: 320 } }}
        options={invoices}
        getOptionLabel={(inv) =>
          `${inv.invoiceNumber || ''}${inv.sellerName ? ` — ${inv.sellerName}` : ''}`
        }
        value={invoices.find((i) => (i._id || i.id) === selectedInvoiceId) || null}
        onChange={handleInvoiceChange}
        disabled={invoiceLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Invoice"
            size="small"
            placeholder="Search invoice"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {invoiceLoading ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Vehicle (read-only) */}
      <TextField
        label="Vehicle"
        value={vehicleFetching ? 'Loading...' : selectedVehicleLabel || filterVehicleId}
        size="small"
        sx={{ width: { xs: '100%', sm: 220, md: 240 } }}
        disabled
      />

      <Button
        size="small"
        onClick={onClearFilters}
        sx={{ textTransform: 'none', color: 'var(--color-grey-600)' }}
      >
        Clear
      </Button>
    </Box>
  );
};

ComplianceFilters.propTypes = {
  filterCod: PropTypes.string.isRequired,
  onCodChange: PropTypes.func.isRequired,
  filterCvs: PropTypes.string.isRequired,
  onCvsChange: PropTypes.func.isRequired,
  filterRto: PropTypes.string.isRequired,
  onRtoChange: PropTypes.func.isRequired,
  invoices: PropTypes.array.isRequired,
  invoiceLoading: PropTypes.bool.isRequired,
  selectedInvoiceId: PropTypes.string.isRequired,
  setSelectedInvoiceId: PropTypes.func.isRequired,
  selectedVehicleLabel: PropTypes.string.isRequired,
  setSelectedVehicleLabel: PropTypes.func.isRequired,
  filterVehicleId: PropTypes.string.isRequired,
  setFilterVehicleId: PropTypes.func.isRequired,
  filterInvoiceId: PropTypes.string.isRequired,
  setFilterInvoiceId: PropTypes.func.isRequired,
  vehicleFetching: PropTypes.bool.isRequired,
  setVehicleFetching: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default ComplianceFilters;
