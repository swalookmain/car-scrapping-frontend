import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Divider, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import InvoicePayments from '../accounting/InvoicePayments';

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

  const st = statusColor[item.status] || statusColor.DRAFT;

  const headerRows = [
    { label: 'Invoice Number', value: item.invoiceNumber || '—' },
    { label: 'Status', value: st.label, chip: true, chipBg: st.bg, chipColor: st.color },
    { label: 'Invoice Date', value: item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { label: 'Buyer', value: item.buyer?.buyerName || item.buyerName || '—' },
    { label: 'Buyer Type', value: item.buyer?.buyerType || '—' },
    { label: 'Buyer GSTIN', value: item.buyer?.gstin || '—' },
  ];

  const gstRows = [
    { label: 'GST Applicable', value: item.gstApplicable ? 'Yes' : 'No' },
    { label: 'GST Rate', value: item.gstRate != null ? `${item.gstRate}%` : '—' },
    { label: 'Place of Supply', value: item.placeOfSupplyState || item.place_of_supply_state || '—' },
    { label: 'Intra/Inter State', value: item.isInterstate || item.is_interstate ? 'Inter-State' : 'Intra-State', chip: true, chipBg: (item.isInterstate || item.is_interstate) ? '#f3e5f5' : '#e3f2fd', chipColor: (item.isInterstate || item.is_interstate) ? '#6a1b9a' : '#1565c0' },
    { label: 'Taxable Amount', value: item.taxableAmount != null ? `₹${Number(item.taxableAmount).toLocaleString('en-IN')}` : (item.subtotalAmount != null ? `₹${Number(item.subtotalAmount).toLocaleString('en-IN')}` : '—') },
    { label: 'CGST', value: item.cgstAmount != null ? `₹${Number(item.cgstAmount).toLocaleString('en-IN')}` : '—' },
    { label: 'SGST', value: item.sgstAmount != null ? `₹${Number(item.sgstAmount).toLocaleString('en-IN')}` : '—' },
    { label: 'IGST', value: item.igstAmount != null ? `₹${Number(item.igstAmount).toLocaleString('en-IN')}` : '—' },
    { label: 'Total Tax', value: item.totalTaxAmount != null ? `₹${Number(item.totalTaxAmount).toLocaleString('en-IN')}` : (item.gstAmount != null ? `₹${Number(item.gstAmount).toLocaleString('en-IN')}` : '—') },
    { label: 'Reverse Charge (RCM)', value: item.reverseChargeApplicable ? 'Yes' : 'No', chip: true, chipBg: item.reverseChargeApplicable ? '#fff3e0' : '#e8f5e9', chipColor: item.reverseChargeApplicable ? '#e65100' : '#2e7d32' },
    { label: 'Total Payable', value: item.totalAmount != null ? `₹${Number(item.totalAmount).toLocaleString('en-IN')}` : '—', bold: true },
  ];

  const ewayRows = [
    { label: 'E-Way Bill Number', value: item.ewayBillNumber || '—' },
    { label: 'E-Way Bill Document', value: item.ewayBillDocumentUrl ? 'Uploaded' : 'Not uploaded' },
  ];

  const items = item.items || [];

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
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Vehicle Code</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Invoice Ref</TableCell>
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
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{it.vehicleCode || '—'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{it.purchaseInvoiceNumber || '—'}</TableCell>
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
        {item.ewayBillDocumentUrl && (
          <Box>
            <a
              href={item.ewayBillDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1565c0', fontSize: '0.85rem' }}
            >
              View E-Way Bill Document
            </a>
          </Box>
        )}
      </Box>

      {item.createdAt && (
        <>
          <Divider />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <FieldLabel>Created At</FieldLabel>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-grey-600)' }}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Typography>
            </Box>
            {item.updatedAt && (
              <Box>
                <FieldLabel>Updated At</FieldLabel>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-grey-600)' }}>
                  {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* ── Payments ─────────────────────────────────────────── */}
      {item.status === 'CONFIRMED' && item.id && (
        <>
          <Divider />
          <SectionLabel>Payments</SectionLabel>
          <InvoicePayments
            invoiceType="SALES"
            invoiceId={item.id || item._id}
            totalAmount={item.totalAmount}
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
