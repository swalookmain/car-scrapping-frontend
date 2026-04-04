import React from 'react';
import { Typography, Chip, IconButton, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import {
  calcAvailable,
  inventoryCategoryColor,
  inventoryConditionColor,
  inventoryStatusColor,
} from './inventoryColumnHelpers';

// ── Named cell components (canonical pattern) ────────────────
export const ItemCodeCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
    {row.itemCode || row._id?.slice(-8)?.toUpperCase() || row.id?.slice?.(-8)?.toUpperCase() || '—'}
  </Typography>
);

export const PartNameCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
    {row.partName || '—'}
  </Typography>
);

export const VehicleCodeCell = ({ row }) => {
  const veh = row.vehicle || row.vehicleData || null;
  const regNo = veh?.registration_number || veh?.registrationNumber || row.registrationNumber || '';
  const make = veh?.make || '';
  const model = veh?.model_name || veh?.model || '';
  const display = regNo || (make || model ? `${make} ${model}`.trim() : '');
  return (
    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
      {display || (row.vechileId || row.vehicleId || '—')?.toString()?.slice(-8)?.toUpperCase()}
    </Typography>
  );
};

export const InvoiceRefCell = ({ row }) => {
  const inv = row.invoice || row.invoiceData || null;
  const invoiceNumber = inv?.invoiceNumber || row.invoiceNumber || '';
  return (
    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
      {invoiceNumber || (row.invoiceId || '—')?.toString()?.slice(-8)?.toUpperCase()}
    </Typography>
  );
};

export const CategoryChip = ({ row }) => {
  const cc = inventoryCategoryColor[row.partType] || inventoryCategoryColor.OTHER;
  return <Chip label={row.partType || 'OTHER'} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: cc.bg, color: cc.color }} />;
};

export const OpeningCell   = ({ row }) => <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', textAlign: 'center' }}>{row.openingStock ?? 0}</Typography>;
export const ReceivedCell  = ({ row }) => <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500, textAlign: 'center' }}>{row.quantityReceived ?? 0}</Typography>;
export const IssuedCell    = ({ row }) => <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 500, textAlign: 'center' }}>{row.quantityIssued ?? 0}</Typography>;

export const AvailableCell = ({ row }) => {
  const avail = calcAvailable(row);
  return (
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: avail > 0 ? '#2e7d32' : avail === 0 ? 'var(--color-grey-500)' : '#c62828' }}>
      {avail}
    </Typography>
  );
};

export const InventoryConditionChip = ({ row }) => {
  const cond = inventoryConditionColor[row.condition] || inventoryConditionColor.GOOD;
  return <Chip label={cond.label} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: cond.bg, color: cond.color }} />;
};

export const InventoryStatusChip = ({ row }) => {
  const st = inventoryStatusColor[row.status] || inventoryStatusColor.AVAILABLE;
  return <Chip label={st.label} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: st.bg, color: st.color }} />;
};

export const InventoryCreatedByCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', fontSize: '0.8rem' }}>
    {row.createdBy || row.createdByName || '\u2014'}
  </Typography>
);

export const InventoryActionsCell = ({ row, canPerform, handleView, handleEdit, openDeleteConfirm, handleMarkDamaged }) => (
  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
    <Tooltip title="View">
      <IconButton size="small" onClick={() => handleView(row)} sx={{ color: '#1565c0', p: 0.5, minWidth: 'auto' }}><VisibilityIcon fontSize="small" /></IconButton>
    </Tooltip>
    {canPerform('inventory:edit') && row.condition !== 'DAMAGED' && calcAvailable(row) > 0 && (
      <Tooltip title="Mark as Damaged">
        <IconButton size="small" onClick={() => handleMarkDamaged(row)} sx={{ color: '#e65100', p: 0.5, minWidth: 'auto' }}><ReportProblemIcon fontSize="small" /></IconButton>
      </Tooltip>
    )}
    {canPerform('inventory:edit') && (
      <Tooltip title="Edit">
        <IconButton size="small" onClick={() => handleEdit(row)} sx={{ color: 'var(--color-secondary-main)', p: 0.5, minWidth: 'auto' }}><EditIcon fontSize="small" /></IconButton>
      </Tooltip>
    )}
    {canPerform('inventory:delete') && (
      <Tooltip title="Delete">
        <IconButton size="small" onClick={() => openDeleteConfirm(row)} sx={{ color: '#e53935', p: 0.5, minWidth: 'auto' }}><DeleteIcon fontSize="small" /></IconButton>
      </Tooltip>
    )}
  </Box>
);

