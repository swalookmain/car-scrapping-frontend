import React from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Typography } from '@mui/material';
import { YARD_STATUS_LABELS, YARD_STATUS_COLORS } from './yardConstants';

const YardDashboardCards = ({ summary }) => {
  const byStatus = summary?.byStatus ?? [];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
      <Paper variant="outlined" sx={{ p: 2, minWidth: 120 }}>
        <Typography variant="caption" color="text.secondary">
          Total in yard
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {summary?.total ?? 0}
        </Typography>
      </Paper>
      {byStatus.map(({ status, count }) => {
        const style = YARD_STATUS_COLORS[status] || { bg: '#f5f5f5', color: '#333' };
        return (
          <Paper
            key={status}
            variant="outlined"
            sx={{ p: 2, minWidth: 140, borderLeft: `4px solid ${style.color}` }}
          >
            <Typography variant="caption" color="text.secondary">
              {YARD_STATUS_LABELS[status] || status}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ color: style.color }}>
              {count}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

YardDashboardCards.propTypes = {
  summary: PropTypes.shape({
    total: PropTypes.number,
    byStatus: PropTypes.arrayOf(
      PropTypes.shape({
        status: PropTypes.string,
        count: PropTypes.number,
      }),
    ),
  }),
};

export default YardDashboardCards;
