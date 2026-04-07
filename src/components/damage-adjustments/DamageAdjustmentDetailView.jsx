import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Divider } from '@mui/material';

const conditionColor = {
  GOOD: { bg: '#e8f5e9', color: '#2e7d32', label: 'Good' },
  DAMAGED: { bg: '#ffebee', color: '#c62828', label: 'Damaged' },
};

const SectionLabel = ({ children }) => (
  <Typography
    variant="subtitle2"
    sx={{ fontWeight: 600, color: 'var(--color-grey-700)', textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

const FieldLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

const DamageAdjustmentDetailView = ({ item }) => {
  if (!item) return null;

  const prevCond = conditionColor[item.previousCondition] || conditionColor.GOOD;
  const newCond = conditionColor[item.newCondition] || conditionColor.DAMAGED;

  const adjustmentRows = [
    // { label: 'Adjustment ID', value: (item._id || item.id || '—')?.toString()?.slice(-8)?.toUpperCase() },
    { label: 'Quantity Affected', value: item.quantityAffected ?? 0, color: '#c62828', bold: true },
    { label: 'Previous Condition', value: prevCond.label, chip: true, chipBg: prevCond.bg, chipColor: prevCond.color },
    { label: 'New Condition', value: newCond.label, chip: true, chipBg: newCond.bg, chipColor: newCond.color },
  ];

  const partRows = [
    { label: 'Part Name', value: item.part?.partName || item.partName || '—' },
    // { label: 'Item Code', value: item.part?.itemCode || item.itemCode || (item.partId || item.part?._id || item.part?.id || '—')?.toString()?.slice(-8)?.toUpperCase() },
    { label: 'Vehicle', value: (() => {
      const veh = item.part?.vehicle || item.vehicle || item.vehicleData || null;
      const regNo = veh?.registration_number || veh?.registrationNumber || item.registrationNumber || '';
      const make = veh?.make || '';
      const model = veh?.model_name || veh?.model || '';
      return regNo || (make || model ? `${make} ${model}`.trim() : '') || (item.part?.vechileId || item.part?.vehicleId || item.vehicleCode || '—')?.toString()?.slice(-8)?.toUpperCase();
    })() },
    { label: 'Invoice No.', value: (() => {
      const inv = item.part?.invoice || item.invoice || item.invoiceData || null;
      return inv?.invoiceNumber || item.part?.invoiceNumber || item.invoiceNumber || (item.part?.invoiceId || item.invoiceId || '—')?.toString()?.slice(-8)?.toUpperCase();
    })() },
    { label: 'Category', value: item.part?.partType || item.category || '—' },
  ];

  const metaRows = [
    { label: 'Recorded By', value: item.recordedBy?.name || item.recordedByName || '—' },
    {
      label: 'Date',
      value: item.createdAt
        ? new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Adjustment Details */}
      <SectionLabel>Adjustment Details</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {adjustmentRows.map(({ label, value, chip, chipBg, chipColor, color, bold }) => (
          <Box key={label}>
            <FieldLabel>{label}</FieldLabel>
            {chip ? (
              <Box sx={{ mt: 0.5 }}>
                <Chip label={value} size="small" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: chipBg, color: chipColor }} />
              </Box>
            ) : (
              <Typography variant="body1" sx={{ color: color || 'var(--color-grey-900)', mt: 0.5, fontWeight: bold ? 700 : 400 }}>
                {value}
              </Typography>
            )}
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Reason */}
      <SectionLabel>Reason</SectionLabel>
      <Box sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: '8px', border: '1px solid #ffe0b2' }}>
        <Typography variant="body2" sx={{ color: 'var(--color-grey-800)', lineHeight: 1.6 }}>
          {item.reason || 'No reason provided'}
        </Typography>
      </Box>

      {/* Part Information */}
      <SectionLabel>Part Information</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {partRows.map(({ label, value }) => (
          <Box key={label}>
            <FieldLabel>{label}</FieldLabel>
            <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.5, fontFamily: label.includes('Code') || label.includes('ID') ? 'monospace' : 'inherit' }}>
              {value}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Metadata */}
      <SectionLabel>Record Information</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {metaRows.map(({ label, value }) => (
          <Box key={label}>
            <FieldLabel>{label}</FieldLabel>
            <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.5 }}>
              {value}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

DamageAdjustmentDetailView.propTypes = {
  item: PropTypes.object,
};

export default DamageAdjustmentDetailView;
