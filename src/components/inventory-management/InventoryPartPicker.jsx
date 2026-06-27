import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import inputSx from '../../services/inputStyles';
import { CONDITIONS, VEHICLE_TYPES } from './useInventoryForm';
import {
  formatCategoryLabel,
  getCategoryColor,
  getPartKey,
  groupByCategory,
  isDuplicateCategory,
  normalizeCategory,
} from './inventoryPickerUtils';

const panelSx = {
  borderRadius: '12px',
  border: '1px solid var(--color-grey-200)',
  bgcolor: '#fff',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 440,
  overflow: 'hidden',
};

const panelHeaderSx = {
  px: 2,
  py: 1.5,
  borderBottom: '1px solid var(--color-grey-100)',
  bgcolor: '#fff',
};

function CategorySection({ slug, count, expanded, onToggle, selectAll, children }) {
  const { color } = getCategoryColor(slug);
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.75,
          px: 1,
          cursor: 'pointer',
          borderRadius: '8px',
          '&:hover': { bgcolor: 'var(--color-grey-50)' },
        }}
      >
        <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: color, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-800)', flex: 1 }}>
          {formatCategoryLabel(slug)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-grey-500)' }}>
          {count}
        </Typography>
        {selectAll}
        <ExpandMoreIcon
          fontSize="small"
          sx={{
            color: 'var(--color-grey-400)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
      </Box>
      <Collapse in={expanded}>{children}</Collapse>
    </Box>
  );
}

function PanelShell({ title, subtitle, icon, children, footer, headerExtra, sx, onDragOver, onDragLeave, onDrop }) {
  return (
    <Box
      sx={{ ...panelSx, ...sx }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Box sx={panelHeaderSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: headerExtra ? 1.25 : 0 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: 'var(--color-grey-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-secondary-main)',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {headerExtra}
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, py: 1 }}>{children}</Box>
      {footer && (
        <Box sx={{ px: 1.5, py: 1.25, borderTop: '1px solid var(--color-grey-100)' }}>
          {footer}
        </Box>
      )}
    </Box>
  );
}

