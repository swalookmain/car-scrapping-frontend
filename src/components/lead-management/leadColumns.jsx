import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const STATUS_COLOR = {
  OPEN: { bg: '#eef2f6', color: '#4b5565' },
  IN_PROCESS: { bg: '#fff8e1', color: '#b45309' },
  CLOSED: { bg: '#e8f5e9', color: '#2e7d32' },
};

const ActionCell = ({ row, onView, onEdit }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
    <Tooltip title="View lead">
      <IconButton 
        size="small" 
        onClick={() => onView(row)}
        sx={{ color: '#1565c0', p: 0.5 }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="Edit lead">
      <IconButton 
        size="small" 
        onClick={() => onEdit(row)}
        sx={{ color: 'var(--color-secondary-main)', p: 0.5 }}
      >
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
    { 
      field: 'name', 
      headerName: 'Lead Name', 
      width: '16%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)' }}>
          {row.name}
        </Typography>
      )
    },
    { 
      field: 'mobileNumber', 
      headerName: 'Mobile', 
      width: '12%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontWeight: 500 }}>
          {row.mobileNumber}
        </Typography>
      )
    },
    { field: 'vehicleName', headerName: 'Vehicle Name', width: '16%' },
    { field: 'variant', headerName: 'Variant', width: '12%' },
    { field: 'location', headerName: 'Location', width: '12%' },
    {
      field: 'assignedToName',
      headerName: 'Assigned Staff',
      width: '14%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
          {row.assignedToName || 'Unassigned'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: '10%',
      render: (row) => {
        const scs = STATUS_COLOR[row.status] || STATUS_COLOR.OPEN;
        return (
          <Chip
            size="small"
            label={row.status || 'OPEN'}
            sx={{ 
              fontWeight: 600, 
              fontSize: '0.7rem', 
              backgroundColor: scs.bg, 
              color: scs.color,
              borderRadius: '6px'
            }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: '8%',
      render: (row) => <ActionCell row={row} onView={onView} onEdit={onEdit} />,
    },
  ];
}
