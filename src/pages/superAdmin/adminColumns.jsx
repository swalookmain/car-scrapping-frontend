import React, { useCallback } from 'react';
import { Switch, IconButton, Box, Typography, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const NameCell = ({ row }) => row.name || '—';
export const EmailCell = ({ row }) => row.email || '—';
export const RoleCell = ({ row }) => row.role || '—';

export const OrganizationCell = ({ row, orgs }) => (
  orgs.find((o) => (o._id || o.id) === row.organizationId)?.name || '—'
);

export const ActiveSwitchCell = ({ row, onToggle }) => {
  const handleToggle = useCallback(() => onToggle(row._id || row.id, row.isActive), [onToggle, row]);
  return (
    <Switch
      checked={Boolean(row.isActive)}
      onChange={handleToggle}
      sx={{ transform: 'translateY(4px)', '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' } }}
    />
  );
};

export const ActionsCell = ({ row, onView, onEdit, onDelete }) => {
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

export default function getAdminColumns({ orgs = [], handleToggleActiveUser, handleEdit, handleView, openDeleteConfirm }) {
  return [
    { field: 'name', headerName: 'Name', width: '25%', render: (row) => <NameCell row={row} /> },
    { field: 'email', headerName: 'Email', width: '30%', render: (row) => <EmailCell row={row} /> },
    { field: 'role', headerName: 'Role', width: '10%', render: (row) => <RoleCell row={row} /> },
    { field: 'organizationId', headerName: 'Organization', width: '20%', render: (row) => <OrganizationCell row={row} orgs={orgs} /> },
    { field: 'isActive', headerName: 'Active', width: '7%', render: (row) => <ActiveSwitchCell row={row} onToggle={handleToggleActiveUser} /> },
    { field: 'actions', headerName: 'Actions', width: '12%', render: (row) => <ActionsCell row={row} onView={handleView} onEdit={handleEdit} onDelete={openDeleteConfirm} /> },
  ];
}
