import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatINR } from '../../../services/taxEngine';

const chipSx = (bg, color) => ({
  p: 1.5,
  borderRadius: 2,
  backgroundColor: bg,
  border: `1px solid ${color}22`,
  flex: 1,
  minWidth: 120,
});

const AmountSummaryChips = ({ total, paid, outstanding, labels = {} }) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <Box sx={chipSx('#e3f2fd', '#1565c0')}>
      <Typography variant="caption" color="text.secondary">
        {labels.total || 'Total'}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {formatINR(total ?? 0)}
      </Typography>
    </Box>
    <Box sx={chipSx('#e8f5e9', '#2e7d32')}>
      <Typography variant="caption" color="text.secondary">
        {labels.paid || 'Paid'}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600}>
        {formatINR(paid ?? 0)}
      </Typography>
    </Box>
    <Box sx={chipSx('#fff3e0', '#e65100')}>
      <Typography variant="caption" color="text.secondary">
        {labels.outstanding || 'Outstanding'}
      </Typography>
      <Typography variant="subtitle2" fontWeight={600} color={outstanding > 0 ? '#e65100' : '#2e7d32'}>
        {formatINR(outstanding ?? 0)}
      </Typography>
    </Box>
  </Box>
);

export default AmountSummaryChips;
