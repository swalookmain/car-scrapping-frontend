import React from 'react';
import { Typography, Chip, IconButton, Tooltip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

// ── Status / Condition / Category Colors ──────────────────────
export const inventoryStatusColor = {
  AVAILABLE: { bg: '#e8f5e9', color: '#2e7d32', label: 'Available' },
  PARTIAL_SOLD: { bg: '#fff3e0', color: '#e65100', label: 'Partial Sold' },
  SOLD_OUT: { bg: '#ffebee', color: '#c62828', label: 'Sold Out' },
  DAMAGE_ONLY: { bg: '#fce4ec', color: '#ad1457', label: 'Damaged' },
};

export const inventoryConditionColor = {
  GOOD: { bg: '#e8f5e9', color: '#2e7d32', label: 'Good' },
  DAMAGED: { bg: '#ffebee', color: '#c62828', label: 'Damaged' },
};

export const inventoryCategoryColor = {
  ENGINE: { bg: '#e3f2fd', color: '#1565c0' },
  TRANSMISSION: { bg: '#f3e5f5', color: '#6a1b9a' },
  BODY: { bg: '#fff3e0', color: '#e65100' },
  METAL: { bg: '#e0f2f1', color: '#00695c' },
  PLASTIC: { bg: '#fce4ec', color: '#ad1457' },
  ELECTRICAL: { bg: '#fff9c4', color: '#f57f17' },
  OTHER: { bg: '#f5f5f5', color: '#616161' },
};

/** Computes available quantity: opening + received - issued */
export function calcAvailable(row) {
  const opening = Number(row.openingStock) || 0;
  const received = Number(row.quantityReceived) || 0;
  const issued = Number(row.quantityIssued) || 0;
  return opening + received - issued;
}

// ── Named cell components (canonical pattern) ────────────────
export const ItemCodeCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
    {row._id?.slice(-8)?.toUpperCase() || row.id?.slice?.(-8)?.toUpperCase() || '—'}
  </Typography>
);

export const PartNameCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
    {row.partName || '—'}
  </Typography>
);

export const VehicleCodeCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
    {(row.vechileId || row.vehicleId || '—')?.toString()?.slice(-8)?.toUpperCase()}
  </Typography>
);

export const InvoiceRefCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
    {(row.invoiceId || '—')?.toString()?.slice(-8)?.toUpperCase()}
  </Typography>
);

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

// ── Column factory ─────────────────────────────────────────────
export function getInventoryColumns({ canPerform, handleView, handleEdit, openDeleteConfirm, handleMarkDamaged }) {
  return [
    { field: 'itemCode',         headerName: 'Item Code',    width: '9%',  render: (row) => <ItemCodeCell row={row} /> },
    { field: 'partName',         headerName: 'Part Name',    width: '13%', render: (row) => <PartNameCell row={row} /> },
    { field: 'vehicleCode',      headerName: 'Vehicle Code', width: '9%',  render: (row) => <VehicleCodeCell row={row} /> },
    { field: 'invoiceId',        headerName: 'Invoice',      width: '9%',  render: (row) => <InvoiceRefCell row={row} /> },
    { field: 'partType',         headerName: 'Category',     width: '9%',  render: (row) => <CategoryChip row={row} /> },
    { field: 'condition',        headerName: 'Condition',    width: '8%',  render: (row) => <InventoryConditionChip row={row} /> },
    { field: 'openingStock',     headerName: 'Opening',      width: '6%',  render: (row) => <OpeningCell row={row} /> },
    { field: 'quantityReceived', headerName: 'Received',     width: '6%',  render: (row) => <ReceivedCell row={row} /> },
    { field: 'quantityIssued',   headerName: 'Issued',       width: '6%',  render: (row) => <IssuedCell row={row} /> },
    { field: 'available',        headerName: 'Available',    width: '6%',  render: (row) => <AvailableCell row={row} /> },
    { field: 'status',           headerName: 'Status',       width: '9%',  render: (row) => <InventoryStatusChip row={row} /> },
    { field: 'actions',          headerName: 'Actions',      width: '10%', render: (row) => <InventoryActionsCell row={row} canPerform={canPerform} handleView={handleView} handleEdit={handleEdit} openDeleteConfirm={openDeleteConfirm} handleMarkDamaged={handleMarkDamaged} /> },
  ];
}
