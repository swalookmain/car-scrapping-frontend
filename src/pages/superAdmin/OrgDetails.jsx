import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

/** Presentational details panel for the Organization view modal. */
const OrgDetails = ({ item }) => {
  if (!item) return null;
  const rows = [
    { label: 'Name',       value: item.name },
    { label: 'Status',     value: item.isActive ? 'Active' : 'Inactive' },
    { label: 'Created At', value: item.createdAt ? new Date(item.createdAt).toLocaleString() : '—' },
  ];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map(({ label, value }) => (
        <Box key={label}>
          <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.25 }}>{value || '—'}</Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}
    </Box>
  );
};

export default OrgDetails;
