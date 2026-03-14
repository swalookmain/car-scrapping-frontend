import React from 'react';
import { Typography, Chip, IconButton, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// ── Status Colors ──────────────────────────────────────────────
export const salesInvoiceStatusColor = {
  DRAFT: { bg: '#fff3e0', color: '#e65100', label: 'Draft' },
  CONFIRMED: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmed' },
  CANCELLED: { bg: '#ffebee', color: '#c62828', label: 'Cancelled' },
};

// ── Named cell components ─────────────────────────────────────
export const SalesInvoiceNumberCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
    {row.invoiceNumber || '—'}
  </Typography>
);

export const SalesBuyerCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
    {row.buyer?.buyerName || row.buyerName || '—'}
  </Typography>
);

export const SalesDateCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontSize: '0.8rem' }}>
    {row.invoiceDate
      ? new Date(row.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—'}
  </Typography>
);

export const SalesSubtotalCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)', textAlign: 'right' }}>
    {row.subtotalAmount != null ? `₹${Number(row.subtotalAmount).toLocaleString('en-IN')}` : '—'}
  </Typography>
);

export const SalesGstCell = ({ row }) => (
  <Box>
    {row.gstApplicable ? (
      <>
        {(row.isInterstate || row.is_interstate) ? (
          <Typography variant="body2" sx={{ color: '#6a1b9a', fontSize: '0.8rem', textAlign: 'right' }}>
            IGST: ₹{Number(row.igstAmount || 0).toLocaleString('en-IN')}
          </Typography>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '0.7rem', textAlign: 'right' }}>
              C: ₹{Number(row.cgstAmount || 0).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#00695c', fontSize: '0.7rem', textAlign: 'right' }}>
              S: ₹{Number(row.sgstAmount || 0).toLocaleString('en-IN')}
            </Typography>
          </>
        )}
        {row.reverseChargeApplicable && (
          <Typography variant="caption" sx={{ color: '#e65100', fontSize: '0.65rem' }}>
            RCM
          </Typography>
        )}
      </>
    ) : (
      <Typography variant="body2" sx={{ color: 'var(--color-grey-400)', fontSize: '0.8rem', textAlign: 'right' }}>
        N/A
      </Typography>
    )}
  </Box>
);

export const SalesTotalCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)', textAlign: 'right' }}>
    {row.totalAmount != null ? `₹${Number(row.totalAmount).toLocaleString('en-IN')}` : '—'}
  </Typography>
);

export const SalesStatusChip = ({ row }) => {
  const st = salesInvoiceStatusColor[row.status] || salesInvoiceStatusColor.DRAFT;
  return (
    <Chip
      label={st.label}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: st.bg, color: st.color }}
    />
  );
};

export const SalesItemCountCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', textAlign: 'center' }}>
    {row.items?.length || 0}
  </Typography>
);

export const SalesActionsCell = ({ row, canPerform, handleView, handleEdit, handleConfirm, handleCancel }) => (
  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
    <Tooltip title="View">
      <IconButton size="small" onClick={() => handleView(row)} sx={{ color: '#1565c0', p: 0.5, minWidth: 'auto' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    {row.status === 'DRAFT' && canPerform('salesInvoice:edit') && (
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: 'var(--color-secondary-main)', p: 0.5, minWidth: 'auto' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
    {row.status === 'DRAFT' && canPerform('salesInvoice:confirm') && (
      <Tooltip title="Confirm Invoice">
        <IconButton size="small" onClick={() => handleConfirm(row)} sx={{ color: '#2e7d32', p: 0.5, minWidth: 'auto' }}>
          <CheckCircleIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
    {row.status === 'CONFIRMED' && canPerform('salesInvoice:cancel') && (
      <Tooltip title="Cancel Invoice">
        <IconButton size="small" onClick={() => handleCancel(row)} sx={{ color: '#e53935', p: 0.5, minWidth: 'auto' }}>
          <CancelIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

// ── Column factory ─────────────────────────────────────────────
export function getSalesInvoiceColumns({ canPerform, handleView, handleEdit, handleConfirm, handleCancel }) {
  return [
    { field: 'invoiceNumber', headerName: 'Invoice No',  width: '14%', render: (row) => <SalesInvoiceNumberCell row={row} /> },
    { field: 'buyerName',     headerName: 'Buyer',       width: '15%', render: (row) => <SalesBuyerCell row={row} /> },
    { field: 'invoiceDate',   headerName: 'Date',        width: '11%', render: (row) => <SalesDateCell row={row} /> },
    { field: 'items',         headerName: 'Items',       width: '7%',  render: (row) => <SalesItemCountCell row={row} /> },
    { field: 'subtotalAmount',headerName: 'Subtotal',    width: '12%', render: (row) => <SalesSubtotalCell row={row} /> },
    { field: 'gstAmount',     headerName: 'GST',         width: '12%', render: (row) => <SalesGstCell row={row} /> },
    { field: 'totalAmount',   headerName: 'Total',       width: '12%', render: (row) => <SalesTotalCell row={row} /> },
    { field: 'status',        headerName: 'Status',      width: '10%', render: (row) => <SalesStatusChip row={row} /> },
    { field: 'actions',       headerName: 'Actions',     width: '10%', render: (row) => <SalesActionsCell row={row} canPerform={canPerform} handleView={handleView} handleEdit={handleEdit} handleConfirm={handleConfirm} handleCancel={handleCancel} /> },
  ];
}
