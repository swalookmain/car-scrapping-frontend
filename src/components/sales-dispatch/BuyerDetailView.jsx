import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Divider } from '@mui/material';

// ── Color maps ─────────────────────────────────────────────────
const buyerTypeColor = {
  COMPANY: { bg: '#e3f2fd', color: '#1565c0', label: 'Company' },
  INDIVIDUAL: { bg: '#f3e5f5', color: '#6a1b9a', label: 'Individual' },
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

const BuyerDetailView = ({ item }) => {
  if (!item) return null;

  const bt = buyerTypeColor[item.buyerType] || buyerTypeColor.INDIVIDUAL;

  const infoRows = [
    { label: 'Buyer Name', value: item.buyerName || '—' },
    { label: 'Buyer Type', value: bt.label, chip: true, chipBg: bt.bg, chipColor: bt.color },
    { label: 'GSTIN', value: item.gstin || '—' },
    { label: 'Mobile', value: item.mobile || '—' },
    { label: 'Email', value: item.email || '—' },
    { label: 'Address', value: item.address || '—' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <SectionLabel>Buyer Information</SectionLabel>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        {infoRows.map((r) => (
          <Box key={r.label}>
            <FieldLabel>{r.label}</FieldLabel>
            {r.chip ? (
              <Chip
                label={r.value}
                size="small"
                sx={{
                  mt: 0.5,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  backgroundColor: r.chipBg,
                  color: r.chipColor,
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, color: 'var(--color-grey-800)' }}>
                {r.value}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

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

BuyerDetailView.propTypes = {
  item: PropTypes.object,
};

export default BuyerDetailView;
