import React from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import inputSx from '../../services/inputStyles';

const LEAD_SOURCES = ['WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'MAIN_SITE', 'OTHER'];

/**
 * Renders seller-type-specific invoice fields.
 * Extracted from InvoiceForm to reduce component size.
 */
export default function InvoiceSellerFields({
  sellerType,
  invoice,
  errors,
  onChange,
  readOnly,
}) {
  if (sellerType === 'DIRECT') {
    return (
      <>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)', mt: 1 }}>
          Seller KYC Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mobile"
              value={invoice.mobile}
              onChange={(e) => onChange('mobile', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.mobile)}
              helperText={errors.mobile}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              value={invoice.email}
              onChange={(e) => onChange('email', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Aadhaar Number"
              value={invoice.aadhaarNumber}
              onChange={(e) => onChange('aadhaarNumber', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.aadhaarNumber)}
              helperText={errors.aadhaarNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="PAN Number"
              value={invoice.panNumber}
              onChange={(e) => onChange('panNumber', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.panNumber)}
              helperText={errors.panNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Lead Source"
              value={invoice.leadSource}
              onChange={(e) => onChange('leadSource', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
            >
              {LEAD_SOURCES.map((ls) => (
                <MenuItem key={ls} value={ls}>{ls.replace('_', ' ')}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              sx={{ alignItems: 'center' }}
              control={
                <Switch
                  checked={invoice.reverseChargeApplicable}
                  onChange={(e) => onChange('reverseChargeApplicable', e.target.checked)}
                  disabled={readOnly}
                  sx={{
                    transform: 'translateY(4px)',
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' },
                  }}
                />
              }
              label="Reverse Charge (RCM)"
            />
          </Grid>
        </Grid>
      </>
    );
  }

  if (sellerType === 'MSTC') {
    return (
      <>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)', mt: 1 }}>
          MSTC Auction Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Auction Number"
              value={invoice.auctionNumber}
              onChange={(e) => onChange('auctionNumber', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.auctionNumber)}
              helperText={errors.auctionNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Auction Date"
              type="date"
              value={invoice.auctionDate}
              onChange={(e) => onChange('auctionDate', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.auctionDate)}
              helperText={errors.auctionDate}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Source"
              value={invoice.source}
              onChange={(e) => onChange('source', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.source)}
              helperText={errors.source}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lot Number"
              value={invoice.lotNumber}
              onChange={(e) => onChange('lotNumber', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              error={Boolean(errors.lotNumber)}
              helperText={errors.lotNumber}
            />
          </Grid>
        </Grid>
      </>
    );
  }

  if (sellerType === 'GEM') {
    return (
      <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontStyle: 'italic', mt: 1 }}>
        No additional fields required for GEM seller type.
      </Typography>
    );
  }

  return null;
}

InvoiceSellerFields.propTypes = {
  sellerType: PropTypes.string,
  invoice: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};
