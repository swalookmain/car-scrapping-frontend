import React, { useCallback } from 'react';
import { Typography, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatDate, ActionChip, StatusChip, ActorRoleChip, IpDeviceCell } from './auditLogsHelpers';

// ── Named cell components ─────────────────────────────────────
export const ActionCell      = ({ row }) => <ActionChip value={row.action} />;
export const ActorRoleCell   = ({ row }) => <ActorRoleChip value={row.actorRole} />;
export const AuditStatusCell = ({ row }) => <StatusChip value={row.status} />;
export const IpCell          = ({ row }) => <IpDeviceCell row={row} />;

export const ActorIdCell = ({ row }) =>
  row.actorId ? (
    <Tooltip title={row.actorId} arrow>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.76rem', color: 'var(--color-grey-600)', cursor: 'default' }}>
        …{row.actorId.slice(-12)}
      </Typography>
    </Tooltip>
  ) : (
    <Typography variant="body2" sx={{ color: 'var(--color-grey-400)' }}>-</Typography>
  );

export const ResourceCell = ({ row }) => (
  <Tooltip title={row.resource} arrow>
    <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontFamily: 'monospace', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
      {row.resource || '-'}
    </Typography>
  </Tooltip>
);

export const DateTimeCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', fontSize: '0.78rem' }}>
    {formatDate(row.createdAt)}
  </Typography>
);

export const AuditActionsCell = ({ row, onView }) => {
  const handleView = useCallback(() => onView(row), [onView, row]);
  return (
    <Tooltip title="View Details">
      <IconButton size="small" onClick={handleView} sx={{ color: 'var(--color-secondary-main)' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};

// ── Column factory ─────────────────────────────────────────────
export function getAuditLogsColumns({ handleViewDetail }) {
  return [
    { field: 'action',    headerName: 'Action',     width: '16%', render: (row) => <ActionCell row={row} /> },
    { field: 'actorRole', headerName: 'Actor Role', width: '11%', render: (row) => <ActorRoleCell row={row} /> },
    { field: 'actorId',   headerName: 'Created By', width: '13%', render: (row) => <ActorIdCell row={row} /> },
    { field: 'resource',  headerName: 'Resource',   width: '20%', render: (row) => <ResourceCell row={row} /> },
    { field: 'status',    headerName: 'Status',     width: '9%',  render: (row) => <AuditStatusCell row={row} /> },
    { field: 'ip',        headerName: 'IP / Device',width: '14%', render: (row) => <IpCell row={row} /> },
    { field: 'createdAt', headerName: 'Date & Time',width: '14%', render: (row) => <DateTimeCell row={row} /> },
    { field: 'actions',   headerName: '',            width: '5%',  render: (row) => <AuditActionsCell row={row} onView={handleViewDetail} /> },
  ];
}
