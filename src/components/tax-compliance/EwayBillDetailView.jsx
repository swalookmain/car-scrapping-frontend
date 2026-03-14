import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Divider } from '@mui/material';

// ── Color maps ─────────────────────────────────────────────────
const transportModeColor = {
  ROAD: { bg: '#e3f2fd', color: '#1565c0', label: 'Road' },
  RAIL: { bg: '#f3e5f5', color: '#6a1b9a', label: 'Rail' },
  AIR: { bg: '#e0f7fa', color: '#00695c', label: 'Air' },
  SHIP: { bg: '#fff3e0', color: '#e65100', label: 'Ship' },
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

const EwayBillDetailView = ({ item }) => {
  if (!item) return null;

  const tm = transportModeColor[item.transportMode] || { bg: '#f5f5f5', color: '#757575', label: item.transportMode || '—' };

  const detailRows = [
    { label: 'E-Way Bill Number', value: item.ewayBillNumber || '—' },
    { label: 'Transport Mode', value: tm.label, chip: true, chipBg: tm.bg, chipColor: tm.color },
    { label: 'Generated Date', value: item.ewayGeneratedDate ? new Date(item.ewayGeneratedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { label: 'Vehicle Number', value: item.vehicleNumber || '—' },
    { label: 'Sales Invoice', value: item.salesInvoice?.invoiceNumber || item.salesInvoiceId || '—' },
    { label: 'Buyer', value: item.salesInvoice?.buyer?.buyerName || '—' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <SectionLabel>E-Way Bill Details</SectionLabel>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 2,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        {detailRows.map((r) => (
          <Box key={r.label}>
            <FieldLabel>{r.label}</FieldLabel>
            {r.chip ? (
              <Chip
                label={r.value}
                size="small"
                sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.75rem', backgroundColor: r.chipBg, color: r.chipColor }}
              />
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, color: 'var(--color-grey-800)' }}>
                {r.value}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {/* Document Link */}
      {item.documentUrl && (
        <>
          <Divider />
          <SectionLabel>Document</SectionLabel>
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'var(--color-grey-50)' }}>
            <a
              href={item.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1565c0', fontSize: '0.85rem', fontWeight: 500 }}
            >
              View Signed E-Way Bill Document ↗
            </a>
          </Box>
        </>
      )}

      {item.createdAt && (
        <>
          <Divider />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <FieldLabel>Created At</FieldLabel>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-grey-600)' }}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Typography>
            </Box>
            {item.updatedAt && (
              <Box>
                <FieldLabel>Updated At</FieldLabel>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'var(--color-grey-600)' }}>
                  {new Date(item.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

EwayBillDetailView.propTypes = {
  item: PropTypes.object,
};

export default EwayBillDetailView;
