import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DocumentPreview from '../../ui/DocumentPreview';

// ── Shared colour maps (kept local to avoid circular deps) ──────
const ACTION_COLOR_MAP = {
  LOGIN_SUCCESS:            { bg: '#e8f5e9', color: '#2e7d32' },
  LOGIN_FAILED:             { bg: '#ffebee', color: '#c62828' },
  LOGOUT:                   { bg: '#fff3e0', color: '#e65100' },
  CREATE_ADMIN:             { bg: '#e3f2fd', color: '#1565c0' },
  CREATE_STAFF:             { bg: '#e3f2fd', color: '#1565c0' },
  UPDATE_USER:              { bg: '#e8eaf6', color: '#283593' },
  DELETE_USER:              { bg: '#fce4ec', color: '#ad1457' },
  CREATE_INVOICE:           { bg: '#e0f2f1', color: '#00695c' },
  UPDATE_INVOICE:           { bg: '#e0f2f1', color: '#00695c' },
  DELETE_INVOICE:           { bg: '#fce4ec', color: '#ad1457' },
  CREATE_VECHILE_INVOICE:   { bg: '#f3e5f5', color: '#6a1b9a' },
  UPDATE_VECHILE_INVOICE:   { bg: '#f3e5f5', color: '#6a1b9a' },
  DELETE_VECHILE_INVOICE:   { bg: '#fce4ec', color: '#ad1457' },
  UPLOAD_PURCHASE_DOCUMENT: { bg: '#e1f5fe', color: '#0277bd' },
  REFRESH_TOKEN:            { bg: '#f5f5f5', color: '#616161' },
  RESET_PASSWORD:           { bg: '#fff8e1', color: '#f57f17' },
  API_CALL:                 { bg: '#ede7f6', color: '#4527a0' },
};

const ACTOR_ROLE_COLOR = {
  SUPER_ADMIN: { bg: '#ede7f6', color: '#4527a0' },
  ADMIN:       { bg: '#e3f2fd', color: '#1565c0' },
  STAFF:       { bg: '#e8f5e9', color: '#2e7d32' },
  SYSTEM:      { bg: '#f5f5f5', color: '#616161' },
};

// ── Chip helpers ────────────────────────────────────────────────
const ActionChip = ({ value }) => {
  const colors = ACTION_COLOR_MAP[value] || { bg: '#f5f5f5', color: '#616161' };
  return (
    <Chip
      label={value?.replace(/_/g, ' ') || '-'}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.72rem' }}
    />
  );
};

const StatusChip = ({ value }) => {
  const colors =
    value === 'SUCCESS' ? { bg: '#e8f5e9', color: '#2e7d32' }
    : value === 'FAILURE' ? { bg: '#ffebee', color: '#c62828' }
    : { bg: '#f5f5f5', color: '#616161' };
  return (
    <Chip
      label={value || '-'}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.72rem' }}
    />
  );
};

const ActorRoleChip = ({ value }) => {
  const colors = ACTOR_ROLE_COLOR[value] || { bg: '#f5f5f5', color: '#616161' };
  return (
    <Chip
      label={value || '-'}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.72rem' }}
    />
  );
};

// ── DetailRow ───────────────────────────────────────────────────
const DetailRow = ({ label, value, children }) => {
  if (!value && !children) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: 'var(--color-grey-700)', minWidth: 130, flexShrink: 0 }}
      >
        {label}:
      </Typography>
      {children ?? (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', wordBreak: 'break-all' }}>
          {value}
        </Typography>
      )}
    </Box>
  );
};

// ── Date helper ─────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return dateStr;
  }
};

