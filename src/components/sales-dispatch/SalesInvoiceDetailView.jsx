import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import InvoicePayments from '../accounting/InvoicePayments';
import { useLookupMaps, enrichRow } from '../../hooks/useLookupMaps';

// ── Color maps ─────────────────────────────────────────────────
const statusColor = {
  DRAFT: { bg: '#fff3e0', color: '#e65100', label: 'Draft' },
  CONFIRMED: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmed' },
  CANCELLED: { bg: '#ffebee', color: '#c62828', label: 'Cancelled' },
};

const SectionLabel = ({ children }) => (
  <Typography
    variant="subtitle2"
    sx={{ fontWeight: 600, color: 'var(--color-grey-700)', textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

const FieldLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

const SalesInvoiceDetailView = ({ item }) => {
  if (!item) return null;

  // API response se invoice object aur items array ko extract kar rahe hain
  const invoiceData = item.invoice || item;
  const items = item.items || [];

  // Lookup maps to resolve vehicleCode/invoiceRef in items
  const { invoiceMap, vehicleMap, vehicleByInvoiceMap } = useLookupMaps(true);

  const st = statusColor[invoiceData.status] || statusColor.DRAFT;

  const headerRows = [
    { label: 'Invoice Number', value: invoiceData.invoiceNumber || '—' },
    { label: 'Status', value: st.label, chip: true, chipBg: st.bg, chipColor: st.color },
    { label: 'Invoice Date', value: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { label: 'Buyer', value: invoiceData.buyer?.buyerName || invoiceData.buyerName || '—' },
    { label: 'Buyer Type', value: invoiceData.buyer?.buyerType || '—' },
    { label: 'Buyer GSTIN', value: invoiceData.buyer?.gstin || '—' },
  ];

  const gstRows = [
    { label: 'GST Applicable', value: invoiceData.gstApplicable ? 'Yes' : 'No' },
    { label: 'GST Rate', value: invoiceData.gstRate != null ? `${invoiceData.gstRate}%` : '—' },
    { label: 'Place of Supply', value: invoiceData.placeOfSupplyState || invoiceData.place_of_supply_state || '—' },
    { label: 'Intra/Inter State', value: invoiceData.isInterstate || invoiceData.is_interstate ? 'Inter-State' : 'Intra-State', chip: true, chipBg: (invoiceData.isInterstate || invoiceData.is_interstate) ? '#f3e5f5' : '#e3f2fd', chipColor: (invoiceData.isInterstate || invoiceData.is_interstate) ? '#6a1b9a' : '#1565c0' },
    { label: 'Taxable Amount', value: invoiceData.taxableAmount != null ? `₹${Number(invoiceData.taxableAmount).toLocaleString('en-IN')}` : (invoiceData.subtotalAmount != null ? `₹${Number(invoiceData.subtotalAmount).toLocaleString('en-IN')}` : '—') },
    { label: 'CGST', value: invoiceData.cgstAmount != null ? `₹${Number(invoiceData.cgstAmount).toLocaleString('en-IN')}` : '—' },
    { label: 'SGST', value: invoiceData.sgstAmount != null ? `₹${Number(invoiceData.sgstAmount).toLocaleString('en-IN')}` : '—' },
    { label: 'IGST', value: invoiceData.igstAmount != null ? `₹${Number(invoiceData.igstAmount).toLocaleString('en-IN')}` : '—' },
    { label: 'Total Tax', value: invoiceData.totalTaxAmount != null ? `₹${Number(invoiceData.totalTaxAmount).toLocaleString('en-IN')}` : (invoiceData.gstAmount != null ? `₹${Number(invoiceData.gstAmount).toLocaleString('en-IN')}` : '—') },
    { label: 'Reverse Charge (RCM)', value: invoiceData.reverseChargeApplicable ? 'Yes' : 'No', chip: true, chipBg: invoiceData.reverseChargeApplicable ? '#fff3e0' : '#e8f5e9', chipColor: invoiceData.reverseChargeApplicable ? '#e65100' : '#2e7d32' },
    { label: 'Total Payable', value: invoiceData.totalAmount != null ? `₹${Number(invoiceData.totalAmount).toLocaleString('en-IN')}` : '—', bold: true },
  ];

  const ewayRows = [
    { label: 'E-Way Bill Number', value: invoiceData.ewayBillNumber || '—' },
    { label: 'E-Way Bill Document', value: invoiceData.ewayBillDocumentUrl ? 'Uploaded' : 'Not uploaded' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── Invoice Header ───────────────────────────────────── */}
      <SectionLabel>Invoice Information</SectionLabel>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        {headerRows.map((r) => (
          <Box key={r.label}>
            <FieldLabel>{r.label}</FieldLabel>
            {r.chip ? (
              <Chip
                label={r.value}
                size="small"
                sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.75rem', backgroundColor: r.chipBg, color: r.chipColor }}
              />
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, color: 'var(--color-grey-800)' }}>
                {r.value}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Divider />

      {/* ── Items Table ──────────────────────────────────────── */}
      <SectionLabel>Invoice Items ({items.length})</SectionLabel>
      {items.length > 0 ? (
        <Box sx={{ overflowX: 'auto', borderRadius: 2, border: '1px solid var(--color-grey-200)' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'var(--color-grey-50)' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Item Code</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Part Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Invoice No.</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Qty</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Unit Price</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Line Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it, idx) => (
                <TableRow key={it._id || it.id || idx}>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{it.itemCode || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{it.partName || it.part?.partName || '—'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {(() => {
                      const enriched = enrichRow({ vehicleId: it.vehicleId || it.vechileId, invoiceId: it.invoiceId }, invoiceMap, vehicleMap, vehicleByInvoiceMap);
                      const veh = enriched.vehicle;
                      if (veh) {
                        const regNo = veh.registration_number || veh.registrationNumber || '';
                        const make = veh.make || '';
                        const model = veh.model_name || veh.model || '';
                        return regNo || (make || model ? `${make} ${model}`.trim() : '') || it.vehicleCode || '—';
                      }
                      return it.vehicleCode || '—';
                    })()}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {(() => {
                      const enriched = enrichRow({ invoiceId: it.invoiceId }, invoiceMap, vehicleMap, vehicleByInvoiceMap);
                      return enriched.invoiceNumber || it.purchaseInvoiceNumber || '—';
                    })()}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.8rem' }}>{it.quantity || 0}</TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                    {it.unitPrice != null ? `₹${Number(it.unitPrice).toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                    {it.lineTotal != null ? `₹${Number(it.lineTotal).toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontStyle: 'italic' }}>
          No items added
        </Typography>
      )}

      <Divider />

      {/* ── GST Breakdown ────────────────────────────────────── */}
      <SectionLabel>GST & Totals</SectionLabel>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        {gstRows.map((r) => (
          <Box key={r.label}>
            <FieldLabel>{r.label}</FieldLabel>
            {r.chip ? (
              <Chip
                label={r.value}
                size="small"
                sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.75rem', backgroundColor: r.chipBg, color: r.chipColor }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  fontWeight: r.bold ? 700 : 500,
                  color: r.bold ? 'var(--color-grey-900)' : 'var(--color-grey-800)',
                  fontSize: r.bold ? '1rem' : undefined,
                }}
              >
                {r.value}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Divider />

      {/* ── E-Way Bill ───────────────────────────────────────── */}
      <SectionLabel>E-Way Bill</SectionLabel>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        {ewayRows.map((r) => (
          <Box key={r.label}>
            <FieldLabel>{r.label}</FieldLabel>
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, color: 'var(--color-grey-800)' }}>
              {r.value}
            </Typography>
          </Box>
        ))}
        {invoiceData.ewayBillDocumentUrl && (
          <Box>
            <a
              href={invoiceData.ewayBillDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1565c0', fontSize: '0.85rem' }}
            >
              View E-Way Bill Document
            </a>
          </Box>
        )}
      </Box>

      {invoiceData.createdAt && (
        <>
          <Divider />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <FieldLabel>Created At</FieldLabel>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-grey-600)' }}>
                {new Date(invoiceData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Typography>
            </Box>
            {invoiceData.updatedAt && (
              <Box>
                <FieldLabel>Updated At</FieldLabel>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-grey-600)' }}>
                  {new Date(invoiceData.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* ── Payments ─────────────────────────────────────────── */}
      {invoiceData.status === 'CONFIRMED' && (invoiceData.id || invoiceData._id) && (
        <>
          <Divider />
          <SectionLabel>Payments</SectionLabel>
          <InvoicePayments
            invoiceType="SALES"
            invoiceId={invoiceData.id || invoiceData._id}
            totalAmount={invoiceData.totalAmount}
          />
        </>
      )}
    </Box>
  );
};

SalesInvoiceDetailView.propTypes = {
  item: PropTypes.object,
};

export default SalesInvoiceDetailView;