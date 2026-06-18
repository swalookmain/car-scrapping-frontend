import React from 'react';
import { Box, Button, Chip, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { authorizationLettersApi } from '../../services/api';

const STATUS_LABELS = {
  NOT_ELIGIBLE: 'Not eligible',
  READY: 'Ready',
  CREATED: 'Created',
};

const STATUS_COLORS = {
  NOT_ELIGIBLE: 'default',
  READY: 'success',
  CREATED: 'info',
};

const AuthorizationLetterStatus = ({
  auctionId,
  onCreate,
  onView,
  onDownload,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['auth-letter-eligibility', auctionId],
    queryFn: () => authorizationLettersApi.getEligibility(auctionId),
    enabled: !!auctionId,
  });

  const eligibility = data?.data ?? data ?? {};
  const status = eligibility.status || 'NOT_ELIGIBLE';

  if (isLoading) {
    return <CircularProgress size={18} />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Chip
        size="small"
        label={`Authorization Letter: ${STATUS_LABELS[status] || status}`}
        color={STATUS_COLORS[status] || 'default'}
      />
      {status === 'READY' && (
        <Button size="small" variant="contained" onClick={onCreate}>
          Create Authorization Letter
        </Button>
      )}
      {status === 'CREATED' && (
        <>
          <Button size="small" variant="outlined" onClick={() => onView?.(eligibility.letterId)}>
            View
          </Button>
          <Button size="small" variant="contained" onClick={() => onDownload?.(eligibility.letterId, eligibility.letterNumber)}>
            Download PDF
          </Button>
        </>
      )}
    </Box>
  );
};

export default AuthorizationLetterStatus;
