import React from 'react';
import { Typography, Chip, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

// ── Status Chip Colors ─────────────────────────────────────────
export const invoiceStatusColor = {
  DRAFT: { bg: '#fff3e0', color: '#e65100', label: 'Draft' },
  CONFIRMED: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmed' },
};

// ── Cell components to avoid inline lambdas ────────────────
export const InvoiceNumberCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)' }}>
    {row.invoiceNumber || '—'}
  </Typography>
);

export const SellerNameCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
    {row.sellerName || '—'}
  </Typography>
);

export const PurchaseDateCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
    {row.purchaseDate ? new Date(row.purchaseDate).toLocaleDateString('en-GB') : '—'}
  </Typography>
);

export const SellerContactCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
    {(row.mobile || row.email) ? `${row.mobile || ''}${row.mobile && row.email ? ' • ' : ''}${row.email || ''}` : '—'}
  </Typography>
);

export const SellerTypeChip = ({ row }) => (
  <Chip
    label={row.sellerType || '—'}
    size="small"
    sx={{
      fontWeight: 600,
      fontSize: '0.75rem',
      backgroundColor: row.sellerType === 'DIRECT' ? '#e3f2fd' : row.sellerType === 'MSTC' ? '#fce4ec' : '#f3e5f5',
      color: row.sellerType === 'DIRECT' ? '#1565c0' : row.sellerType === 'MSTC' ? '#c62828' : '#6a1b9a',
    }}
  />
);

export const VehicleCell = ({ row }) => {
  const make = row.vehicle?.make || row.vehicleMake || '';
  const model = row.vehicle?.model_name || row.vehicle?.model || row.vehicleModel || '';
  return (
    <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
      {make || model ? `${make} ${model}`.trim() : '—'}
    </Typography>
  );
};

export const RegCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
    {row.vehicle?.registration_number || row.registrationNumber || '—'}
  </Typography>
);

export const AmountCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
    {row.purchaseAmount != null ? `₹${Number(row.purchaseAmount).toLocaleString('en-IN')}` : '—'}
  </Typography>
);

export const StatusCell = ({ row }) => {
  const st = invoiceStatusColor[row.status] || invoiceStatusColor.DRAFT;
  return <Chip label={st.label} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: st.bg, color: st.color }} />;
};

export const CreatedByCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', fontSize: '0.8rem' }}>
    {row.createdBy || row.createdByName || '\u2014'}
  </Typography>
);

export const InvoiceActionsCell = ({ row, canPerform, handleView, handleEdit, openDeleteConfirm }) => (
  <>
    <Tooltip title="View">
      <IconButton size="small" onClick={() => handleView(row)} aria-label="view" sx={{ color: '#1565c0' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    {canPerform('invoice:edit') && (
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => handleEdit(row)} aria-label="edit" sx={{ color: 'var(--color-secondary-main)' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
    {canPerform('invoice:delete') && (
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => openDeleteConfirm(row)} aria-label="delete" sx={{ color: '#e53935' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </>
);

/**
 * Returns the column definition array for InvoiceTable.
 * Accepts callbacks and derived flags from the parent component.
 */
export function getInvoiceColumns({ canPerform, handleView, handleEdit, openDeleteConfirm, showVehicle, showReg }) {
  return [
    { field: 'invoiceNumber', headerName: 'Invoice No.', width: '14%', render: (row) => <InvoiceNumberCell row={row} /> },
    { field: 'sellerName', headerName: 'Seller Name', width: '16%', render: (row) => <SellerNameCell row={row} /> },
    { field: 'purchaseDate', headerName: 'Purchase Date', width: '12%', render: (row) => <PurchaseDateCell row={row} /> },
    { field: 'sellerContact', headerName: 'Seller Contact', width: '14%', render: (row) => <SellerContactCell row={row} /> },
    { field: 'sellerType', headerName: 'Seller Type', width: '10%', render: (row) => <SellerTypeChip row={row} /> },
    ...(
      showVehicle
        ? [
            { field: 'vehicle', headerName: 'Vehicle (Make / Model)', width: '16%', render: (row) => <VehicleCell row={row} /> },
          ]
        : []
    ),
    ...(
      showReg
        ? [
            { field: 'registrationNumber', headerName: 'Reg. No.', width: '12%', render: (row) => <RegCell row={row} /> },
          ]
        : []
    ),
    { field: 'purchaseAmount', headerName: 'Amount', width: '10%', render: (row) => <AmountCell row={row} /> },
    { field: 'status', headerName: 'Status', width: '10%', render: (row) => <StatusCell row={row} /> },
    { field: 'createdBy', headerName: 'Created By', width: '12%', render: (row) => <CreatedByCell row={row} /> },
    { field: 'actions', headerName: 'Actions', width: '15%', render: (row) => <InvoiceActionsCell row={row} canPerform={canPerform} handleView={handleView} handleEdit={handleEdit} openDeleteConfirm={openDeleteConfirm} /> },
  ];
}
