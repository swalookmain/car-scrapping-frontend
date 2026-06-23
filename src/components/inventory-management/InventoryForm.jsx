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
import InventoryCatalogChecklist from './InventoryCatalogChecklist';
import { useInventoryForm } from './useInventoryForm';

// ── Component ──────────────────────────────────────────────────
const InventoryForm = forwardRef(({ onSubmit, readOnly = false }, ref) => {
  const {
    open, loading, editMode,
    invoices, invoiceLoading,
    selectedInvoiceId, invoiceVehicles, selectedVehicleId, vehicleLabel, vehicleFetching,
    yardStatus, yardLoading, hasYardRecord, canAddParts,
    catalogMode, catalogMeta, catalogMmv, catalogLoading,
    parts, errors, fileInputRefs,
    handleInvoiceSelect, handleVehicleSelect, getInvoiceLabel, handleStartDismantling,
    loadCatalogChecklist, loadCatalogChecklistByMmv, handleCatalogMmvChange, handleAddGlobalPart,
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
      maxWidth="lg"
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
                <Autocomplete
                  sx={{ width: '100%' }}
                  options={invoiceVehicles}
                  getOptionLabel={(option) => option.label || ''}
                  value={invoiceVehicles.find((v) => v.id === selectedVehicleId) || null}
                  onChange={(_, newVal) => handleVehicleSelect(newVal?.id || '')}
                  disabled={readOnly || vehicleFetching || !selectedInvoiceId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Vehicle"
                      fullWidth
                      sx={inputSx}
                      error={Boolean(errors.vehicleId)}
                      helperText={
                        errors.vehicleId ||
                        (vehicleFetching
                          ? 'Loading vehicles...'
                          : (selectedInvoiceId && invoiceVehicles.length === 0
                            ? 'No vehicles available for selected invoice'
                            : ''))
                      }
                    />
                  )}
                />
              </Grid>
              {selectedVehicleId && hasYardRecord && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(106, 75, 255, 0.06)',
                      border: '1px solid rgba(106, 75, 255, 0.15)',
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Yard status:{' '}
                      <strong>{yardStatus?.replace(/_/g, ' ') || '—'}</strong>
                      {yardLoading ? ' (checking…)' : ''}
                    </Typography>
                    {yardStatus === 'PARKED' && (
                      <Button
                        variant="contained"
                        size="small"
                        disabled={yardLoading}
                        onClick={handleStartDismantling}
                        sx={{ mr: 1 }}
                      >
                        Start dismantling
                      </Button>
                    )}
                    {yardStatus === 'AWAITING_ARRIVAL' && (
                      <Typography variant="caption" color="error">
                        Park this vehicle in Yard Management before dismantling.
                      </Typography>
                    )}
                    {errors.yard && (
                      <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                        {errors.yard}
                      </Typography>
                    )}
                    {canAddParts && yardStatus === 'DISMANTLING_IN_PROGRESS' && (
                      <Typography variant="caption" color="success.main">
                        Ready to add dismantled parts.
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
            <Divider />
          </>
        )}

        {/* ── Parts ──────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
            Parts {parts.length > 1 ? `(${parts.length})` : ''}
          </Typography>
          {!editMode && !readOnly && canAddParts && !catalogMode && (
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

        {errors.parts && (
          <Typography variant="caption" color="error">{errors.parts}</Typography>
        )}

        {!editMode && canAddParts && (catalogMode || yardStatus === 'DISMANTLING_IN_PROGRESS') ? (
          <InventoryCatalogChecklist
            parts={parts}
            catalogMeta={catalogMeta}
            catalogMmv={catalogMmv}
            catalogLoading={catalogLoading}
            readOnly={readOnly || (!editMode && hasYardRecord && !canAddParts)}
            errors={errors}
            onLoadCatalog={() => loadCatalogChecklist()}
            onLoadCatalogByMmv={() => loadCatalogChecklistByMmv()}
            onCatalogMmvChange={handleCatalogMmvChange}
            onPartChange={handlePartChange}
            onAddGlobalPart={handleAddGlobalPart}
          />
        ) : (
          parts.map((part, index) => (
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
          ))
        )}
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
