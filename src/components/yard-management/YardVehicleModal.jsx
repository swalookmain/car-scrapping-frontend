import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import NormalModal from '../../ui/NormalModal';
import { yardApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import { YARD_STATUS_LABELS, YARD_NEXT_STATUSES } from './yardConstants';

const YardVehicleModal = ({ open, item, zones, onClose, onSaved }) => {
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [zoneId, setZoneId] = useState('');
  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [grossWeightKg, setGrossWeightKg] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [arrivedAt, setArrivedAt] = useState('');
  const [codNumber, setCodNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const id = item?._id || item?.id;
  const status = item?.currentStatus;
  const vehicleInvoiceId = item?.vehicleInvoiceId?._id || item?.vehicleInvoiceId;

  useEffect(() => {
    if (!open || !id) return;
    setZoneId(item?.currentZoneId?._id || item?.currentZoneId || '');
    setSlot(item?.currentSlot || '');
    setNotes('');
    setGrossWeightKg(
      item?.grossWeightKg != null ? String(item.grossWeightKg) : '',
    );
    setNextStatus((YARD_NEXT_STATUSES[item?.currentStatus] || [])[0] || '');
    setArrivedAt(item?.arrivedAt ? String(item.arrivedAt).slice(0, 10) : '');
    setCodNumber(item?.codNumber || '');
    setLoadingMovements(true);
    yardApi
      .getMovements(id)
      .then((res) => setMovements(Array.isArray(res) ? res : res?.data ?? []))
      .catch(() => setMovements([]))
      .finally(() => setLoadingMovements(false));
  }, [open, id, item]);

  const handleUpdateStatus = async () => {
    if (!nextStatus) {
      toast.error('Select a status');
      return;
    }
    if (nextStatus === 'PARKED' && !zoneId) {
      toast.error('Select a zone to park the vehicle');
      return;
    }
    setSaving(true);
    try {
      await yardApi.updateStatus(id, {
        status: nextStatus,
        zoneId: zoneId || undefined,
        slot: slot.trim() || undefined,
        notes: notes.trim() || undefined,
        arrivedAt: arrivedAt || undefined,
        codNumber: codNumber.trim() || undefined,
        grossWeightKg:
          grossWeightKg === '' ? undefined : Number(grossWeightKg),
      });
      toast.success('Status updated');
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handlePark = async () => {
    if (!zoneId) {
      toast.error('Select a zone to park the vehicle');
      return;
    }
    setSaving(true);
    try {
      await yardApi.updateStatus(id, {
        status: 'PARKED',
        zoneId,
        slot: slot.trim() || undefined,
        notes: notes.trim() || undefined,
        grossWeightKg:
          grossWeightKg === '' ? undefined : Number(grossWeightKg),
      });
      toast.success('Vehicle parked');
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to park');
    } finally {
      setSaving(false);
    }
  };

  const handleStartDismantling = async () => {
    if (!vehicleInvoiceId) return;
    setSaving(true);
    try {
      await yardApi.startDismantling(String(vehicleInvoiceId));
      toast.success('Dismantling started');
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to start dismantling');
    } finally {
      setSaving(false);
    }
  };

  const handleExit = async () => {
    setSaving(true);
    try {
      await yardApi.updateStatus(id, {
        status: 'EXITED',
        notes: notes.trim() || undefined,
      });
      toast.success('Vehicle marked as exited');
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title={`Yard — ${item?.registrationNumber || 'Vehicle'}`}
      maxWidth="md"
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Status: <strong>{YARD_STATUS_LABELS[status] || status}</strong>
        {item?.currentZoneId?.name ? ` · Zone: ${item.currentZoneId.name}` : ''}
        {item?.currentSlot ? ` · Slot: ${item.currentSlot}` : ''}
      </Typography>

      {(YARD_NEXT_STATUSES[status] || []).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Update status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="New status"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                sx={inputSx}
              >
                {(YARD_NEXT_STATUSES[status] || []).map((s) => (
                  <MenuItem key={s} value={s}>
                    {YARD_STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                fullWidth
                label="Arrival date"
                value={arrivedAt}
                onChange={(e) => setArrivedAt(e.target.value)}
                sx={inputSx}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="COD number"
                value={codNumber}
                onChange={(e) => setCodNumber(e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" disabled={saving} onClick={handleUpdateStatus}>
                Update status
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {(status === 'AWAITING_ARRIVAL' || status === 'GATE_IN') && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Park vehicle
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                sx={inputSx}
              >
                {zones.map((z) => (
                  <MenuItem key={z._id || z.id} value={z._id || z.id}>
                    {z.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Slot (optional)"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Vehicle weight (KG)"
                value={grossWeightKg}
                onChange={(e) => setGrossWeightKg(e.target.value)}
                sx={inputSx}
                inputProps={{ min: 0, step: 'any' }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" disabled={saving} onClick={handlePark}>
                Mark as parked
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {status === 'PARKED' && (
        <Box sx={{ mb: 2 }}>
          {vehicleInvoiceId ? (
            <Button variant="contained" color="secondary" disabled={saving} onClick={handleStartDismantling}>
              Start dismantling
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Link a purchase invoice for this vehicle before starting dismantling.
            </Typography>
          )}
        </Box>
      )}

      {status === 'DISMANTLED' && (
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" disabled={saving} onClick={handleExit}>
            Mark exited
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Movement history
      </Typography>
      {loadingMovements ? (
        <Typography variant="body2" color="text.secondary">
          Loading…
        </Typography>
      ) : movements.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No movements yet.
        </Typography>
      ) : (
        <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
          {movements.map((m) => (
            <Box key={m._id || m.id} sx={{ mb: 1.5, pb: 1, borderBottom: '1px solid #eee' }}>
              <Typography variant="body2">
                {YARD_STATUS_LABELS[m.fromStatus] || m.fromStatus || '—'} →{' '}
                <strong>{YARD_STATUS_LABELS[m.toStatus] || m.toStatus}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {m.source || '—'}
                {m.createdAt ? ` · ${new Date(m.createdAt).toLocaleString()}` : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </NormalModal>
  );
};

YardVehicleModal.propTypes = {
  open: PropTypes.bool,
  item: PropTypes.object,
  zones: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default YardVehicleModal;
