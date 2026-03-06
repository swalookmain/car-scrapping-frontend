import React, { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import InventoryPartRow from './InventoryPartRow';
import { useInventoryForm } from './useInventoryForm';

// ── Component ──────────────────────────────────────────────────
const InventoryForm = forwardRef(({ onSubmit, readOnly = false }, ref) => {
  const {
    open, loading, editMode,
    invoices, invoiceLoading,
    selectedInvoiceId, selectedVehicleId, vehicleLabel, vehicleFetching,
    parts, errors, fileInputRefs,
    handleInvoiceSelect, getInvoiceLabel,
    handlePartChange, addPart, removePart,
    handleFileSelect, removeDocument,
    handleSubmit, handleClose,
    openFormWith,
  } = useInventoryForm({ onSubmit, readOnly });

  useImperativeHandle(ref, () => ({
    open: openFormWith,
    close: handleClose,
  }));

  // ── Render ───────────────────────────────────────────────────
  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title={editMode ? 'Edit Inventory Part' : 'Add Inventory Parts'}
      maxWidth="md"
      actions={
        !readOnly && (
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
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editMode ? 'Update' : 'Create'}
            </Button>
          </>
        )
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ── Invoice & Vehicle Selection ─────────────────────── */}
        {!editMode && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
              Invoice &amp; Vehicle
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  sx={{ width: '100%' }}
                  options={invoices}
                  getOptionLabel={getInvoiceLabel}
                  value={invoices.find((i) => (i._id || i.id) === selectedInvoiceId) || null}
                  onChange={(_, newVal) => handleInvoiceSelect(newVal ? (newVal._id || newVal.id) : '')}
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
            <Divider />
          </>
        )}

        {/* ── Parts ──────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
            Parts {parts.length > 1 ? `(${parts.length})` : ''}
          </Typography>
          {!editMode && !readOnly && (
            <Button
              startIcon={<AddIcon />}
              onClick={addPart}
              size="small"
              sx={{ color: 'var(--color-secondary-main)', textTransform: 'none' }}
            >
              Add Part
            </Button>
          )}
        </Box>

        {parts.map((part, index) => (
          <InventoryPartRow
            key={part._id || part.id || part._uid || index}
            part={part}
            index={index}
            errors={errors}
            readOnly={readOnly}
            showRemove={parts.length > 1}
            onPartChange={handlePartChange}
            onRemovePart={removePart}
            onFileSelect={handleFileSelect}
            onRemoveDocument={removeDocument}
            onClickFileInput={() => fileInputRefs.current[index]?.click()}
            fileInputRefCallback={(el) => { fileInputRefs.current[index] = el; }}
          />
        ))}
      </Box>
    </NormalModal>
  );
});

InventoryForm.displayName = 'InventoryForm';

InventoryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default InventoryForm;
