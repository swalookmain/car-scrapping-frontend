import React from 'react';
import { Typography, Chip, IconButton, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

// ── Buyer Type Colors ─────────────────────────────────────────
export const buyerTypeColor = {
  COMPANY: { bg: '#e3f2fd', color: '#1565c0', label: 'Company' },
  INDIVIDUAL: { bg: '#f3e5f5', color: '#6a1b9a', label: 'Individual' },
};

// ── Named cell components ─────────────────────────────────────
export const BuyerNameCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)' }}>
    {row.buyerName || '—'}
  </Typography>
);

export const BuyerTypeChip = ({ row }) => {
  const bt = buyerTypeColor[row.buyerType] || buyerTypeColor.INDIVIDUAL;
  return (
    <Chip
      label={bt.label}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: bt.bg, color: bt.color }}
    />
  );
};

export const GstinCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-700)' }}>
    {row.gstin || '—'}
  </Typography>
);

export const MobileCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
    {row.mobile || '—'}
  </Typography>
);

export const EmailCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', fontSize: '0.8rem' }}>
    {row.email || '—'}
  </Typography>
);

export const AddressCell = ({ row }) => (
  <Typography
    variant="body2"
    sx={{ color: 'var(--color-grey-600)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}
    title={row.address}
  >
    {row.address || '—'}
  </Typography>
);

export const BuyerActionsCell = ({ row, canPerform, handleView, handleEdit, openDeleteConfirm }) => (
  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
    <Tooltip title="View">
      <IconButton size="small" onClick={() => handleView(row)} sx={{ color: '#1565c0', p: 0.5, minWidth: 'auto' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    {canPerform('buyer:edit') && (
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: 'var(--color-secondary-main)', p: 0.5, minWidth: 'auto' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
    {canPerform('buyer:delete') && (
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => openDeleteConfirm(row)} sx={{ color: '#e53935', p: 0.5, minWidth: 'auto' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

// ── Column factory ─────────────────────────────────────────────
export function getBuyerColumns({ canPerform, handleView, handleEdit, openDeleteConfirm }) {
  return [
    { field: 'buyerName',  headerName: 'Buyer Name',  width: '20%', render: (row) => <BuyerNameCell row={row} /> },
    { field: 'buyerType',  headerName: 'Type',        width: '12%', render: (row) => <BuyerTypeChip row={row} /> },
    { field: 'gstin',      headerName: 'GSTIN',       width: '18%', render: (row) => <GstinCell row={row} /> },
    { field: 'mobile',     headerName: 'Mobile',      width: '14%', render: (row) => <MobileCell row={row} /> },
    { field: 'email',      headerName: 'Email',       width: '16%', render: (row) => <EmailCell row={row} /> },
    { field: 'address',    headerName: 'Address',     width: '15%', render: (row) => <AddressCell row={row} /> },
    { field: 'actions',    headerName: 'Actions',     width: '10%', render: (row) => <BuyerActionsCell row={row} canPerform={canPerform} handleView={handleView} handleEdit={handleEdit} openDeleteConfirm={openDeleteConfirm} /> },
  ];
}
