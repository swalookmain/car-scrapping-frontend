import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { OUTCOME_COLORS } from './lotLifecycleConstants';

const LotAccordionPanel = ({
  lot,
  children,
  subtitle,
}) => {
  const lotId = lot._id || lot.id;
  const status = lot.outcomeStatus || 'PENDING';
  const colors = OUTCOME_COLORS[status] || OUTCOME_COLORS.PENDING;
  const locked = lot.locked;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        opacity: locked && !lot.editable ? 1 : 1,
        borderColor: locked ? 'var(--color-grey-300)' : 'var(--color-grey-200)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Lot {lot.lotNumber}
            {lot.lotName ? ` — ${lot.lotName}` : ''}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {locked && (
            <LockIcon fontSize="small" sx={{ color: 'var(--color-grey-500)' }} />
          )}
          <Chip
            label={status.replace(/_/g, ' ')}
            size="small"
            sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 600 }}
          />
        </Box>
      </Box>
      <Box data-lot-id={lotId}>{children}</Box>
    </Paper>
  );
};

export default LotAccordionPanel;