export default function InventoryPartPicker({
  catalogParts,
  selectedParts,
  catalogMeta,
  catalogMmv,
  catalogLoading,
  partCategories,
  readOnly,
  errors,
  onLoadCatalog,
  onLoadCatalogByMmv,
  onCatalogMmvChange,
  onSelectedPartChange,
  onRemoveSelected,
  onAddToSelected,
  onAddManyToSelected,
  onAddGlobalPart,
  onAddCategory,
}) {
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState({});
  const [checkedKeys, setCheckedKeys] = useState(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [newPart, setNewPart] = useState({ partName: '', partType: 'body', defaultQty: 1 });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catError, setCatError] = useState('');
  const [adding, setAdding] = useState(false);

  const categorySlugs = useMemo(
    () => (partCategories || []).map((c) => normalizeCategory(c.slug || c)),
    [partCategories],
  );

  const selectedKeys = useMemo(
    () => new Set(selectedParts.map(getPartKey)),
    [selectedParts],
  );

  const availableCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (catalogParts || []).filter((p) => {
      if (selectedKeys.has(getPartKey(p))) return false;
      if (!q) return true;
      return (
        (p.partName || '').toLowerCase().includes(q) ||
        formatCategoryLabel(p.partType).toLowerCase().includes(q)
      );
    });
  }, [catalogParts, selectedKeys, search]);

  const catalogGroups = useMemo(
    () => groupByCategory(availableCatalog, categorySlugs),
    [availableCatalog, categorySlugs],
  );

  const selectedGroups = useMemo(
    () => groupByCategory(selectedParts, categorySlugs),
    [selectedParts, categorySlugs],
  );

  const toggleExpand = (slug) => {
    setExpandedCats((prev) => ({ ...prev, [slug]: prev[slug] === false }));
  };

  const isExpanded = (slug) => expandedCats[slug] !== false;

  const toggleCheck = (part) => {
    const key = getPartKey(part);
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllInCategory = (parts, select) => {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      parts.forEach((p) => {
        const key = getPartKey(p);
        if (select) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  };

  const moveCheckedToSelected = () => {
    const toAdd = availableCatalog.filter((p) => checkedKeys.has(getPartKey(p)));
    if (toAdd.length) onAddManyToSelected(toAdd);
    setCheckedKeys(new Set());
  };

  const handleDragStart = (e, part) => {
    e.dataTransfer.setData('application/json', JSON.stringify(part));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      onAddToSelected(JSON.parse(raw));
    } catch {
      // ignore
    }
  };

  const handleAddPart = async () => {
    if (!newPart.partName.trim() || !catalogMeta?.variantId) return;
    setAdding(true);
    try {
      await onAddGlobalPart(catalogMeta.variantId, {
        ...newPart,
        partType: normalizeCategory(newPart.partType),
      });
      setNewPart({ partName: '', partType: 'body', defaultQty: 1 });
      setAddPartOpen(false);
    } finally {
      setAdding(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      setCatError('Enter a category name');
      return;
    }
    if (isDuplicateCategory(name, partCategories)) {
      setCatError('Category already exists');
      return;
    }
    setAdding(true);
    try {
      await onAddCategory(name);
      setNewCategoryName('');
      setCatError('');
      setAddCatOpen(false);
    } catch (e) {
      setCatError(e?.response?.data?.message || e.message || 'Could not add category');
    } finally {
      setAdding(false);
    }
  };

  const totalSelected = selectedParts.length;
  const totalValue = selectedParts.reduce(
    (sum, p) => sum + (Number(p.openingStock) || 0) * (Number(p.unitPrice) || 0),
    0,
  );

  const catalogHint = catalogMeta?.usesGenericMaster
    ? `Master ${catalogMeta.vehicleType || catalogMmv?.vehicleType || 'CAR'} catalog`
    : catalogMeta
      ? `${catalogMeta.make} ${catalogMeta.model}${catalogMeta.variant ? ` · ${catalogMeta.variant}` : ''}`
      : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Compact vehicle + catalog toolbar */}
      <Box
        sx={{
          p: 2,
          borderRadius: '12px',
          border: '1px solid var(--color-grey-200)',
          bgcolor: 'var(--color-grey-50)',
        }}
      >
        <Grid container spacing={1.5} alignItems="flex-end">
          {['make', 'model', 'variant'].map((field) => (
            <Grid item xs={6} sm={3} key={field}>
              <TextField
                fullWidth
                size="small"
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={catalogMmv?.[field] || (field === 'variant' ? 'Standard' : '')}
                disabled={readOnly}
                onChange={(e) => onCatalogMmvChange(field, e.target.value)}
                sx={inputSx}
              />
            </Grid>
          ))}
          <Grid item xs={6} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Type"
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
            <Grid item xs={12} sm={12} md="auto">
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  disableElevation
                  startIcon={catalogLoading ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
                  onClick={onLoadCatalogByMmv}
                  disabled={catalogLoading}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    bgcolor: 'var(--color-secondary-main)',
                    '&:hover': { bgcolor: 'var(--color-secondary-dark)' },
                  }}
                >
                  Load catalog
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={onLoadCatalog}
                  disabled={catalogLoading}
                  sx={{ textTransform: 'none', color: 'var(--color-grey-600)' }}
                >
                  Sync vehicle
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
        {catalogHint && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: 'var(--color-grey-500)' }}>
            {catalogHint}
            {catalogMeta?.hasUserAddedParts ? ' · includes custom parts' : ''}
          </Typography>
        )}
      </Box>

      {errors.parts && (
        <Typography variant="caption" color="error">{errors.parts}</Typography>
      )}

      {catalogLoading && !catalogParts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} sx={{ color: 'var(--color-secondary-main)' }} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              px: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
              <strong>{totalSelected}</strong> parts to add
              {totalSelected > 0 && (
                <> · ₹{totalValue.toLocaleString('en-IN')} total</>
              )}
            </Typography>
            {!readOnly && checkedKeys.size > 0 && (
              <Button
                size="small"
                variant="contained"
                disableElevation
                onClick={moveCheckedToSelected}
                sx={{ textTransform: 'none', borderRadius: '8px' }}
              >
                Add {checkedKeys.size} parts
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            {/* Basket */}
            <Grid item xs={12} lg={6}>
              <PanelShell
                title="Parts to add"
                subtitle="Set quantity and price for each part"
                icon={<PlaylistAddCheckOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  outline: dragOver ? '2px solid var(--color-secondary-200)' : 'none',
                  outlineOffset: -2,
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                  {!selectedGroups.length ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        px: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          bgcolor: 'var(--color-grey-50)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1.5,
                        }}
                      >
                        <PlaylistAddCheckOutlinedIcon sx={{ color: 'var(--color-grey-400)' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Select parts from the catalog
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click → or drag items here
                      </Typography>
                    </Box>
                  ) : (
                    selectedGroups.map((group) => (
                      <CategorySection
                        key={group.slug}
                        slug={group.slug}
                        count={group.parts.length}
                        expanded={isExpanded(`sel_${group.slug}`)}
                        onToggle={() => toggleExpand(`sel_${group.slug}`)}
                      >
                        <Stack spacing={0.75} sx={{ pl: 1.5, pb: 0.5 }}>
                          {group.parts.map((part) => {
                            const idx = selectedParts.findIndex((p) => getPartKey(p) === getPartKey(part));
                            return (
                              <Box
                                key={getPartKey(part)}
                                sx={{
                                  py: 1,
                                  px: 1.25,
                                  borderRadius: '8px',
                                  border: '1px solid var(--color-grey-100)',
                                  bgcolor: 'var(--color-grey-50)',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500, flex: 1, color: 'var(--color-grey-800)' }}
                                    noWrap
                                  >
                                    {part.partName}
                                  </Typography>
                                  {!readOnly && (
                                    <IconButton
                                      size="small"
                                      onClick={() => onRemoveSelected(getPartKey(part))}
                                      sx={{ color: 'var(--color-grey-400)', p: 0.25 }}
                                    >
                                      <CloseIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  )}
                                </Box>
                                <Grid container spacing={1}>
                                  <Grid item xs={4}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      label="Qty"
                                      value={part.openingStock}
                                      disabled={readOnly}
                                      onChange={(e) => onSelectedPartChange(idx, 'openingStock', Number(e.target.value))}
                                      sx={inputSx}
                                      inputProps={{ min: 0 }}
                                    />
                                  </Grid>
                                  <Grid item xs={4}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      type="number"
                                      label="Price"
                                      value={part.unitPrice}
                                      disabled={readOnly}
                                      onChange={(e) => onSelectedPartChange(idx, 'unitPrice', e.target.value)}
                                      sx={inputSx}
                                      error={Boolean(errors[`part_${idx}_unitPrice`])}
                                      helperText={errors[`part_${idx}_unitPrice`]}
                                      inputProps={{ min: 0 }}
                                    />
                                  </Grid>
                                  <Grid item xs={4}>
                                    <TextField
                                      select
                                      fullWidth
                                      size="small"
                                      label="Cond."
                                      value={part.condition}
                                      disabled={readOnly}
                                      onChange={(e) => onSelectedPartChange(idx, 'condition', e.target.value)}
                                      sx={inputSx}
                                    >
                                      {CONDITIONS.map((c) => (
                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>
                                </Grid>
                              </Box>
                            );
                          })}
                        </Stack>
                      </CategorySection>
                    ))
                  )}
              </PanelShell>
            </Grid>

            {/* Catalog */}
            <Grid item xs={12} lg={6}>
              <PanelShell
                title="Parts catalog"
                subtitle={`${availableCatalog.length} available`}
                icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
                headerExtra={
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 18, color: 'var(--color-grey-400)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                }
                footer={
                  !readOnly && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setAddPartOpen(true)}
                        disabled={!catalogMeta?.variantId}
                        sx={{ textTransform: 'none', color: 'var(--color-grey-700)' }}
                      >
                        Add part
                      </Button>
                      <Button
                        size="small"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => setAddCatOpen(true)}
                        sx={{ textTransform: 'none', color: 'var(--color-grey-700)' }}
                      >
                        New category
                      </Button>
                    </Stack>
                  )
                }
              >
                {!catalogGroups.length ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 6, textAlign: 'center' }}
                  >
                    {catalogParts.length
                      ? 'All parts are already selected'
                      : 'Load catalog to begin'}
                  </Typography>
                ) : (
                  catalogGroups.map((group) => {
                    const allChecked = group.parts.every((p) => checkedKeys.has(getPartKey(p)));
                    const someChecked = group.parts.some((p) => checkedKeys.has(getPartKey(p)));
                    return (
                      <CategorySection
                        key={group.slug}
                        slug={group.slug}
                        count={group.parts.length}
                        expanded={isExpanded(`cat_${group.slug}`)}
                        onToggle={() => toggleExpand(`cat_${group.slug}`)}
                        selectAll={
                          !readOnly && (
                            <Checkbox
                              size="small"
                              checked={allChecked}
                              indeterminate={someChecked && !allChecked}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => selectAllInCategory(group.parts, !allChecked)}
                              sx={{ p: 0.25 }}
                            />
                          )
                        }
                      >
                        <Stack spacing={0} sx={{ pl: 1.5 }}>
                          {group.parts.map((part) => (
                            <Box
                              key={getPartKey(part)}
                              draggable={!readOnly}
                              onDragStart={(e) => handleDragStart(e, part)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                py: 0.75,
                                px: 0.5,
                                borderRadius: '6px',
                                cursor: readOnly ? 'default' : 'pointer',
                                '&:hover': readOnly
                                  ? {}
                                  : { bgcolor: 'var(--color-grey-50)' },
                                '&:hover .add-btn': { opacity: 1 },
                              }}
                            >
                              {!readOnly && (
                                <Checkbox
                                  size="small"
                                  checked={checkedKeys.has(getPartKey(part))}
                                  onChange={() => toggleCheck(part)}
                                  onClick={(e) => e.stopPropagation()}
                                  sx={{ p: 0.25 }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{ flex: 1, color: 'var(--color-grey-700)', fontSize: '0.875rem' }}
                                noWrap
                              >
                                {part.partName}
                              </Typography>
                              {part.defaultQty > 1 && (
                                <Typography variant="caption" sx={{ color: 'var(--color-grey-400)', flexShrink: 0 }}>
                                  ×{part.defaultQty}
                                </Typography>
                              )}
                              {!readOnly && (
                                <IconButton
                                  className="add-btn"
                                  size="small"
                                  onClick={() => onAddToSelected(part)}
                                  sx={{
                                    opacity: 0.5,
                                    color: 'var(--color-secondary-main)',
                                    p: 0.25,
                                    transition: 'opacity 0.15s',
                                  }}
                                >
                                  <ChevronRightIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </CategorySection>
                    );
                  })
                )}
              </PanelShell>
            </Grid>
          </Grid>
        </>
      )}

      <Dialog open={addPartOpen} onClose={() => setAddPartOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 600, pb: 0.5 }}>Add part to catalog</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Part name"
              value={newPart.partName}
              onChange={(e) => setNewPart((p) => ({ ...p, partName: e.target.value }))}
              sx={inputSx}
              autoFocus
            />
            <TextField
              select
              fullWidth
              size="small"
              label="Category"
              value={newPart.partType}
              onChange={(e) => setNewPart((p) => ({ ...p, partType: e.target.value }))}
              sx={inputSx}
            >
              {(partCategories || []).map((c) => (
                <MenuItem key={c.slug} value={c.slug}>
                  {c.label || formatCategoryLabel(c.slug)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Default quantity"
              value={newPart.defaultQty}
              onChange={(e) => setNewPart((p) => ({ ...p, defaultQty: Number(e.target.value) }))}
              sx={inputSx}
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddPartOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            disableElevation
            disabled={adding || !newPart.partName.trim()}
            onClick={handleAddPart}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            {adding ? <CircularProgress size={18} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addCatOpen} onClose={() => setAddCatOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 600, pb: 0.5 }}>New category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            label="Category name"
            value={newCategoryName}
            onChange={(e) => { setNewCategoryName(e.target.value); setCatError(''); }}
            error={Boolean(catError)}
            helperText={catError || (newCategoryName ? `Saved as "${normalizeCategory(newCategoryName)}"` : '')}
            sx={{ ...inputSx, mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddCatOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            disableElevation
            disabled={adding}
            onClick={handleAddCategory}
            sx={{ textTransform: 'none', borderRadius: '8px' }}
          >
            {adding ? <CircularProgress size={18} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
