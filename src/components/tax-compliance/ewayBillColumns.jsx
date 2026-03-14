import React from 'react';
import { Typography, Chip, IconButton, Tooltip, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// ── Transport Mode Colors ─────────────────────────────────────
export const transportModeColor = {
  ROAD: { bg: '#e3f2fd', color: '#1565c0', label: 'Road' },
  RAIL: { bg: '#f3e5f5', color: '#6a1b9a', label: 'Rail' },
  AIR: { bg: '#e0f7fa', color: '#00695c', label: 'Air' },
  SHIP: { bg: '#fff3e0', color: '#e65100', label: 'Ship' },
};

// ── Cell components ───────────────────────────────────────────
export const EwayBillNumberCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
    {row.ewayBillNumber || '—'}
  </Typography>
);

export const EwayInvoiceCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)', fontSize: '0.8rem' }}>
    {row.salesInvoice?.invoiceNumber || row.salesInvoiceId || '—'}
  </Typography>
);

export const EwayDateCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontSize: '0.8rem' }}>
    {row.ewayGeneratedDate
      ? new Date(row.ewayGeneratedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—'}
  </Typography>
);

export const EwayTransportModeChip = ({ row }) => {
  const tm = transportModeColor[row.transportMode] || { bg: '#f5f5f5', color: '#757575', label: row.transportMode || '—' };
  return (
    <Chip
      label={tm.label}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: tm.bg, color: tm.color }}
    />
  );
};

export const EwayVehicleCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--color-grey-700)', fontSize: '0.8rem' }}>
    {row.vehicleNumber || '—'}
  </Typography>
);

export const EwayDocumentCell = ({ row }) => (
  row.documentUrl ? (
    <Tooltip title="Open Document">
      <IconButton
        size="small"
        onClick={() => window.open(row.documentUrl, '_blank')}
        sx={{ color: '#1565c0', p: 0.5 }}
      >
        <OpenInNewIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : (
    <Typography variant="body2" sx={{ color: 'var(--color-grey-400)', fontSize: '0.8rem' }}>
      —
    </Typography>
  )
);

export const EwayActionsCell = ({ row, handleView }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
    <Tooltip title="View">
      <IconButton size="small" onClick={() => handleView(row)} sx={{ color: '#1565c0', p: 0.5 }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

// ── Column factory ─────────────────────────────────────────────
export function getEwayBillColumns({ handleView }) {
  return [
    { field: 'ewayBillNumber',  headerName: 'E-Way Bill No',  width: '16%', render: (row) => <EwayBillNumberCell row={row} /> },
    { field: 'salesInvoiceId',  headerName: 'Sales Invoice',  width: '16%', render: (row) => <EwayInvoiceCell row={row} /> },
    { field: 'ewayGeneratedDate', headerName: 'Generated Date', width: '14%', render: (row) => <EwayDateCell row={row} /> },
    { field: 'transportMode',   headerName: 'Transport',      width: '12%', render: (row) => <EwayTransportModeChip row={row} /> },
    { field: 'vehicleNumber',   headerName: 'Vehicle No',     width: '14%', render: (row) => <EwayVehicleCell row={row} /> },
    { field: 'documentUrl',     headerName: 'Document',       width: '10%', render: (row) => <EwayDocumentCell row={row} /> },
    { field: 'actions',         headerName: 'Actions',        width: '8%',  render: (row) => <EwayActionsCell row={row} handleView={handleView} /> },
  ];
}
