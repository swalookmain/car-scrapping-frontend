import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import inputSx from '../../services/inputStyles';
import { PART_TYPES, CONDITIONS, VEHICLE_TYPES } from './useInventoryForm';

const CATEGORY_LABELS = {
  SALEABLE: 'Saleable',
  SCRAP: 'Scrap',
};

export default function InventoryCatalogChecklist({
  parts,
  catalogMeta,
  catalogMmv,
  catalogLoading,
  readOnly,
  errors,
  onLoadCatalog,
  onLoadCatalogByMmv,
  onCatalogMmvChange,
  onPartChange,
  onAddGlobalPart,
}) {
  const [newPart, setNewPart] = useState({
    partName: '',
    partType: 'BODY',
    defaultQty: 1,
  });
  const [adding, setAdding] = useState(false);

  const saleableCount = parts.filter((p) => p.included && p.category !== 'SCRAP').length;
  const scrapCount = parts.filter((p) => p.included && p.category === 'SCRAP').length;

  const handleAddGlobal = async () => {
    if (!newPart.partName.trim() || !catalogMeta?.variantId) return;
    setAdding(true);
    try {
      await onAddGlobalPart(catalogMeta.variantId, newPart);
      setNewPart({ partName: '', partType: 'BODY', defaultQty: 1 });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Vehicle model for parts catalog
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        Use invoice vehicle details or type a new make/model. Master parts load by vehicle type;
        parts you add are saved globally for this make / model / variant.
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Make"
            value={catalogMmv?.make || ''}
            disabled={readOnly}
            onChange={(e) => onCatalogMmvChange('make', e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Model"
            value={catalogMmv?.model || ''}
            disabled={readOnly}
            onChange={(e) => onCatalogMmvChange('model', e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            size="small"
            label="Variant"
            value={catalogMmv?.variant || 'Standard'}
            disabled={readOnly}
            onChange={(e) => onCatalogMmvChange('variant', e.target.value)}
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Vehicle type"
            value={catalogMmv?.vehicleType || 'CAR'}
            disabled={readOnly}
            onChange={(e) => onCatalogMmvChange('vehicleType', e.target.value)}
            sx={inputSx}
          >
            {VEHICLE_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </Grid>
        {!readOnly && (
          <Grid item xs={12}>
            <Button
              variant="outlined"
              size="small"
              startIcon={catalogLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={onLoadCatalogByMmv}
              disabled={catalogLoading}
            >
              Load parts catalog
            </Button>
          </Grid>
        )}
      </Grid>

      {catalogMeta?.usesGenericMaster && (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(25,118,210,0.06)' }}>
          <Typography variant="body2">
            New model — showing <strong>master {catalogMeta.vehicleType || catalogMmv?.vehicleType}</strong> parts.
            Add any missing parts below; they will appear automatically for the next customer with the same model.
          </Typography>
        </Box>
      )}

      {catalogMeta && !catalogMeta.usesGenericMaster && (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(46,125,50,0.06)' }}>
          <Typography variant="body2">
            Loaded saved catalog for{' '}
            <strong>
              {catalogMeta.make} {catalogMeta.model}
              {catalogMeta.variant ? ` • ${catalogMeta.variant}` : ''}
            </strong>
            {catalogMeta.hasUserAddedParts ? ' (includes parts added by your team)' : ''}.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Dismantling checklist
          </Typography>
        </Box>
        {!readOnly && parts.length > 0 && (
          <Button
            size="small"
            startIcon={catalogLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={onLoadCatalog}
            disabled={catalogLoading}
          >
            Reload from vehicle
          </Button>
        )}
      </Box>

      {catalogLoading && !parts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !parts.length ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Enter make and model above, then click &quot;Load parts catalog&quot; to see dismantling parts.
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip size="small" label={`${saleableCount} saleable selected`} color="primary" variant="outlined" />
            <Chip size="small" label={`${scrapCount} scrap selected`} variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 420, overflow: 'auto', pr: 0.5 }}>
            {parts.map((part, index) => (
              <Box
                key={part._uid || part.catalogPartId || index}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid var(--color-grey-100)',
                  bgcolor: part.included ? '#fff' : 'rgba(0,0,0,0.02)',
                  opacity: part.included ? 1 : 0.7,
                }}
              >
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={part.included !== false}
                          disabled={readOnly}
                          onChange={(e) => onPartChange(index, 'included', e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {part.partName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {CATEGORY_LABELS[part.category] || part.category || 'Part'}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Type"
                      value={part.partType}
                      disabled={readOnly || Boolean(part.catalogPartId)}
                      onChange={(e) => onPartChange(index, 'partType', e.target.value)}
                      sx={inputSx}
                    >
                      {PART_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Qty"
                      value={part.openingStock}
                      disabled={readOnly || !part.included}
                      onChange={(e) => onPartChange(index, 'openingStock', Number(e.target.value))}
                      sx={inputSx}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Condition"
                      value={part.condition}
                      disabled={readOnly || !part.included}
                      onChange={(e) => onPartChange(index, 'condition', e.target.value)}
                      sx={inputSx}
                    >
                      {CONDITIONS.map((c) => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Unit price"
                      value={part.unitPrice}
                      disabled={readOnly || !part.included}
                      onChange={(e) => onPartChange(index, 'unitPrice', e.target.value)}
                      sx={inputSx}
                      error={Boolean(errors[`part_${index}_unitPrice`])}
                      helperText={errors[`part_${index}_unitPrice`]}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>

          {!readOnly && catalogMeta?.variantId && (
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(106,75,255,0.04)' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Add missing part (saved for all users on this make / model / variant)
              </Typography>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Part name"
                    value={newPart.partName}
                    onChange={(e) => setNewPart((p) => ({ ...p, partName: e.target.value }))}
                    sx={inputSx}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Type"
                    value={newPart.partType}
                    onChange={(e) => setNewPart((p) => ({ ...p, partType: e.target.value }))}
                    sx={inputSx}
                  >
                    {PART_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Default qty"
                    value={newPart.defaultQty}
                    onChange={(e) => setNewPart((p) => ({ ...p, defaultQty: Number(e.target.value) }))}
                    sx={inputSx}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    disabled={adding || !newPart.partName.trim()}
                    onClick={handleAddGlobal}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
