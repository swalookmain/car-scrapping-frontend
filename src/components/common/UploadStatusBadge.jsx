import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// ── Hook ─────────────────────────────────────────────────────────────────────
/**
 * useUploadStatus — manages uploading / success / error badge state.
 *
 * Returns:
 *   status        : 'idle' | 'uploading' | 'success' | 'error'
 *   progress      : 0–100
 *   startUpload   : call just before the API request
 *   finishUpload  : call with (success: boolean) after the request resolves
 */
export function useUploadStatus() {
  const timerRef = useRef(null);
  const [status, setStatus] = React.useState('idle');
  const [progress, setProgress] = React.useState(0);

  const startUpload = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);
    setStatus('uploading');
    let pct = 0;
    timerRef.current = setInterval(() => {
      pct += Math.random() * 16 + 6;
      if (pct >= 90) {
        pct = 90;
        clearInterval(timerRef.current);
      }
      setProgress(Math.min(Math.round(pct), 90));
    }, 200);
  }, []);

  const finishUpload = React.useCallback((success) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setStatus(success ? 'success' : 'error');
    setTimeout(() => {
      setStatus('idle');
      setProgress(0);
    }, 3500);
  }, []);

  // cleanup on unmount
  React.useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { status, progress, startUpload, finishUpload };
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * <UploadStatusBadge status="uploading" progress={42} />
 *
 * Renders nothing when status === 'idle'.
 * Shows a spinning circular progress ring + "Uploading…" label while uploading.
 * Shows a coloured Chip after completion.
 */
const UploadStatusBadge = ({ status, progress }) => {
  if (status === 'idle') return null;

  if (status === 'uploading') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={28}
            thickness={4}
            sx={{ color: 'var(--color-secondary-main, #6366f1)' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.58rem',
                fontWeight: 700,
                color: 'var(--color-secondary-main, #6366f1)',
                lineHeight: 1,
              }}
            >
              {progress}%
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: 'var(--color-grey-600)', fontWeight: 500 }}>
          Uploading…
        </Typography>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Chip
        icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
        label="Upload Successful"
        size="small"
        sx={{
          backgroundColor: 'rgba(16,185,129,0.12)',
          color: '#059669',
          border: '1px solid rgba(16,185,129,0.3)',
          fontWeight: 600,
          '& .MuiChip-icon': { color: '#059669' },
        }}
      />
    );
  }

  if (status === 'error') {
    return (
      <Chip
        icon={<ErrorIcon sx={{ fontSize: '16px !important' }} />}
        label="Upload Failed"
        size="small"
        sx={{
          backgroundColor: 'rgba(239,68,68,0.1)',
          color: '#dc2626',
          border: '1px solid rgba(239,68,68,0.25)',
          fontWeight: 600,
          '& .MuiChip-icon': { color: '#dc2626' },
        }}
      />
    );
  }

  return null;
};

UploadStatusBadge.propTypes = {
  status: PropTypes.oneOf(['idle', 'uploading', 'success', 'error']).isRequired,
  progress: PropTypes.number.isRequired,
};

export default UploadStatusBadge;
