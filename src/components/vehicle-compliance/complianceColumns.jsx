import React, { useCallback } from 'react';
import { Typography, Chip, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

// ── Status Chip Colors ────────────────────────────────────────
export const rtoStatusColor = {
  NOT_APPLIED: { bg: '#f5f5f5', color: '#616161', label: 'Not Applied' },
  APPLIED:     { bg: '#fff3e0', color: '#e65100', label: 'Applied' },
  APPROVED:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Approved' },
  REJECTED:    { bg: '#ffebee', color: '#c62828', label: 'Rejected' },
};

export const boolChip = (val, yesLabel = 'Yes', noLabel = 'No') => (
  <Chip
    label={val ? yesLabel : noLabel}
    size="small"
    sx={{
      fontWeight: 600,
      fontSize: '0.75rem',
      backgroundColor: val ? '#e8f5e9' : '#ffebee',
      color:           val ? '#2e7d32' : '#c62828',
    }}
  />
);

// ── Cell components (named to avoid inline lambdas) ───────────
export const VehicleIdCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)', fontSize: '0.8rem' }}>
    {row.vehicleId ? `${row.vehicleId.slice(0, 8)}...` : '—'}
  </Typography>
);

export const InvoiceIdCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontSize: '0.8rem' }}>
    {row.invoiceId ? `${row.invoiceId.slice(0, 8)}...` : '—'}
  </Typography>
);

export const CodInwardCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
    {row.codInwardNumber || '—'}
  </Typography>
);

export const RtoStatusCell = ({ row }) => {
  const st = rtoStatusColor[row.rtoStatus] || rtoStatusColor.NOT_APPLIED;
  return <Chip label={st.label} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: st.bg, color: st.color }} />;
};

export const RtoOfficeCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
    {row.rtoOffice || '—'}
  </Typography>
);

export const ActionsCell = ({ row, canPerform, handleView, handleEdit }) => {
  const handleViewClick = useCallback(() => handleView(row), [handleView, row]);
  const handleEditClick = useCallback(() => handleEdit(row), [handleEdit, row]);
  return (
    <>
      <Tooltip title="View Details">
        <IconButton size="small" onClick={handleViewClick} sx={{ color: '#1565c0' }}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canPerform('compliance:edit') && (
        <Tooltip title="Update RTO / Docs">
          <IconButton size="small" onClick={handleEditClick} sx={{ color: 'var(--color-secondary-main)' }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

/**
 * @param {{ canPerform: (perm: string) => boolean, handleView: (row: object) => void, handleEdit: (row: object) => void }} opts
 */
export const getComplianceColumns = ({ canPerform, handleView, handleEdit }) => [
  { field: 'vehicleId', headerName: 'Vehicle ID', width: '14%', render: (row) => <VehicleIdCell row={row} /> },
  { field: 'invoiceId', headerName: 'Invoice ID', width: '14%', render: (row) => <InvoiceIdCell row={row} /> },
  { field: 'codGenerated', headerName: 'COD', width: '8%', render: (row) => boolChip(row.codGenerated) },
  { field: 'codInwardNumber', headerName: 'COD Inward No.', width: '12%', render: (row) => <CodInwardCell row={row} /> },
  { field: 'cvsGenerated', headerName: 'CVS', width: '8%', render: (row) => boolChip(row.cvsGenerated) },
  { field: 'rtoStatus', headerName: 'RTO Status', width: '12%', render: (row) => <RtoStatusCell row={row} /> },
  { field: 'rtoOffice', headerName: 'RTO Office', width: '12%', render: (row) => <RtoOfficeCell row={row} /> },
  { field: 'actions', headerName: 'Actions', width: '14%', render: (row) => <ActionsCell row={row} canPerform={canPerform} handleView={handleView} handleEdit={handleEdit} /> },
];
