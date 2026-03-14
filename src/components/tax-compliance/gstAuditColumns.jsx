import React from 'react';
import { Typography, Chip, Box } from '@mui/material';

// ── Event Type Colors ──────────────────────────────────────────
export const gstEventColor = {
  GST_CALCULATED: { bg: '#e3f2fd', color: '#1565c0', label: 'GST Calculated' },
  RCM_APPLIED:    { bg: '#fff3e0', color: '#e65100', label: 'RCM Applied' },
  EWAY_ADDED:     { bg: '#e8f5e9', color: '#2e7d32', label: 'E-Way Added' },
};

export const invoiceTypeColor = {
  PURCHASE: { bg: '#f3e5f5', color: '#6a1b9a', label: 'Purchase' },
  SALES:    { bg: '#e0f7fa', color: '#00695c', label: 'Sales' },
};

// ── Cell components ───────────────────────────────────────────
export const GstAuditEventCell = ({ row }) => {
  const ev = gstEventColor[row.eventType] || { bg: '#f5f5f5', color: '#757575', label: row.eventType || '—' };
  return (
    <Chip
      label={ev.label}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: ev.bg, color: ev.color }}
    />
  );
};

export const GstAuditInvoiceTypeCell = ({ row }) => {
  const it = invoiceTypeColor[row.invoiceType] || { bg: '#f5f5f5', color: '#757575', label: row.invoiceType || '—' };
  return (
    <Chip
      label={it.label}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: it.bg, color: it.color }}
    />
  );
};

export const GstAuditInvoiceIdCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--color-grey-700)', fontSize: '0.75rem' }}>
    {row.invoiceId ? (row.invoiceId.length > 12 ? `...${row.invoiceId.slice(-8)}` : row.invoiceId) : '—'}
  </Typography>
);

export const GstAuditDateCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontSize: '0.8rem' }}>
    {row.createdAt
      ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—'}
  </Typography>
);

export const GstAuditMetadataCell = ({ row }) => {
  const meta = row.metadata;
  if (!meta) return <Typography variant="body2" sx={{ color: 'var(--color-grey-400)' }}>—</Typography>;
  const display = typeof meta === 'string' ? meta : JSON.stringify(meta, null, 0);
  return (
    <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
      <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'var(--color-grey-600)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {display.length > 80 ? display.slice(0, 80) + '...' : display}
      </Typography>
    </Box>
  );
};

// ── Column factory ─────────────────────────────────────────────
export function getGstAuditColumns() {
  return [
    { field: 'eventType',   headerName: 'Event',         width: '18%', render: (row) => <GstAuditEventCell row={row} /> },
    { field: 'invoiceType', headerName: 'Invoice Type',  width: '12%', render: (row) => <GstAuditInvoiceTypeCell row={row} /> },
    { field: 'invoiceId',   headerName: 'Invoice ID',    width: '14%', render: (row) => <GstAuditInvoiceIdCell row={row} /> },
    { field: 'metadata',    headerName: 'Details',       width: '30%', render: (row) => <GstAuditMetadataCell row={row} /> },
    { field: 'createdAt',   headerName: 'Date',          width: '16%', render: (row) => <GstAuditDateCell row={row} /> },
  ];
}
