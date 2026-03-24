import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import inputSx from '../../services/inputStyles';

const VEHICLE_TYPES = ['CAR', 'BIKE', 'COMMERCIAL'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'];

/**
 * Renders all vehicle detail fields for step 2 of InvoiceForm.
 * Extracted from InvoiceForm to reduce component size.
 */
export default function InvoiceVehicleStep({ vehicle, errors, onChange, readOnly }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
        Vehicle Identity
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Owner Name"
            value={vehicle.ownerName}
            onChange={(e) => onChange('ownerName', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.ownerName)}
            helperText={errors.ownerName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Vehicle Type"
            value={vehicle.vehicle_type}
            onChange={(e) => onChange('vehicle_type', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
          >
            {VEHICLE_TYPES.map((vt) => (
              <MenuItem key={vt} value={vt}>{vt}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Make"
            value={vehicle.make}
            onChange={(e) => onChange('make', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.make)}
            helperText={errors.make}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Model"
            value={vehicle.model_name}
            onChange={(e) => onChange('model_name', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.model_name)}
            helperText={errors.model_name}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Variant"
            value={vehicle.variant}
            onChange={(e) => onChange('variant', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Fuel Type"
            value={vehicle.fuel_type}
            onChange={(e) => onChange('fuel_type', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
          >
            {FUEL_TYPES.map((ft) => (
              <MenuItem key={ft} value={ft}>{ft}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Color"
            value={vehicle.color}
            onChange={(e) => onChange('color', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="RTO District / Branch"
            value={vehicle.rto_district_branch || ''}
            onChange={(e) => onChange('rto_district_branch', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.rto_district_branch)}
            helperText={errors.rto_district_branch}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
        Registration &amp; Identification
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Registration Number"
            value={vehicle.registration_number}
            onChange={(e) => onChange('registration_number', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.registration_number)}
            helperText={errors.registration_number}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Chassis Number"
            value={vehicle.chassis_number}
            onChange={(e) => onChange('chassis_number', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.chassis_number)}
            helperText={errors.chassis_number}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Engine Number"
            value={vehicle.engine_number}
            onChange={(e) => onChange('engine_number', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.engine_number)}
            helperText={errors.engine_number}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
        Manufacturing &amp; History
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Year of Manufacture"
            type="number"
            value={vehicle.year_of_manufacture}
            onChange={(e) => onChange('year_of_manufacture', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.year_of_manufacture)}
            helperText={errors.year_of_manufacture}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Vehicle Purchase Date"
            type="date"
            value={vehicle.vehicle_purchase_date}
            onChange={(e) => onChange('vehicle_purchase_date', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.vehicle_purchase_date)}
            helperText={errors.vehicle_purchase_date}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

InvoiceVehicleStep.propTypes = {
  vehicle: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};
