import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

const STATUS_COLOR = {
  OPEN: { bg: '#eef2f6', color: '#4b5565' },
  IN_PROCESS: { bg: '#fff8e1', color: '#b45309' },
  CLOSED: { bg: '#e8f5e9', color: '#2e7d32' },
  CANCELLED: { bg: '#ffebee', color: '#c62828' },
};

const ActionCell = ({ row, onView, onEdit, onAddDetails, onAssign, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); onView(row); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(row); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onAddDetails(row); }}>
          <ListItemIcon><PlaylistAddIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Add Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onAssign(row); }}>
          <ListItemIcon><AssignmentIndIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Assign</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => { setAnchorEl(null); onDelete(row); }}
          sx={{ color: '#d32f2f' }}
        >
          <ListItemIcon sx={{ color: '#d32f2f' }}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

ActionCell.propTypes = {
  row: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onAddDetails: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default function getLeadColumns({ onView, onEdit, onAddDetails, onAssign, onDelete }) {
  return [
    {
      field: 'name',
      headerName: 'Lead Name',
      width: '16%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)' }}>
          {row.name}
        </Typography>
      ),
    },
    { field: 'mobileNumber', headerName: 'Mobile', width: '12%' },
    { field: 'ownerName', headerName: 'Owner', width: '12%' },
    { field: 'vehicleName', headerName: 'Make/Company', width: '14%' },
    { field: 'variant', headerName: 'Model', width: '10%' },
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
      render: (row) => {
        const scs = STATUS_COLOR[row.status] || STATUS_COLOR.OPEN;
        return (
          <Chip
            size="small"
            label={row.status || 'OPEN'}
            sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: scs.bg, color: scs.color }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: '8%',
      render: (row) => (
        <ActionCell
          row={row}
          onView={onView}
          onEdit={onEdit}
          onAddDetails={onAddDetails}
          onAssign={onAssign}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
