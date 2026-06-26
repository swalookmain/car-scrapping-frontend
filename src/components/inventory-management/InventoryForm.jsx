import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import { autocompleteSx } from '../../services/inputStyles';
import InventoryPartRow from './InventoryPartRow';
import InventoryPartPicker from './InventoryPartPicker';
import { useInventoryForm } from './useInventoryForm';

const InventoryForm = forwardRef(({ onSubmit, readOnly = false }, ref) => {
  const {
    open, loading, editMode,
    invoices, invoiceLoading,
    selectedInvoiceId, invoiceVehicles, selectedVehicleId, vehicleFetching,
    yardStatus, yardLoading, hasYardRecord, canAddParts,
    catalogMode, catalogMeta, catalogMmv, catalogLoading,
    catalogParts, selectedParts, partCategories,
    parts, errors, fileInputRefs,
    handleInvoiceSelect, handleVehicleSelect, getInvoiceLabel, handleStartDismantling,
    loadCatalogChecklist, loadCatalogChecklistByMmv, handleCatalogMmvChange,
    handleAddGlobalPart, handleAddCategory,
    handleAddToSelected, handleAddManyToSelected, handleRemoveSelected, handleSelectedPartChange,
    handlePartChange, removePart,
    handleFileSelect, removeDocument,
    handleSubmit, handleClose,
    openFormWith,
  } = useInventoryForm({ onSubmit, readOnly });

  useImperativeHandle(ref, () => ({
    open: openFormWith,
    close: handleClose,
  }));

  const selectedInvoice = useMemo(
    () => invoices.find((i) => (i._id || i.id) === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId],
  );

  const selectedVehicle = useMemo(
    () => invoiceVehicles.find((v) => v.id === selectedVehicleId) || null,
    [invoiceVehicles, selectedVehicleId],
  );

  const invoiceFullLabel = selectedInvoice ? getInvoiceLabel(selectedInvoice) : '';
  const vehicleFullLabel = selectedVehicle?.label || '';

  const showPicker =
    !editMode
    && Boolean(selectedInvoiceId)
    && Boolean(selectedVehicleId)
    && canAddParts
    && yardStatus === 'DISMANTLING_IN_PROGRESS';

  const pickerHint = (() => {
    if (editMode) return '';
    if (!selectedInvoiceId) return 'Select an invoice to continue.';
    if (!selectedVehicleId) return 'Select a vehicle from this invoice.';
    if (yardStatus === 'PARKED') return 'Start dismantling in Yard to add parts.';
    if (yardStatus === 'AWAITING_ARRIVAL') return 'Park this vehicle in Yard first.';
    if (hasYardRecord && yardStatus && yardStatus !== 'DISMANTLING_IN_PROGRESS') {
      return 'Vehicle must be in dismantling before you can add parts.';
    }
    if (!hasYardRecord && selectedVehicleId) {
      return 'Link this vehicle in Yard management, then start dismantling.';
    }
    return '';
  })();

  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title={editMode ? 'Edit Inventory Part' : 'Add Inventory Parts'}
      maxWidth={showPicker || editMode ? 'xl' : 'md'}
      actions={
        !readOnly && (
          <>
            <Button onClick={handleClose} sx={{ color: 'var(--color-grey-600)' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || (!editMode && hasYardRecord && !canAddParts)}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {!editMode && (
          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              border: '1px solid var(--color-grey-200)',
              bgcolor: 'var(--color-grey-50)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'var(--color-grey-800)' }}>
              Invoice &amp; vehicle
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  sx={autocompleteSx}
                  options={invoices}
                  getOptionLabel={getInvoiceLabel}
                  value={selectedInvoice}
                  onChange={(_, newVal) => handleInvoiceSelect(newVal ? (newVal._id || newVal.id) : '')}
                  disabled={readOnly || invoiceLoading}
                  isOptionEqualToValue={(opt, val) => (opt._id || opt.id) === (val._id || val.id)}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {getInvoiceLabel(option)}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Invoice number"
                      fullWidth
                      error={Boolean(errors.invoiceId)}
                      helperText={
                        errors.invoiceId
                        || (invoiceLoading ? 'Loading…' : (invoiceFullLabel || ''))
                      }
                      inputProps={{
                        ...params.inputProps,
                        title: invoiceFullLabel,
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  sx={autocompleteSx}
                  options={invoiceVehicles}
                  getOptionLabel={(option) => option.label || ''}
                  value={selectedVehicle}
                  onChange={(_, newVal) => handleVehicleSelect(newVal?.id || '')}
                  disabled={readOnly || vehicleFetching || !selectedInvoiceId}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {option.label}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Vehicle"
                      fullWidth
                      error={Boolean(errors.vehicleId)}
                      helperText={
                        errors.vehicleId
                        || (vehicleFetching
                          ? 'Loading…'
                          : (vehicleFullLabel
                            || (selectedInvoiceId && invoiceVehicles.length === 0
                              ? 'No vehicles for this invoice'
                              : '')))
                      }
                      inputProps={{
                        ...params.inputProps,
                        title: vehicleFullLabel,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {selectedVehicleId && hasYardRecord && (
              <Box
                sx={{
                  mt: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: '8px',
                  bgcolor: '#fff',
                  border: '1px solid var(--color-grey-200)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
                  Yard: <strong>{yardStatus?.replace(/_/g, ' ') || '—'}</strong>
                  {yardLoading ? ' …' : ''}
                </Typography>
                {yardStatus === 'PARKED' && (
                  <Button
                    variant="contained"
                    size="small"
                    disableElevation
                    disabled={yardLoading}
                    onClick={handleStartDismantling}
                    sx={{ textTransform: 'none', borderRadius: '8px', py: 0.25 }}
                  >
                    Start dismantling
                  </Button>
                )}
                {yardStatus === 'AWAITING_ARRIVAL' && (
                  <Typography variant="caption" color="error">
                    Park vehicle in Yard first
                  </Typography>
                )}
                {canAddParts && yardStatus === 'DISMANTLING_IN_PROGRESS' && (
                  <Typography variant="caption" sx={{ color: 'var(--color-success-dark)' }}>
                    Ready to add parts
                  </Typography>
                )}
                {errors.yard && (
                  <Typography variant="caption" color="error" sx={{ width: '100%' }}>
                    {errors.yard}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {!editMode && !showPicker && pickerHint && (
          <Typography
            variant="body2"
            sx={{
              py: 2,
              px: 1,
              color: 'var(--color-grey-500)',
              textAlign: 'center',
            }}
          >
            {pickerHint}
          </Typography>
        )}

        {showPicker && (
          <InventoryPartPicker
            catalogParts={catalogParts}
            selectedParts={selectedParts}
            catalogMeta={catalogMeta}
            catalogMmv={catalogMmv}
            catalogLoading={catalogLoading}
            partCategories={partCategories}
            readOnly={readOnly || (!editMode && hasYardRecord && !canAddParts)}
            errors={errors}
            onLoadCatalog={() => loadCatalogChecklist()}
            onLoadCatalogByMmv={() => loadCatalogChecklistByMmv()}
            onCatalogMmvChange={handleCatalogMmvChange}
            onSelectedPartChange={handleSelectedPartChange}
            onRemoveSelected={handleRemoveSelected}
            onAddToSelected={handleAddToSelected}
            onAddManyToSelected={handleAddManyToSelected}
            onAddGlobalPart={handleAddGlobalPart}
            onAddCategory={handleAddCategory}
          />
        )}

        {editMode && parts.map((part, index) => (
            <InventoryPartRow
              key={part._id || part.id || part._uid || index}
              part={part}
              index={index}
              errors={errors}
              readOnly={readOnly || (!editMode && hasYardRecord && !canAddParts)}
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
