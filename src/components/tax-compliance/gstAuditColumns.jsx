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

export const GstAuditInvoiceIdCell = ({ row }) => {
  const inv = row.invoice || row.invoiceData || null;
  const invoiceNumber = inv?.invoiceNumber || row.invoiceNumber || '';
  return (
    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--color-grey-700)', fontSize: '0.75rem' }}>
      {invoiceNumber || (row.invoiceId ? (row.invoiceId.length > 12 ? `...${row.invoiceId.slice(-8)}` : row.invoiceId) : '—')}
    </Typography>
  );
};

export const GstAuditDateCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontSize: '0.8rem' }}>
    {row.createdAt
      ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—'}
  </Typography>
);

export const GstAuditMetadataCell = ({ row }) => {
  const metaRaw = row.metadata ?? row.details ?? row.data ?? null;
  if (!metaRaw) return <Typography variant="body2" sx={{ color: 'var(--color-grey-400)' }}>—</Typography>;

  let metaObj = null;
  if (typeof metaRaw === 'string') {
    try {
      metaObj = JSON.parse(metaRaw);
    } catch (e) {
      // treat as plain string if JSON parse fails
      metaObj = metaRaw;
    }
  } else {
    metaObj = metaRaw;
  }

  if (typeof metaObj === 'string') {
    const display = metaObj;
    return (
      <Box sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'var(--color-grey-600)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          {display.length > 120 ? display.slice(0, 120) + '...' : display}
        </Typography>
      </Box>
    );
  }

  // If it's an object/array, render key: value pairs on separate lines
  const entries = Array.isArray(metaObj) ? metaObj.map((v, i) => [i, v]) : Object.entries(metaObj || {});

  return (
    <Box sx={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {entries.slice(0, 8).map(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return (
          <Box key={k} sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, width: 110 }}>
              {String(k)}:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'var(--color-grey-600)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {val.length > 120 ? val.slice(0, 120) + '...' : val}
            </Typography>
          </Box>
        );
      })}
      {entries.length > 8 && (
        <Typography variant="caption" sx={{ color: 'var(--color-grey-400)' }}>+{entries.length - 8} more</Typography>
      )}
    </Box>
  );
};

// ── Column factory ─────────────────────────────────────────────
export function getGstAuditColumns() {
  return [
    { field: 'eventType',   headerName: 'Event',         width: '18%', render: (row) => <GstAuditEventCell row={row} /> },
    { field: 'invoiceType', headerName: 'Invoice Type',  width: '12%', render: (row) => <GstAuditInvoiceTypeCell row={row} /> },
    { field: 'invoiceId',   headerName: 'Invoice No.',   width: '14%', render: (row) => <GstAuditInvoiceIdCell row={row} /> },
    { field: 'metadata',    headerName: 'Details',       width: '30%', render: (row) => <GstAuditMetadataCell row={row} /> },
    { field: 'createdAt',   headerName: 'Date',          width: '16%', render: (row) => <GstAuditDateCell row={row} /> },
  ];
}
