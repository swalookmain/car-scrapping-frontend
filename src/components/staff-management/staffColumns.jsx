import React, { useCallback } from 'react';
import { Typography, Switch, Tooltip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const NameCell = ({ row }) => (
  <Typography variant="body1" sx={{ fontWeight: 500, color: 'var(--color-grey-900)' }}>{row.name}</Typography>
);

export const PhoneCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>{row.phone}</Typography>
);

export const EmailCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>{row.email}</Typography>
);

export const StatusCell = ({ row, onToggle }) => {
  const handleToggle = useCallback(() => onToggle(row.id), [onToggle, row]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Tooltip title={row.status === 'Active' ? 'Active' : 'Inactive'}>
        <Switch
          checked={row.status === 'Active'}
          onChange={handleToggle}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'rgba(103,58,183,0.08)' }
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-switchTrack': {
              backgroundColor: 'var(--color-secondary-main)'
            }
          }}
        />
      </Tooltip>
    </div>
  );
};

export const ActionsCell = ({ row, canPerform, onView, onEdit, onDelete }) => {
  const handleView = useCallback(() => onView(row), [onView, row]);
  const handleEdit = useCallback(() => onEdit(row), [onEdit, row]);
  const handleDelete = useCallback(() => onDelete(row), [onDelete, row]);
  return (
    <>
      <IconButton size="small" onClick={handleView} aria-label="view" sx={{ color: '#1565c0' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
      {canPerform('staff:edit') && (
        <IconButton size="small" onClick={handleEdit} aria-label="edit" sx={{ color: 'var(--color-secondary-main)' }}>
          <EditIcon fontSize="small" />
        </IconButton>
      )}
      {canPerform('staff:delete') && (
        <IconButton size="small" onClick={handleDelete} aria-label="delete" sx={{ color: '#e53935' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </>
  );
};

export default function getStaffColumns({ canPerform, handleToggleActive, handleView, handleEdit, openDeleteConfirm }) {
  return [
    { field: 'name', headerName: 'Name', width: '25%', render: (row) => <NameCell row={row} /> },
    { field: 'phone', headerName: 'Phone Number', width: '20%', render: (row) => <PhoneCell row={row} /> },
    { field: 'email', headerName: 'Email ID', width: '30%', render: (row) => <EmailCell row={row} /> },
    { field: 'status', headerName: 'Is Active', width: '15%', render: (row) => <StatusCell row={row} onToggle={handleToggleActive} /> },
    { field: 'actions', headerName: 'Actions', width: '15%', render: (row) => <ActionsCell row={row} canPerform={canPerform} onView={handleView} onEdit={handleEdit} onDelete={openDeleteConfirm} /> },
  ];
}