// ── AuditLogDetailDialog ────────────────────────────────────────
const AuditLogDetailDialog = ({ open, onClose, log, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [preview, setPreview] = useState({ open: false, src: null, name: null, mime: null });

  const extractFileUrls = (obj, path = '') => {
    const results = [];
    if (!obj || typeof obj !== 'object') return results;
    for (const [k, v] of Object.entries(obj)) {
      const keyPath = path ? `${path}.${k}` : k;
      if (typeof v === 'string') {
        const isUrl = /^data:|^https?:\/\//i.test(v) || /\.(pdf|jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i.test(v);
        if (isUrl) results.push({ key: keyPath, url: v });
      } else if (Array.isArray(v)) {
        v.forEach((item, idx) => {
          if (typeof item === 'string') {
            const isUrl = /^data:|^https?:\/\//i.test(item) || /\.(pdf|jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i.test(item);
            if (isUrl) results.push({ key: `${keyPath}[${idx}]`, url: item });
          } else if (typeof item === 'object') {
            results.push(...extractFileUrls(item, `${keyPath}[${idx}]`));
          }
        });
      } else if (typeof v === 'object') {
        results.push(...extractFileUrls(v, keyPath));
      }
    }
    return results;
  };

  const discoveredFiles = useMemo(() => {
    if (!log) return [];
    const p = extractFileUrls(log.payload || {});
    const m = extractFileUrls(log.metadata || {});
    return [...p, ...m];
  }, [log]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, pb: 0 }}
      >
        Audit Log Details
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 5, mt: 2, '& > *:first-of-type': { mt: 1.5 } }}>
        {loading ? (
          <Box sx={{ py: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} sx={{ color: 'var(--color-secondary-main)' }} />
            <Typography color="text.secondary">Loading…</Typography>
          </Box>
        ) : log ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>

            {/* Identifiers */}
            <DetailRow label="Log ID"    value={log._id || log.id} />
            {log.actorName && <DetailRow label="Actor Name" value={log.actorName} />}
            
            <DetailRow label="Actor ID"  value={log.actorId} />
            <DetailRow label="Actor Role"><ActorRoleChip value={log.actorRole} /></DetailRow>
            {log.organizationId && <DetailRow label="Org ID" value={log.organizationId} />}

            <Divider sx={{ my: 0.5 }} />

            {/* Activity */}
            <DetailRow label="Action"><ActionChip value={log.action} /></DetailRow>
            <DetailRow label="Status"><StatusChip value={log.status} /></DetailRow>
            <DetailRow label="Resource"   value={log.resource} />
            {log.resourceId && <DetailRow label="Resource ID" value={log.resourceId} />}
            {(log.message || log.description) && (
              <DetailRow label="Message" value={log.message || log.description} />
            )}

            <Divider sx={{ my: 0.5 }} />

            {/* Network / Device */}
            <DetailRow label="IP Address" value={log.ip || log.ipAddress} />
            <DetailRow label="Browser"    value={log.browser} />
            <DetailRow label="OS"         value={log.os} />
            <DetailRow label="Device"     value={log.device} />
            {log.userAgent && <DetailRow label="User Agent" value={log.userAgent} />}

            <Divider sx={{ my: 0.5 }} />

            {/* Timestamps */}
            <DetailRow label="Created At" value={formatDate(log.createdAt)} />
            {log.expireAt && <DetailRow label="Expires At" value={formatDate(log.expireAt)} />}

            {/* Payload */}
            {log.payload && (
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--color-grey-700)' }}>
                  Payload
                </Typography>
                {discoveredFiles.length > 0 && (
                  <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {discoveredFiles.map((f, i) => (
                      <Button key={f.url || f.key || i} size="small" variant="outlined" onClick={() => setPreview({ open: true, src: f.url, name: f.key, mime: '' })}>
                        {f.key}
                      </Button>
                    ))}
                  </Box>
                )}
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'var(--color-grey-50)', p: 1.5, borderRadius: '8px',
                    fontSize: '0.78rem', overflow: 'auto', maxHeight: 260, fontFamily: 'monospace', m: 0,
                  }}
                >
                  {JSON.stringify(log.payload, null, 2)}
                </Box>
              </Box>
            )}

            {/* Metadata */}
            {log.metadata && (
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--color-grey-700)' }}>
                  Metadata
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    backgroundColor: 'var(--color-grey-50)', p: 1.5, borderRadius: '8px',
                    fontSize: '0.78rem', overflow: 'auto', maxHeight: 200, fontFamily: 'monospace', m: 0,
                  }}
                >
                  {JSON.stringify(log.metadata, null, 2)}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No data available
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderColor: 'var(--color-grey-300)', color: 'var(--color-grey-700)' }}
        >
          Close
        </Button>
      </DialogActions>
      <DocumentPreview
        open={preview.open}
        onClose={() => setPreview({ open: false, src: null, name: null, mime: null })}
        src={preview.src}
        name={preview.name}
        mime={preview.mime}
      />
    </Dialog>
  );
};

AuditLogDetailDialog.propTypes = {
  open:    PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  log:     PropTypes.object,
  loading: PropTypes.bool,
};

export default AuditLogDetailDialog;
