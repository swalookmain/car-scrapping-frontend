import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  MenuItem,
  Typography,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel as MuiFormControlLabel,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import NormalModal from '../../ui/NormalModal';
import UpdatePasswordModal from '../../ui/UpdatePasswordModal';
import inputSx from '../../services/inputStyles';
import { subscriptionsApi } from '../../services/api';
import { calculateEndDate, todayIsoDate } from '../../utils/subscriptionDates';
import { resolveOrganizationId } from '../../utils/resolveOrganizationId';

const defaultSubscription = () => ({
  type: 'TRIAL',
  plan: 'MONTHLY',
  startDate: todayIsoDate(),
  endDate: calculateEndDate({ type: 'TRIAL', startDate: todayIsoDate() }),
  endDateManual: false,
});

const emptyForm = () => ({
  name: '',
  email: '',
  password: '',
  clientMode: 'new',
  organizationId: '',
  organizationName: '',
  isActive: true,
  subscription: defaultSubscription(),
});

const AdminForm = forwardRef(({ onSubmit, organizations = [] }, ref) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [initialForm, setInitialForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [updatePwdOpen, setUpdatePwdOpen] = useState(false);
  const [subscriptionSummary, setSubscriptionSummary] = useState(null);
  const [editSubscription, setEditSubscription] = useState(false);

  const loadSubscription = async (orgId) => {
    if (!orgId) {
      setSubscriptionSummary(null);
      return;
    }
    try {
      const sub = await subscriptionsApi.getByOrganizationId(orgId);
      setSubscriptionSummary(sub);
    } catch {
      setSubscriptionSummary(null);
    }
  };

  useImperativeHandle(ref, () => ({
    open: async (item) => {
      setEditSubscription(false);
      if (item) {
        const orgId = resolveOrganizationId(item.organizationId || item.organization);
        const loaded = {
          ...emptyForm(),
          name: item.name || '',
          email: item.email || '',
          password: '',
          clientMode: 'existing',
          organizationId: orgId,
          isActive: Boolean(item.isActive),
        };
        setForm(loaded);
        setInitialForm(loaded);
        setEditingId(item._id || item.id || null);
        await loadSubscription(orgId);
      } else {
        setForm(emptyForm());
        setInitialForm(null);
        setEditingId(null);
        setSubscriptionSummary(null);
      }
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingId(null);
      setEditSubscription(false);
    },
  }));

  useEffect(() => {
    if (!editingId && organizations.length === 1 && form.clientMode === 'existing') {
      setForm((p) => ({ ...p, organizationId: organizations[0]._id || organizations[0].id }));
    }
  }, [organizations, editingId, form.clientMode]);

  const updateSubscriptionField = (patch) => {
    setForm((prev) => {
      const subscription = { ...prev.subscription, ...patch };
      if (!subscription.endDateManual && (patch.type || patch.plan || patch.startDate)) {
        subscription.endDate = calculateEndDate({
          type: subscription.type,
          plan: subscription.plan,
          startDate: subscription.startDate,
        });
      }
      return { ...prev, subscription };
    });
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,24}$/.test(form.email)) err.email = 'Enter a valid email';
    if (!editingId && form.password.length < 6) err.password = 'Password must be at least 6 characters';

    if (!editingId) {
      if (form.clientMode === 'existing' && !form.organizationId) {
        err.organizationId = 'Select organization';
      }
      if (form.clientMode === 'new' && !form.organizationName.trim()) {
        err.organizationName = 'Organization name is required';
      }
      if (form.subscription.type === 'PAID' && !form.subscription.plan) {
        err.subscriptionPlan = 'Select a plan for paid subscription';
      }
      if (!form.subscription.startDate) err.subscriptionStart = 'Start date is required';
      if (!form.subscription.endDate) err.subscriptionEnd = 'End date is required';
    }

    if (editingId && editSubscription) {
      if (form.subscription.type === 'PAID' && !form.subscription.plan) {
        err.subscriptionPlan = 'Select a plan for paid subscription';
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const isDirty = !editingId || !initialForm || JSON.stringify(form) !== JSON.stringify(initialForm) || editSubscription;

  const buildPayload = () => {
    const payload = {
      name: form.name,
      email: form.email,
      isActive: form.isActive,
    };

    if (!editingId) {
      payload.password = form.password;
      payload.role = 'ADMIN';

      if (form.clientMode === 'new') {
        payload.organizationName = form.organizationName;
      } else {
        payload.organizationId = form.organizationId;
      }

      payload.subscription = {
        type: form.subscription.type,
        startDate: form.subscription.startDate,
        endDate: form.subscription.endDate,
      };
      if (form.subscription.type === 'PAID') {
        payload.subscription.plan = form.subscription.plan;
      }
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = buildPayload();
    await onSubmit(payload, editingId);

    if (editingId && editSubscription && form.organizationId) {
      const subPayload = {
        type: form.subscription.type,
        startDate: form.subscription.startDate,
        endDate: form.subscription.endDate,
      };
      if (form.subscription.type === 'PAID') {
        subPayload.plan = form.subscription.plan;
      }
      await subscriptionsApi.update(form.organizationId, subPayload);
    }

    setForm(emptyForm());
    setInitialForm(null);
    setErrors({});
    setEditingId(null);
    setEditSubscription(false);
    setSubscriptionSummary(null);
    setOpen(false);
  };

  return (
    <>
      <NormalModal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? 'Edit Admin' : 'Add Client / Admin'}
        showCloseButton={!editingId}
        actions={
          <>
            {editingId && (
              <Button
                startIcon={<LockResetIcon />}
                onClick={() => setUpdatePwdOpen(true)}
                variant="outlined"
                sx={{
                  mr: 'auto',
                  borderColor: 'var(--color-secondary-main)',
                  color: 'var(--color-secondary-main)',
                }}
              >
                Update Password
              </Button>
            )}
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!isDirty}
              variant="contained"
              sx={{
                backgroundColor: 'var(--color-secondary-main)',
                '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
              }}
            >
              {editingId ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            fullWidth
            sx={inputSx}
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            fullWidth
            sx={inputSx}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          {!editingId && (
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              fullWidth
              sx={inputSx}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
          )}

          {!editingId && (
            <>
              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Organization
              </Typography>
              <RadioGroup
                row
                value={form.clientMode}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    clientMode: e.target.value,
                    organizationId: '',
                    organizationName: '',
                  }))
                }
              >
                <MuiFormControlLabel value="new" control={<Radio />} label="New client" />
                <MuiFormControlLabel value="existing" control={<Radio />} label="Existing organization" />
              </RadioGroup>

              {form.clientMode === 'new' ? (
                <TextField
                  label="Organization Name"
                  value={form.organizationName}
                  onChange={(e) => setForm((p) => ({ ...p, organizationName: e.target.value }))}
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.organizationName)}
                  helperText={errors.organizationName || 'Must be unique across all organizations'}
                />
              ) : (
                <TextField
                  select
                  label="Organization"
                  value={form.organizationId}
                  onChange={(e) => setForm((p) => ({ ...p, organizationId: e.target.value }))}
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.organizationId)}
                  helperText={errors.organizationId}
                >
                  <MenuItem value="">Select Organization</MenuItem>
                  {Array.isArray(organizations) &&
                    organizations.map((org) => (
                      <MenuItem key={org._id || org.id} value={org._id || org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            </>
          )}

          {editingId && form.organizationId && (
            <>
              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Subscription
              </Typography>
              {subscriptionSummary && !editSubscription && (
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(103,58,183,0.06)' }}>
                  <Typography variant="body2">
                    Type: {subscriptionSummary.type === 'TRIAL' ? '7-day trial' : 'Paid'}
                  </Typography>
                  <Typography variant="body2">
                    Plan: {subscriptionSummary.plan || '—'}
                  </Typography>
                  <Typography variant="body2">
                    {subscriptionSummary.startDate
                      ? new Date(subscriptionSummary.startDate).toLocaleDateString()
                      : '—'}{' '}
                    →{' '}
                    {subscriptionSummary.endDate
                      ? new Date(subscriptionSummary.endDate).toLocaleDateString()
                      : '—'}
                  </Typography>
                  <Typography variant="body2">Status: {subscriptionSummary.status}</Typography>
                  <Button
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      setEditSubscription(true);
                      updateSubscriptionField({
                        type: subscriptionSummary.type || 'TRIAL',
                        plan: subscriptionSummary.plan || 'MONTHLY',
                        startDate: subscriptionSummary.startDate
                          ? new Date(subscriptionSummary.startDate).toISOString().split('T')[0]
                          : todayIsoDate(),
                        endDate: subscriptionSummary.endDate
                          ? new Date(subscriptionSummary.endDate).toISOString().split('T')[0]
                          : '',
                        endDateManual: true,
                      });
                    }}
                  >
                    Edit subscription
                  </Button>
                </Box>
              )}
            </>
          )}

          {(!editingId || editSubscription) && (
            <>
              {!editingId && (
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Subscription
                </Typography>
              )}
              <RadioGroup
                row
                value={form.subscription.type}
                onChange={(e) => updateSubscriptionField({ type: e.target.value, endDateManual: false })}
              >
                <MuiFormControlLabel value="TRIAL" control={<Radio />} label="7-day free trial" />
                <MuiFormControlLabel value="PAID" control={<Radio />} label="Paid" />
              </RadioGroup>

              {form.subscription.type === 'PAID' && (
                <TextField
                  select
                  label="Plan"
                  value={form.subscription.plan}
                  onChange={(e) => updateSubscriptionField({ plan: e.target.value, endDateManual: false })}
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.subscriptionPlan)}
                  helperText={errors.subscriptionPlan}
                >
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="SIX_MONTH">6 months</MenuItem>
                  <MenuItem value="YEARLY">Yearly</MenuItem>
                </TextField>
              )}

              <TextField
                label="Start Date"
                type="date"
                value={form.subscription.startDate}
                onChange={(e) => updateSubscriptionField({ startDate: e.target.value, endDateManual: false })}
                fullWidth
                sx={inputSx}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.subscriptionStart)}
                helperText={errors.subscriptionStart}
              />

              <TextField
                label="End Date"
                type="date"
                value={form.subscription.endDate}
                onChange={(e) =>
                  updateSubscriptionField({ endDate: e.target.value, endDateManual: true })
                }
                fullWidth
                sx={inputSx}
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.subscriptionEnd)}
                helperText={errors.subscriptionEnd || 'Editable — override for custom duration'}
              />
            </>
          )}

          <FormControlLabel
            sx={{ alignItems: 'center' }}
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'var(--color-secondary-main)',
                  },
                }}
              />
            }
            label="Is Active"
          />
        </Box>
      </NormalModal>

      <UpdatePasswordModal
        open={updatePwdOpen}
        onClose={() => setUpdatePwdOpen(false)}
        userId={editingId}
        onSuccess={() => {}}
      />
    </>
  );
});

AdminForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  organizations: PropTypes.array,
};

export default AdminForm;
