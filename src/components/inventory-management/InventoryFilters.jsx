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

const FILTER_CONDITIONS = ['GOOD', 'DAMAGED'];
const FILTER_STATUSES = ['AVAILABLE', 'PARTIAL_SOLD', 'SOLD_OUT', 'DAMAGE_ONLY'];

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': { borderColor: 'var(--color-grey-200)' },
    '&:hover fieldset': { borderColor: 'var(--color-grey-400)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--color-secondary-main)' },
  },
};

const InventoryFilters = ({
  filterCondition,
  onConditionChange,
  filterStatus,
  onStatusChange,
  invoices,
  invoiceLoading,
  selectedInvoiceId,
  setSelectedInvoiceId,
  selectedVehicleLabel,
  setSelectedVehicleLabel,
  filterVechileId,
  setFilterVechileId,
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
      setFilterVechileId('');
      return;
    }
    setVehicleFetching(true);
    setSelectedVehicleLabel('');
    setFilterVechileId('');
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
          [v.make, v.model_name || v.model, v.registration_number]
            .filter(Boolean)
            .join(' • ') || vid;
        setSelectedVehicleLabel(label);
        setFilterVechileId(vid);
      } else {
        setSelectedVehicleLabel('No vehicle found');
        setFilterVechileId('');
      }
    } catch {
      setSelectedVehicleLabel('No vehicle found');
      setFilterVechileId('');
    } finally {
      setVehicleFetching(false);
    }
  };

  return (
    <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Condition */}
      <TextField
        select
        label="Condition"
        value={filterCondition}
        onChange={(e) => onConditionChange(e.target.value)}
        size="small"
        sx={{ width: 160, ...fieldSx }}
      >
        <MenuItem value="">All</MenuItem>
        {FILTER_CONDITIONS.map((c) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </TextField>

      {/* Status */}
      <TextField
        select
        label="Status"
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        size="small"
        sx={{ width: 180, ...fieldSx }}
      >
        <MenuItem value="">All</MenuItem>
        {FILTER_STATUSES.map((s) => (
          <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
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

      {/* Vehicle (read-only, populated from selected invoice) */}
      <TextField
        label="Vehicle"
        value={vehicleFetching ? 'Loading...' : selectedVehicleLabel || filterVechileId}
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

InventoryFilters.propTypes = {
  filterCondition: PropTypes.string.isRequired,
  onConditionChange: PropTypes.func.isRequired,
  filterStatus: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  invoices: PropTypes.array.isRequired,
  invoiceLoading: PropTypes.bool.isRequired,
  selectedInvoiceId: PropTypes.string.isRequired,
  setSelectedInvoiceId: PropTypes.func.isRequired,
  selectedVehicleLabel: PropTypes.string.isRequired,
  setSelectedVehicleLabel: PropTypes.func.isRequired,
  filterVechileId: PropTypes.string.isRequired,
  setFilterVechileId: PropTypes.func.isRequired,
  filterInvoiceId: PropTypes.string.isRequired,
  setFilterInvoiceId: PropTypes.func.isRequired,
  vehicleFetching: PropTypes.bool.isRequired,
  setVehicleFetching: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default InventoryFilters;
