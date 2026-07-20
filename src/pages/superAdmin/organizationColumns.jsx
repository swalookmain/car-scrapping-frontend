import React, { useCallback } from 'react';
import { Switch, IconButton, Box, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { daysRemaining } from '../../utils/subscriptionDates';

// ── Named cell components ─────────────────────────────────────
export const OrgNameCell = ({ row }) => row.name || '—';

export const OrgActiveCell = ({ row, onToggle }) => {
  const handleToggle = useCallback(() => onToggle(row._id || row.id, row.isActive), [onToggle, row]);
  return (
    <Switch
      checked={Boolean(row.isActive)}
      onChange={handleToggle}
      sx={{
        transform: 'translateY(4px)',
        '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' },
      }}
    />
  );
};

export const OrgSubscriptionCell = ({ row }) => {
  const type = row.subscriptionType;
  const status = row.subscriptionStatus;
  const endDate = row.subscriptionEndDate;
  const remaining = daysRemaining(endDate);

  if (!type) {
    return <Chip label="No plan" size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 24 }} />;
  }

  const isExpired =
    status === 'EXPIRED' || (remaining != null && remaining < 0);

  if (isExpired) {
    return (
      <Chip
        label="EXPIRED"
        size="small"
        sx={{
          fontSize: '0.7rem',
          height: 24,
          fontWeight: 700,
          backgroundColor: '#ffebee',
          color: '#c62828',
        }}
      />
    );
  }

  if (type === 'TRIAL') {
    const daysLabel = remaining != null && remaining >= 0 ? ` · ${remaining}d left` : '';
    return (
      <Chip
        label={`TRIAL${daysLabel}`}
        size="small"
        sx={{
          fontSize: '0.7rem',
          height: 24,
          fontWeight: 700,
          backgroundColor: '#fff3e0',
          color: '#e65100',
        }}
      />
    );
  }

  return (
    <Chip
      label="PAID"
      size="small"
      sx={{
        fontSize: '0.7rem',
        height: 24,
        fontWeight: 700,
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
      }}
    />
  );
};

export const OrgCreatedAtCell = ({ row }) =>
  row.createdAt ? new Date(row.createdAt).toLocaleString() : '—';

export const OrgActionsCell = ({ row, onView, onEdit, onDelete }) => {
  const handleView = useCallback(() => onView(row), [onView, row]);
  const handleEdit = useCallback(() => onEdit(row), [onEdit, row]);
  const handleDelete = useCallback(() => onDelete(row), [onDelete, row]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
      <IconButton size="small" onClick={handleView} aria-label="view" sx={{ color: '#1565c0', p: 0.5, minWidth: 'auto' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleEdit} aria-label="edit" sx={{ color: 'var(--color-secondary-main)', p: 0.5, minWidth: 'auto' }}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleDelete} aria-label="delete" sx={{ color: '#e53935', p: 0.5, minWidth: 'auto' }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

// ── Column factory ─────────────────────────────────────────────
export default function getOrganizationColumns({ handleToggleActive, handleView, handleEdit, openDeleteConfirm }) {
  return [
    { field: 'name', headerName: 'Name', width: '28%', render: (row) => <OrgNameCell row={row} /> },
    { field: 'subscription', headerName: 'Subscription', width: '18%', render: (row) => <OrgSubscriptionCell row={row} /> },
    { field: 'isActive', headerName: 'Status', width: '12%', render: (row) => <OrgActiveCell row={row} onToggle={handleToggleActive} /> },
    { field: 'createdAt', headerName: 'Created At', width: '22%', render: (row) => <OrgCreatedAtCell row={row} /> },
    { field: 'actions', headerName: 'Actions', width: '20%', render: (row) => <OrgActionsCell row={row} onView={handleView} onEdit={handleEdit} onDelete={openDeleteConfirm} /> },
  ];
}
