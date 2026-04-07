import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const STATUS_COLOR = {
  OPEN: 'default',
  IN_PROCESS: 'warning',
  CLOSED: 'success',
};

const ActionCell = ({ row, onView, onEdit }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
    <Tooltip title="View lead">
      <IconButton size="small" onClick={() => onView(row)}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Edit lead">
      <IconButton size="small" onClick={() => onEdit(row)}>
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default function getLeadColumns({ onView, onEdit }) {
  return [
    { field: 'name', headerName: 'Lead Name', width: '16%' },
    { field: 'mobileNumber', headerName: 'Mobile', width: '12%' },
    { field: 'vehicleName', headerName: 'Vehicle', width: '16%' },
    { field: 'variant', headerName: 'Variant', width: '12%' },
    { field: 'location', headerName: 'Location', width: '12%' },
    {
      field: 'assignedToName',
      headerName: 'Assigned Staff',
      width: '14%',
      render: (row) => row.assignedToName || 'Unassigned',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: '10%',
      render: (row) => (
        <Chip
          size="small"
          label={row.status || 'OPEN'}
          color={STATUS_COLOR[row.status] || 'default'}
          variant={row.status === 'OPEN' ? 'outlined' : 'filled'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: '8%',
      render: (row) => <ActionCell row={row} onView={onView} onEdit={onEdit} />,
    },
  ];
}
