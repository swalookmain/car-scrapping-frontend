import React from 'react';
import { Typography, Chip, IconButton, Tooltip, Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

// ── Condition Colors ───────────────────────────────────────────
export const conditionColor = {
  GOOD: { bg: '#e8f5e9', color: '#2e7d32', label: 'Good' },
  DAMAGED: { bg: '#ffebee', color: '#c62828', label: 'Damaged' },
};

// ── Named Cell Components ──────────────────────────────────────
export const DamageIdCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
    {(row._id || row.id || '—')?.toString()?.slice(-8)?.toUpperCase()}
  </Typography>
);

export const DamagePartNameCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
    {row.part?.partName || row.partName || '—'}
  </Typography>
);

export const DamageItemCodeCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
    {row.part?.itemCode || row.itemCode || (row.partId || row.part?._id || row.part?.id || '—')?.toString()?.slice(-8)?.toUpperCase()}
  </Typography>
);

export const DamageVehicleCodeCell = ({ row }) => {
  const veh = row.part?.vehicle || row.vehicle || row.vehicleData || null;
  const regNo = veh?.registration_number || veh?.registrationNumber || row.registrationNumber || '';
  const make = veh?.make || '';
  const model = veh?.model_name || veh?.model || '';
  const display = regNo || (make || model ? `${make} ${model}`.trim() : '');
  return (
    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
      {display || (row.part?.vechileId || row.part?.vehicleId || row.vehicleCode || '—')?.toString()?.slice(-8)?.toUpperCase()}
    </Typography>
  );
};

export const DamageInvoiceRefCell = ({ row }) => {
  const inv = row.part?.invoice || row.invoice || row.invoiceData || null;
  const invoiceNumber = inv?.invoiceNumber || row.part?.invoiceNumber || row.invoiceNumber || '';
  return (
    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
      {invoiceNumber || (row.part?.invoiceId || row.invoiceId || '—')?.toString()?.slice(-8)?.toUpperCase()}
    </Typography>
  );
};

export const DamageQuantityCell = ({ row }) => (
  <Typography variant="body2" sx={{ fontWeight: 600, color: '#c62828', textAlign: 'center' }}>
    {row.quantityAffected ?? 0}
  </Typography>
);

export const DamagePreviousConditionChip = ({ row }) => {
  const cond = conditionColor[row.previousCondition] || conditionColor.GOOD;
  return <Chip label={cond.label} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: cond.bg, color: cond.color }} />;
};

export const DamageNewConditionChip = ({ row }) => {
  const cond = conditionColor[row.newCondition] || conditionColor.DAMAGED;
  return <Chip label={cond.label} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: cond.bg, color: cond.color }} />;
};

export const DamageReasonCell = ({ row }) => (
  <Tooltip title={row.reason || ''} placement="top">
    <Typography
      variant="body2"
      sx={{
        color: 'var(--color-grey-700)',
        fontSize: '0.8rem',
        maxWidth: 200,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {row.reason || '—'}
    </Typography>
  </Tooltip>
);

export const DamageDateCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-700)', fontSize: '0.8rem' }}>
    {row.createdAt
      ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—'}
  </Typography>
);

export const DamageRecordedByCell = ({ row }) => (
  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', fontSize: '0.8rem' }}>
    {row.recordedBy?.name || row.recordedByName || '—'}
  </Typography>
);

export const DamageActionsCell = ({ row, handleView }) => (
  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
    <Tooltip title="View Details">
      <IconButton size="small" onClick={() => handleView(row)} sx={{ color: '#1565c0', p: 0.5, minWidth: 'auto' }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

// ── Column Factory ─────────────────────────────────────────────
export function getDamageAdjustmentColumns({ handleView }) {
  return [
    // { field: 'id',                headerName: 'Adj. ID',         width: '9%',  render: (row) => <DamageIdCell row={row} /> },
    { field: 'partName',          headerName: 'Part Name',       width: '13%', render: (row) => <DamagePartNameCell row={row} /> },
    { field: 'itemCode',          headerName: 'Item Code',       width: '9%',  render: (row) => <DamageItemCodeCell row={row} /> },
    { field: 'vehicleCode',       headerName: 'Vehicle',         width: '9%',  render: (row) => <DamageVehicleCodeCell row={row} /> },
    { field: 'invoiceRef',        headerName: 'Invoice',         width: '9%',  render: (row) => <DamageInvoiceRefCell row={row} /> },
    { field: 'quantityAffected',  headerName: 'Qty',             width: '6%',  render: (row) => <DamageQuantityCell row={row} /> },
    { field: 'previousCondition', headerName: 'From',            width: '8%',  render: (row) => <DamagePreviousConditionChip row={row} /> },
    { field: 'newCondition',      headerName: 'To',              width: '8%',  render: (row) => <DamageNewConditionChip row={row} /> },
    { field: 'reason',            headerName: 'Reason',          width: '14%', render: (row) => <DamageReasonCell row={row} /> },
    { field: 'createdAt',         headerName: 'Date',            width: '9%',  render: (row) => <DamageDateCell row={row} /> },
    { field: 'actions',           headerName: 'Actions',         width: '6%',  render: (row) => <DamageActionsCell row={row} handleView={handleView} /> },
  ];
}
