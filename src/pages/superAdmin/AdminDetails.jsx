import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

/** Presentational details panel for the Admin view modal. */
const AdminDetails = ({ item, orgs = [] }) => {
  if (!item) return null;
  const orgName = orgs.find((o) => (o._id || o.id) === item.organizationId)?.name || '—';
  const rows = [
    { label: 'Name',         value: item.name },
    { label: 'Email',        value: item.email },
    { label: 'Role',         value: item.role },
    { label: 'Organization', value: orgName },
    { label: 'Status',       value: item.isActive ? 'Active' : 'Inactive' },
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

export default AdminDetails;
