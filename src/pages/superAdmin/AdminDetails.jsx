import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, CircularProgress } from '@mui/material';
import { subscriptionsApi } from '../../services/api';
import { daysRemaining, formatPlanLabel } from '../../utils/subscriptionDates';

const AdminDetails = ({ item, orgs = [] }) => {
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    const orgId = item?.organizationId;
    if (!orgId) return;
    setLoadingSub(true);
    subscriptionsApi
      .getByOrganizationId(orgId)
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoadingSub(false));
  }, [item]);

  if (!item) return null;

  const org = orgs.find((o) => (o._id || o.id) === item.organizationId);
  const orgName = org?.name || '—';

  const rows = [
    { label: 'Name', value: item.name },
    { label: 'Email', value: item.email },
    { label: 'Role', value: item.role },
    { label: 'Organization', value: orgName },
    { label: 'Status', value: item.isActive ? 'Active' : 'Inactive' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map(({ label, value }) => (
        <Box key={label}>
          <Typography
            variant="caption"
            sx={{
              color: 'var(--color-grey-500)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.25 }}>
            {value || '—'}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}

      <Box>
        <Typography
          variant="caption"
          sx={{
            color: 'var(--color-grey-500)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Subscription
        </Typography>
        {loadingSub ? (
          <CircularProgress size={20} sx={{ mt: 1 }} />
        ) : subscription ? (
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body1">
              {formatPlanLabel(subscription.type, subscription.plan)} — {subscription.status}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
              Ends:{' '}
              {subscription.endDate
                ? new Date(subscription.endDate).toLocaleDateString()
                : '—'}
              {subscription.endDate &&
                ` (${daysRemaining(subscription.endDate) >= 0 ? `${daysRemaining(subscription.endDate)} days left` : 'expired'})`}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ mt: 0.25 }}>
            —
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AdminDetails;
