import React from 'react';
import { Typography, Chip, IconButton, Tooltip, Box } from '@mui/material';
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

export const PurchaseGstCell = ({ row }) => (
  <Box>
    {row.gstApplicable ? (
      <>
        {(row.isInterstate || row.is_interstate) ? (
          <Typography variant="body2" sx={{ color: '#6a1b9a', fontSize: '0.7rem' }}>
            IGST: ₹{Number(row.igstAmount || 0).toLocaleString('en-IN')}
          </Typography>
        ) : (row.cgstAmount != null || row.sgstAmount != null) ? (
          <>
            <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '0.65rem' }}>
              C: ₹{Number(row.cgstAmount || 0).toLocaleString('en-IN')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#00695c', fontSize: '0.65rem' }}>
              S: ₹{Number(row.sgstAmount || 0).toLocaleString('en-IN')}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontSize: '0.75rem' }}>
            ₹{Number(row.gstAmount || 0).toLocaleString('en-IN')} ({row.gstRate || 0}%)
          </Typography>
        )}
        {row.reverseChargeApplicable && (
          <Typography variant="caption" sx={{ color: '#e65100', fontSize: '0.6rem' }}>RCM</Typography>
        )}
      </>
    ) : (
      <Typography variant="body2" sx={{ color: 'var(--color-grey-400)', fontSize: '0.75rem' }}>N/A</Typography>
    )}
  </Box>
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
  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
    <Tooltip title="View">
      <IconButton size="small" onClick={() => handleView(row)} aria-label="view" sx={{ color: '#1565c0', p: 0.5, minWidth: 'auto' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    
    {canPerform('invoice:edit') && row.status !== 'CONFIRMED' && (
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => handleEdit(row)} aria-label="edit" sx={{ color: 'var(--color-secondary-main)', p: 0.5, minWidth: 'auto' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}

    {canPerform('invoice:delete') && (
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => openDeleteConfirm(row)} aria-label="delete" sx={{ color: '#e53935', p: 0.5, minWidth: 'auto' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Box>
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
    { field: 'gst',            headerName: 'GST',    width: '10%', render: (row) => <PurchaseGstCell row={row} /> },
    { field: 'status', headerName: 'Status', width: '10%', render: (row) => <StatusCell row={row} /> },
    { field: 'createdBy', headerName: 'Created By', width: '12%', render: (row) => <CreatedByCell row={row} /> },
    { field: 'actions', headerName: 'Actions', width: '15%', render: (row) => <InvoiceActionsCell row={row} canPerform={canPerform} handleView={handleView} handleEdit={handleEdit} openDeleteConfirm={openDeleteConfirm} /> },
  ];
}
