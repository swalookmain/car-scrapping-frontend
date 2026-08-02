import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import NormalModal from '../../ui/NormalModal';
import { yardApi } from '../../services/api';
import inputSx from '../../services/inputStyles';

const YardAddAuctionModal = ({ open, zones, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [auctionId, setAuctionId] = useState('');
  const [lotId, setLotId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [zoneId, setZoneId] = useState('');
  const [slot, setSlot] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setAuctionId('');
    setLotId('');
    setSelectedIds([]);
    setZoneId('');
    setSlot('');
    setNotes('');
    setLoading(true);
    yardApi
      .getEligibleAuctionLots()
      .then((res) => {
        const list = Array.isArray(res?.auctions) ? res.auctions : [];
        setAuctions(list);
      })
      .catch(() => {
        setAuctions([]);
        toast.error('Failed to load confirmed auction lots');
      })
      .finally(() => setLoading(false));
  }, [open]);

  const selectedAuction = useMemo(
    () => auctions.find((a) => a.id === auctionId) || null,
    [auctions, auctionId],
  );

  const lots = selectedAuction?.lots || [];

  const selectedLot = useMemo(
    () => lots.find((l) => l.id === lotId) || null,
    [lots, lotId],
  );

  const vehicles = selectedLot?.vehicles || [];
  const availableVehicles = useMemo(
    () => vehicles.filter((v) => !v.alreadyInYard),
    [vehicles],
  );

  useEffect(() => {
    if (!lotId || !selectedLot) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(
      (selectedLot.vehicles || [])
        .filter((v) => !v.alreadyInYard)
        .map((v) => v.id),
    );
  }, [lotId, selectedLot]);

  const allAvailableSelected =
    availableVehicles.length > 0 &&
    availableVehicles.every((v) => selectedIds.includes(v.id));

  const toggleSelectAll = () => {
    if (allAvailableSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableVehicles.map((v) => v.id));
    }
  };

  const toggleVehicle = (id, alreadyInYard) => {
    if (alreadyInYard) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!lotId) {
      toast.error('Select a confirmed lot');
      return;
    }
    if (!zoneId) {
      toast.error('Select a zone to park');
      return;
    }
    if (!selectedIds.length) {
      toast.error('Select at least one vehicle');
      return;
    }
    setSaving(true);
    try {
      const res = await yardApi.addFromAuction({
        lotId,
        auctionVehicleIds: selectedIds,
        zoneId,
        slot: slot.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success(
        res?.message ||
          `Parked ${res?.created ?? selectedIds.length} vehicle(s)`,
      );
      onSaved?.();
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to add auction vehicles to yard';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title="Add auction vehicles to yard"
      maxWidth="md"
      actions={(
        <>
          <Button onClick={onClose} sx={{ color: 'var(--color-grey-600)' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || loading || !selectedIds.length}
            sx={{
              backgroundColor: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Park selected'}
          </Button>
        </>
      )}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Only confirmed lots (deal done) are listed. Select a lot to park all
            vehicles, or multi-select individuals.
          </Typography>

          {!auctions.length && (
            <Typography variant="body2" color="text.secondary">
              No confirmed auction lots available.
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Auction"
                value={auctionId}
                onChange={(e) => {
                  setAuctionId(e.target.value);
                  setLotId('');
                }}
                sx={inputSx}
                disabled={!auctions.length}
              >
                {auctions.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.auctionNumber || a.id}
                    {a.buyerReferenceNumber ? ` · ${a.buyerReferenceNumber}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Confirmed lot"
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                sx={inputSx}
                disabled={!auctionId || !lots.length}
                helperText={
                  selectedLot
                    ? `${availableVehicles.length} available · ${vehicles.length} total`
                    : ' '
                }
              >
                {lots.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.lotName || l.lotNumber || l.id}
                    {l.lotNumber && l.lotName ? ` (${l.lotNumber})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {selectedLot && (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Vehicles
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={allAvailableSelected}
                      indeterminate={
                        selectedIds.length > 0 && !allAvailableSelected
                      }
                      onChange={toggleSelectAll}
                      disabled={!availableVehicles.length}
                    />
                  }
                  label="Select all available"
                />
              </Box>
              {!vehicles.length && (
                <Typography variant="body2" color="text.secondary">
                  No vehicles on this lot
                </Typography>
              )}
              {vehicles.map((v) => (
                <FormControlLabel
                  key={v.id}
                  sx={{
                    display: 'flex',
                    ml: 0,
                    mr: 0,
                    opacity: v.alreadyInYard ? 0.55 : 1,
                  }}
                  control={
                    <Checkbox
                      size="small"
                      checked={v.alreadyInYard || selectedIds.includes(v.id)}
                      disabled={v.alreadyInYard}
                      onChange={() => toggleVehicle(v.id, v.alreadyInYard)}
                    />
                  }
                  label={(
                    <Typography variant="body2">
                      {[v.make, v.model, v.registrationNumber]
                        .filter(Boolean)
                        .join(' · ') || v.id}
                      {v.alreadyInYard ? ' — Already in yard' : ''}
                    </Typography>
                  )}
                />
              ))}
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                sx={inputSx}
                required
              >
                {(zones || []).map((z) => (
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={inputSx}
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </NormalModal>
  );
};

YardAddAuctionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  zones: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
};

export default YardAddAuctionModal;
