import React, { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  Autocomplete,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { useQuery } from '@tanstack/react-query';
import { buyersApi, inventoryApi, invoicesApi } from '../../services/api';

// ── Constants ──────────────────────────────────────────────────
const INITIAL_INVOICE = {
  invoiceNumber: '',
  buyerId: '',
  invoiceDate: '',
  gstApplicable: false,
  gstRate: '',
  reverseChargeApplicable: false,
  ewayBillNumber: '',
  ewayBillDocumentUrl: '',
};

const INITIAL_ITEM = {
  partId: '',
  itemCode: '',
  quantity: '',
  unitPrice: '',
  // snapshot fields populated from selected part
  partName: '',
  vehicleCode: '',
  purchaseInvoiceNumber: '',
  availableQuantity: 0,
  category: '',
};

// ── Component ──────────────────────────────────────────────────
const SalesInvoiceForm = forwardRef(({ onSubmit, readOnly = false }, ref) => {
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState({ ...INITIAL_INVOICE });
  const [items, setItems] = useState([{ ...INITIAL_ITEM }]);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const editMode = Boolean(editingId);

  // ── Fetch buyers for dropdown ────────────────────────────────
  const { data: buyersData = [] } = useQuery({
    queryKey: ['buyers-all-for-sales'],
    queryFn: async () => {
      let allBuyers = [];
      let pg = 1;
      const limit = 100;
      const res = await buyersApi.getAll(pg, limit, {}, { useCache: false });
      const list = Array.isArray(res?.data) ? res.data : [];
      allBuyers = list;
      const totalPages = res?.meta?.totalPages || 1;
      while (pg < totalPages) {
        pg++;
        const nextRes = await buyersApi.getAll(pg, limit, {}, { useCache: false });
        const nextList = Array.isArray(nextRes?.data) ? nextRes.data : [];
        allBuyers = [...allBuyers, ...nextList];
      }
      return allBuyers;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch inventory parts for item selection ─────────────────
  const { data: inventoryData = [] } = useQuery({
    queryKey: ['inventory-all-for-sales'],
    queryFn: async () => {
      let allParts = [];
      let pg = 1;
      const limit = 100;
      const res = await inventoryApi.getAll({ page: pg, limit }, { useCache: false });
      const list = Array.isArray(res?.data) ? res.data : [];
      allParts = list;
      const totalPages = res?.meta?.totalPages || 1;
      while (pg < totalPages) {
        pg++;
        const nextRes = await inventoryApi.getAll({ page: pg, limit }, { useCache: false });
        const nextList = Array.isArray(nextRes?.data) ? nextRes.data : [];
        allParts = [...allParts, ...nextList];
      }
      return allParts;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Only show parts with available quantity > 0 and condition GOOD
  const availableParts = useMemo(() => {
    return inventoryData.filter((p) => {
      const opening = Number(p.openingStock) || 0;
      const received = Number(p.quantityReceived) || 0;
      const issued = Number(p.quantityIssued) || 0;
      const avail = opening + received - issued;
      return avail > 0 && p.condition !== 'DAMAGED';
    });
  }, [inventoryData]);

  // ── Fetch purchase invoices for Invoice Number dropdown ───────
  const { data: purchaseInvoicesData = [] } = useQuery({
    queryKey: ['purchase-invoices-all-for-sales'],
    queryFn: async () => {
      let allInvoices = [];
      let pg = 1;
      const limit = 100;
      const res = await invoicesApi.getAll(pg, limit, { useCache: false });
      const list = Array.isArray(res?.data) ? res.data : [];
      allInvoices = list;
      const totalPages = res?.meta?.totalPages || 1;
      while (pg < totalPages) {
        pg++;
        const nextRes = await invoicesApi.getAll(pg, limit, { useCache: false });
        const nextList = Array.isArray(nextRes?.data) ? nextRes.data : [];
        allInvoices = [...allInvoices, ...nextList];
      }
      return allInvoices;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        setInvoice({
          invoiceNumber: item.invoiceNumber || '',
          buyerId: item.buyerId || item.buyer?._id || item.buyer?.id || '',
          invoiceDate: item.invoiceDate ? item.invoiceDate.slice(0, 10) : '',
          gstApplicable: Boolean(item.gstApplicable),
          gstRate: item.gstRate ?? '',
          reverseChargeApplicable: Boolean(item.reverseChargeApplicable),
          ewayBillNumber: item.ewayBillNumber || '',
          ewayBillDocumentUrl: item.ewayBillDocumentUrl || '',
        });
        // Populate items
        if (item.items && item.items.length > 0) {
          setItems(
            item.items.map((it) => ({
              partId: it.partId || it.part?._id || it.part?.id || '',
              itemCode: it.itemCode || '',
              quantity: it.quantity ?? '',
              unitPrice: it.unitPrice ?? '',
              partName: it.partName || it.part?.partName || '',
              vehicleCode: it.vehicleCode || '',
              purchaseInvoiceNumber: it.purchaseInvoiceNumber || '',
              availableQuantity: it.availableQuantity ?? 0,
              category: it.category || it.part?.partType || '',
            }))
          );
        } else {
          setItems([{ ...INITIAL_ITEM }]);
        }
        setEditingId(item._id || item.id || null);
      } else {
        setInvoice({ ...INITIAL_INVOICE });
        setItems([{ ...INITIAL_ITEM }]);
        setEditingId(null);
      }
      setErrors({});
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingId(null);
    },
  }));

  // ── Handlers ─────────────────────────────────────────────────
  const handleInvoiceChange = (field, value) => {
    if (readOnly) return;
    setInvoice((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleItemChange = (index, field, value) => {
    if (readOnly) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    const errKey = `items[${index}].${field}`;
    if (errors[errKey]) setErrors((p) => ({ ...p, [errKey]: '' }));
  };

  const handlePartSelect = (index, part) => {
    if (!part) {
      handleItemChange(index, 'partId', '');
      handleItemChange(index, 'itemCode', '');
      handleItemChange(index, 'partName', '');
      handleItemChange(index, 'vehicleCode', '');
      handleItemChange(index, 'purchaseInvoiceNumber', '');
      handleItemChange(index, 'availableQuantity', 0);
      handleItemChange(index, 'category', '');
      return;
    }
    const opening = Number(part.openingStock) || 0;
    const received = Number(part.quantityReceived) || 0;
    const issued = Number(part.quantityIssued) || 0;
    const avail = opening + received - issued;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        partId: part._id || part.id,
        itemCode: part.itemCode || (part._id || part.id)?.slice(-8)?.toUpperCase() || '',
        partName: part.partName || '',
        vehicleCode: (part.vechileId || part.vehicleId || '')?.toString()?.slice(-8)?.toUpperCase() || '',
        purchaseInvoiceNumber: (part.invoiceId || '')?.toString()?.slice(-8)?.toUpperCase() || '',
        availableQuantity: avail,
        category: part.partType || '',
      };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...INITIAL_ITEM }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── GST Calculations ────────────────────────────────────────
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const gstAmount = useMemo(() => {
    if (!invoice.gstApplicable || !invoice.gstRate) return 0;
    return subtotal * (Number(invoice.gstRate) / 100);
  }, [subtotal, invoice.gstApplicable, invoice.gstRate]);

  const totalAmount = useMemo(() => {
    if (invoice.reverseChargeApplicable) return subtotal;
    return subtotal + gstAmount;
  }, [subtotal, gstAmount, invoice.reverseChargeApplicable]);

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!invoice.invoiceNumber.trim()) err.invoiceNumber = 'Invoice number is required';
    if (!invoice.buyerId) err.buyerId = 'Buyer is required';
    if (!invoice.invoiceDate) err.invoiceDate = 'Invoice date is required';
    if (invoice.gstApplicable && !invoice.gstRate) err.gstRate = 'GST rate is required when GST is applicable';

    if (items.length === 0) {
      err.items = 'At least one item is required';
    }

    items.forEach((it, idx) => {
      if (!it.partId) err[`items[${idx}].partId`] = 'Select a part';
      if (!it.quantity || Number(it.quantity) <= 0) err[`items[${idx}].quantity`] = 'Quantity must be > 0';
      if (it.quantity && it.availableQuantity && Number(it.quantity) > it.availableQuantity) {
        err[`items[${idx}].quantity`] = `Max available: ${it.availableQuantity}`;
      }
      if (!it.unitPrice || Number(it.unitPrice) <= 0) err[`items[${idx}].unitPrice`] = 'Unit price must be > 0';
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        invoiceNumber: invoice.invoiceNumber.trim(),
        buyerId: invoice.buyerId,
        invoiceDate: invoice.invoiceDate,
        gstApplicable: invoice.gstApplicable,
        gstRate: invoice.gstApplicable ? Number(invoice.gstRate) : 0,
        reverseChargeApplicable: invoice.reverseChargeApplicable,
        ewayBillNumber: invoice.ewayBillNumber.trim() || undefined,
        ewayBillDocumentUrl: invoice.ewayBillDocumentUrl.trim() || undefined,
        items: items.map((it) => ({
          partId: it.partId,
          itemCode: it.itemCode,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
      };

      await onSubmit({
        type: editingId ? 'update' : 'create',
        id: editingId,
        payload,
      });
      setOpen(false);
      setInvoice({ ...INITIAL_INVOICE });
      setItems([{ ...INITIAL_ITEM }]);
      setEditingId(null);
      setErrors({});
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInvoice({ ...INITIAL_INVOICE });
    setItems([{ ...INITIAL_ITEM }]);
    setEditingId(null);
    setErrors({});
  };

  // ── Get buyer label for autocomplete ─────────────────────────
  const getBuyerLabel = (buyer) => {
    if (!buyer) return '';
    const name = buyer.buyerName || '';
    const type = buyer.buyerType || '';
    return `${name} (${type})`;
  };

  const getPartLabel = (part) => {
    if (!part) return '';
    const code = part.itemCode || (part._id || part.id)?.slice(-8)?.toUpperCase() || '';
    const name = part.partName || '';
    return `${code} — ${name}`;
  };

  const getInvoiceLabel = (inv) => {
    if (!inv) return '';
    const num = inv.invoiceNumber || '';
    const seller = inv.sellerName || '';
    return `${num}${seller ? ` — ${seller}` : ''}`;
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title={readOnly ? 'View Sales Invoice' : editMode ? 'Edit Sales Invoice' : 'Create Sales Invoice'}
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
              disabled={loading}
              sx={{
                backgroundColor: 'var(--color-secondary-main)',
                '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : editMode ? 'Update Draft' : 'Save Draft'}
            </Button>
          </>
        )
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ── Invoice Header ─────────────────────────────────── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
          Invoice Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={purchaseInvoicesData}
              getOptionLabel={getInvoiceLabel}
              value={purchaseInvoicesData.find((i) => i.invoiceNumber === invoice.invoiceNumber) || null}
              onChange={(_, newVal) => handleInvoiceChange('invoiceNumber', newVal ? (newVal.invoiceNumber || '') : '')}
              disabled={readOnly}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Invoice Number *"
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.invoiceNumber)}
                  helperText={errors.invoiceNumber}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Invoice Date *"
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => handleInvoiceChange('invoiceDate', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.invoiceDate)}
              helperText={errors.invoiceDate}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={buyersData}
              getOptionLabel={getBuyerLabel}
              value={buyersData.find((b) => (b._id || b.id) === invoice.buyerId) || null}
              onChange={(_, newVal) => handleInvoiceChange('buyerId', newVal ? (newVal._id || newVal.id) : '')}
              disabled={readOnly}
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buyer *"
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.buyerId)}
                  helperText={errors.buyerId}
                />
              )}
            />
          </Grid>
        </Grid>

        <Divider />

        {/* ── Items Section ──────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
            Invoice Items ({items.length})
          </Typography>
          {!readOnly && (
            <Button
              startIcon={<AddIcon />}
              onClick={addItem}
              size="small"
              sx={{ color: 'var(--color-secondary-main)', textTransform: 'none' }}
            >
              Add Item
            </Button>
          )}
        </Box>

        {errors.items && (
          <Typography variant="caption" color="error">{errors.items}</Typography>
        )}

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'var(--color-grey-50)' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 220 }}>Part</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 80 }}>Item Code</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 80 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 60 }} align="center">Avail.</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 90 }} align="right">Quantity *</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 110 }} align="right">Unit Price *</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 100 }} align="right">Line Total</TableCell>
                {!readOnly && <TableCell sx={{ width: 40 }} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={availableParts}
                        getOptionLabel={getPartLabel}
                        value={availableParts.find((p) => (p._id || p.id) === item.partId) || null}
                        onChange={(_, newVal) => handlePartSelect(idx, newVal)}
                        disabled={readOnly}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search part..."
                            sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], borderRadius: '8px' } }}
                            error={Boolean(errors[`items[${idx}].partId`])}
                            helperText={errors[`items[${idx}].partId`]}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {item.itemCode || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {item.vehicleCode || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 500, color: item.availableQuantity > 0 ? '#2e7d32' : '#c62828' }}>
                        {item.availableQuantity || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        disabled={readOnly}
                        inputProps={{ min: 1, max: item.availableQuantity || undefined }}
                        sx={{ ...inputSx, width: 80, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], borderRadius: '8px' } }}
                        error={Boolean(errors[`items[${idx}].quantity`])}
                        helperText={errors[`items[${idx}].quantity`]}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        disabled={readOnly}
                        inputProps={{ min: 0 }}
                        sx={{ ...inputSx, width: 100, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], borderRadius: '8px' } }}
                        error={Boolean(errors[`items[${idx}].unitPrice`])}
                        helperText={errors[`items[${idx}].unitPrice`]}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {lineTotal > 0 ? `₹${lineTotal.toLocaleString('en-IN')}` : '—'}
                      </Typography>
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        {items.length > 1 && (
                          <Tooltip title="Remove">
                            <IconButton size="small" onClick={() => removeItem(idx)} sx={{ color: '#e53935' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        <Divider />

        {/* ── GST Section ────────────────────────────────────── */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
          GST & E-Way Bill
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={invoice.gstApplicable}
                  onChange={(e) => handleInvoiceChange('gstApplicable', e.target.checked)}
                  disabled={readOnly}
                  color="secondary"
                />
              }
              label="GST Applicable"
            />
          </Grid>
          {invoice.gstApplicable && (
            <>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="GST Rate (%) *"
                  type="number"
                  value={invoice.gstRate}
                  onChange={(e) => handleInvoiceChange('gstRate', e.target.value)}
                  fullWidth
                  disabled={readOnly}
                  sx={inputSx}
                  inputProps={{ min: 0, max: 100 }}
                  error={Boolean(errors.gstRate)}
                  helperText={errors.gstRate}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={invoice.reverseChargeApplicable}
                      onChange={(e) => handleInvoiceChange('reverseChargeApplicable', e.target.checked)}
                      disabled={readOnly}
                      color="secondary"
                    />
                  }
                  label="Reverse Charge (RCM)"
                />
              </Grid>
            </>
          )}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="E-Way Bill Number"
              value={invoice.ewayBillNumber}
              onChange={(e) => handleInvoiceChange('ewayBillNumber', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="E-Way Bill Document URL"
              value={invoice.ewayBillDocumentUrl}
              onChange={(e) => handleInvoiceChange('ewayBillDocumentUrl', e.target.value)}
              fullWidth
              disabled={readOnly}
              sx={inputSx}
              placeholder="https://..."
            />
          </Grid>
        </Grid>

        <Divider />

        {/* ── Totals Summary ─────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ minWidth: 250, p: 2, borderRadius: 2, backgroundColor: 'var(--color-grey-50)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>Subtotal</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>₹{subtotal.toLocaleString('en-IN')}</Typography>
            </Box>
            {invoice.gstApplicable && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
                  GST ({invoice.gstRate || 0}%){invoice.reverseChargeApplicable ? ' (RCM)' : ''}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: invoice.reverseChargeApplicable ? '#e65100' : undefined }}>
                  {invoice.reverseChargeApplicable ? 'N/A' : `₹${gstAmount.toLocaleString('en-IN')}`}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem' }}>₹{totalAmount.toLocaleString('en-IN')}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </NormalModal>
  );
});

SalesInvoiceForm.displayName = 'SalesInvoiceForm';

SalesInvoiceForm.propTypes = {
  onSubmit: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default SalesInvoiceForm;
