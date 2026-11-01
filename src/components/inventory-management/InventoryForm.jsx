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
import inputSx, { autocompleteSx } from '../../services/inputStyles';
import { booksDateInputProps, useBooksDateBounds } from '../../hooks/useBooksDateBounds';
import InventoryPartRow from './InventoryPartRow';
import InventoryPartPicker from './InventoryPartPicker';
import { useInventoryForm } from './useInventoryForm';

const InventoryForm = forwardRef(({ onSubmit, readOnly = false, materials = [], onRequestAddMaterial }, ref) => {
  const booksBounds = useBooksDateBounds();
  const {
    open, loading, editMode,
    yardVehicles, selectedYardVehicleId, yardVehiclesLoading,
    yardStatus, yardLoading, hasYardRecord, canAddParts,
    grossWeightKg, setGrossWeightKg, savingWeight, handleSaveGrossWeight,
    dismantledAt, setDismantledAt,
    catalogMode, catalogMeta, catalogMmv, catalogLoading,
    catalogParts, selectedParts, partCategories, existingPartKeys,
    parts, errors, fileInputRefs,
    handleYardVehicleSelect, handleStartDismantling,
    loadCatalogChecklistByMmv, handleCatalogMmvChange,
    handleAddGlobalPart, handleAddCategory,
    handleAddToSelected, handleAddManyToSelected, handleRemoveSelected, handleSelectedPartChange,
    handlePartChange, removePart,
    handleFileSelect, removeDocument,
    handleSubmit, handleClose,
    openFormWith,
    openFormWithAddMore,
  } = useInventoryForm({ onSubmit, readOnly });

  useImperativeHandle(ref, () => ({
    open: openFormWith,
    openAddMore: openFormWithAddMore,
    close: handleClose,
  }));

  const selectedYardVehicle = useMemo(
    () => yardVehicles.find((v) => v.id === selectedYardVehicleId) || null,
    [yardVehicles, selectedYardVehicleId],
  );

  const yardVehicleFullLabel = selectedYardVehicle?.label || '';

  const showPicker =
    !editMode
    && Boolean(selectedYardVehicleId)
    && canAddParts
    && (yardStatus === 'DISMANTLING_IN_PROGRESS' || yardStatus === 'DISMANTLED');

  const pickerHint = (() => {
    if (editMode) return '';
    if (!selectedYardVehicleId) return 'Select a parked yard vehicle to continue.';
    if (yardStatus === 'PARKED') return 'Start dismantling to add parts.';
    if (yardStatus === 'AWAITING_ARRIVAL') return 'Park this vehicle in Yard first.';
    if (yardStatus === 'DISMANTLED') return 'Add more parts to this vehicle.';
    if (hasYardRecord && yardStatus && yardStatus !== 'DISMANTLING_IN_PROGRESS') {
      return 'Vehicle must be in dismantling before you can add parts.';
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
              Yard vehicle
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Purchase invoice is optional. Select a vehicle already parked in Yard (lead or auction).
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  sx={autocompleteSx}
                  options={yardVehicles}
                  getOptionLabel={(option) => option.label || ''}
                  value={selectedYardVehicle}
                  onChange={(_, newVal) => handleYardVehicleSelect(newVal?.id || '')}
                  disabled={readOnly || yardVehiclesLoading}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {option.label}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Yard vehicle"
                      fullWidth
                      error={Boolean(errors.yardVehicleId)}
                      helperText={
                        errors.yardVehicleId
                        || (yardVehiclesLoading
                          ? 'Loading…'
                          : (yardVehicleFullLabel
                            || (!yardVehicles.length
                              ? 'No parked yard vehicles available'
                              : '')))
                      }
                      inputProps={{
                        ...params.inputProps,
                        title: yardVehicleFullLabel,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <TextField
              label="Dismantle date"
              type="date"
              value={dismantledAt}
              onChange={(e) => setDismantledAt(e.target.value)}
              fullWidth
              sx={{ ...inputSx, mt: 2 }}
              InputLabelProps={{ shrink: true }}
              inputProps={booksDateInputProps(booksBounds)}
              helperText="Leave empty to use today. Set this when recording a vehicle that was dismantled earlier."
            />

            {selectedYardVehicleId && (
              <>
                {hasYardRecord && (
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
                    {canAddParts && yardStatus === 'DISMANTLED' && (
                      <Typography variant="caption" sx={{ color: 'var(--color-success-dark)' }}>
                        Add more parts anytime
                      </Typography>
                    )}
                    {errors.yard && (
                      <Typography variant="caption" color="error" sx={{ width: '100%' }}>
                        {errors.yard}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box
                  sx={{
                    mt: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '8px',
                    bgcolor: grossWeightKg ? '#fff' : 'rgba(255, 193, 7, 0.08)',
                    border: `1px solid ${grossWeightKg ? 'var(--color-grey-200)' : '#f0c14b'}`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <TextField
                    size="small"
                    type="number"
                    label="Vehicle weight (KG)"
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(e.target.value)}
                    disabled={readOnly || !hasYardRecord}
                    sx={{ ...inputSx, width: { xs: '100%', sm: 220 } }}
                    inputProps={{ min: 0, step: 'any' }}
                    helperText={
                      !hasYardRecord
                        ? 'Park in Yard first to save weight'
                        : grossWeightKg
                          ? 'Loaded from yard / vehicle — edit if needed'
                          : 'Missed at park? Enter weight here for FORM-3'
                    }
                  />
                  {!readOnly && hasYardRecord && (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={savingWeight}
                      onClick={handleSaveGrossWeight}
                      sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                      {savingWeight ? <CircularProgress size={16} /> : 'Save weight'}
                    </Button>
                  )}
                </Box>
              </>
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
            existingPartKeys={existingPartKeys}
            catalogMeta={catalogMeta}
            catalogMmv={catalogMmv}
            catalogLoading={catalogLoading}
            partCategories={partCategories}
            materials={materials}
            onAddMaterial={onRequestAddMaterial}
            readOnly={readOnly || (!editMode && hasYardRecord && !canAddParts)}
            errors={errors}
            onLoadCatalog={() => loadCatalogChecklistByMmv()}
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
  materials: PropTypes.array,
  onRequestAddMaterial: PropTypes.func,
};

export default InventoryForm;
