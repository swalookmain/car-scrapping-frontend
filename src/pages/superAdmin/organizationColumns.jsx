import React, { useCallback } from 'react';
import { Switch, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

// ── Named cell components ─────────────────────────────────────
export const OrgNameCell = ({ row }) => row.name || '—';

export const OrgActiveCell = ({ row, onToggle }) => {
  const handleToggle = useCallback(() => onToggle(row._id || row.id, row.isActive), [onToggle, row]);
  return (
    <Switch
      checked={Boolean(row.isActive)}
      onChange={handleToggle}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' },
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
    <>
      <IconButton size="small" onClick={handleView} aria-label="view" sx={{ color: '#1565c0' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleEdit} aria-label="edit" sx={{ color: 'var(--color-secondary-main)' }}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleDelete} aria-label="delete" sx={{ color: '#e53935' }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </>
  );
};

// ── Column factory ─────────────────────────────────────────────
export default function getOrganizationColumns({ handleToggleActive, handleView, handleEdit, openDeleteConfirm }) {
  return [
    { field: 'name',      headerName: 'Name',       width: '35%', render: (row) => <OrgNameCell row={row} /> },
    { field: 'isActive',  headerName: 'Status',     width: '15%', render: (row) => <OrgActiveCell row={row} onToggle={handleToggleActive} /> },
    { field: 'createdAt', headerName: 'Created At', width: '30%', render: (row) => <OrgCreatedAtCell row={row} /> },
    { field: 'actions',   headerName: 'Actions',    width: '20%', render: (row) => <OrgActionsCell row={row} onView={handleView} onEdit={handleEdit} onDelete={openDeleteConfirm} /> },
  ];
}
