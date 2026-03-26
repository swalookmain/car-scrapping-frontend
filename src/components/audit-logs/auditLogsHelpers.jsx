import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';

// ── Filter Options ─────────────────────────────────────────────
export const ACTION_OPTIONS = [
  'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
  'CREATE_ADMIN', 'CREATE_STAFF', 'UPDATE_USER', 'DELETE_USER',
  'CREATE_INVOICE', 'UPDATE_INVOICE', 'DELETE_INVOICE',
  'CREATE_VECHILE_INVOICE', 'UPDATE_VECHILE_INVOICE', 'DELETE_VECHILE_INVOICE',
  'UPLOAD_PURCHASE_DOCUMENT', 'REFRESH_TOKEN', 'RESET_PASSWORD', 'API_CALL',
];

export const STATUS_OPTIONS = ['SUCCESS', 'FAILURE'];

// ── Color Maps ─────────────────────────────────────────────────
export const ACTION_COLOR_MAP = {
  LOGIN_SUCCESS:             { bg: '#e8f5e9', color: '#2e7d32' },
  LOGIN_FAILED:              { bg: '#ffebee', color: '#c62828' },
  LOGOUT:                    { bg: '#fff3e0', color: '#e65100' },
  CREATE_ADMIN:              { bg: '#e3f2fd', color: '#1565c0' },
  CREATE_STAFF:              { bg: '#e3f2fd', color: '#1565c0' },
  UPDATE_USER:               { bg: '#e8eaf6', color: '#283593' },
  DELETE_USER:               { bg: '#fce4ec', color: '#ad1457' },
  CREATE_INVOICE:            { bg: '#e0f2f1', color: '#00695c' },
  UPDATE_INVOICE:            { bg: '#e0f2f1', color: '#00695c' },
  DELETE_INVOICE:            { bg: '#fce4ec', color: '#ad1457' },
  CREATE_VECHILE_INVOICE:    { bg: '#f3e5f5', color: '#6a1b9a' },
  UPDATE_VECHILE_INVOICE:    { bg: '#f3e5f5', color: '#6a1b9a' },
  DELETE_VECHILE_INVOICE:    { bg: '#fce4ec', color: '#ad1457' },
  UPLOAD_PURCHASE_DOCUMENT:  { bg: '#e1f5fe', color: '#0277bd' },
  REFRESH_TOKEN:             { bg: '#f5f5f5', color: '#616161' },
  RESET_PASSWORD:            { bg: '#fff8e1', color: '#f57f17' },
  API_CALL:                  { bg: '#ede7f6', color: '#4527a0' },
};

export const ACTOR_ROLE_COLOR = {
  SUPER_ADMIN: { bg: '#ede7f6', color: '#4527a0' },
  ADMIN:       { bg: '#e3f2fd', color: '#1565c0' },
  STAFF:       { bg: '#e8f5e9', color: '#2e7d32' },
  SYSTEM:      { bg: '#f5f5f5', color: '#616161' },
};

// ── Normalization ──────────────────────────────────────────────
export const mapLog = (log) => ({
  id:             log._id   || log.id   || '',
  action:         log.action         || '',
  actorId:        log.actorId        || '',
  actorName:      log.actorName      || '',
  actorRole:      log.actorRole      || 'SYSTEM',
  organizationId: log.organizationId || '',
  resource:       log.resource       || '',
  resourceId:     log.resourceId     || '',
  status:         log.status         || '',
  ip:             log.ip             || log.ipAddress || '',
  browser:        log.browser        || '',
  os:             log.os             || '',
  device:         log.device         || '',
  userAgent:      log.userAgent      || '',
  payload:        log.payload        || null,
  metadata:       log.metadata       || null,
  createdAt:      log.createdAt      || '',
  expireAt:       log.expireAt       || '',
  raw:            log,
});

// ── Formatters ────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return dateStr;
  }
};

// ── Chip Components ───────────────────────────────────────────
export const ActionChip = ({ value }) => {
  const colors = ACTION_COLOR_MAP[value] || { bg: '#f5f5f5', color: '#616161' };
  return (
    <Chip
      label={value?.replace(/_/g, ' ') || '-'}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.72rem', maxWidth: 160 }}
    />
  );
};

export const StatusChip = ({ value }) => {
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

export const ActorRoleChip = ({ value }) => {
  const colors = ACTOR_ROLE_COLOR[value] || { bg: '#f5f5f5', color: '#616161' };
  return (
    <Chip
      label={value || '-'}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.72rem' }}
    />
  );
};

// ── IP / Device cell ──────────────────────────────────────────
export const IpDeviceCell = ({ row }) => (
  <Box>
    <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
      {row.ip || '-'}
    </Typography>
    {(row.browser || row.os) && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
        <ComputerIcon sx={{ fontSize: 12, color: 'var(--color-grey-400)' }} />
        <Typography variant="caption" sx={{ color: 'var(--color-grey-400)', fontSize: '0.7rem' }}>
          {[row.browser, row.os].filter(Boolean).join(' / ')}
        </Typography>
      </Box>
    )}
  </Box>
);
