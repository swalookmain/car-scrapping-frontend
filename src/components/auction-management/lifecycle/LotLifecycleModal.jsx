import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import NormalModal from '../../../ui/NormalModal';
import { auctionsApi } from '../../../services/api';
import { LIFECYCLE_ACTIONS, ACTION_LABELS } from './lotLifecycleConstants';
import LotAccordionPanel from './LotAccordionPanel';
import LotOutcomeFields from './LotOutcomeFields';
import LotPaymentPanel from './LotPaymentPanel';
import LotDeliveryPanel from './LotDeliveryPanel';
import LotGatePassPanel from './LotGatePassPanel';
import LotRcmPanel from './LotRcmPanel';
import AuthorizationLetterStatus from '../../authorization-letters/AuthorizationLetterStatus';

const MODAL_TITLES = {
  [LIFECYCLE_ACTIONS.UPDATE_LOT_STATUS]: 'Update lot status',
  [LIFECYCLE_ACTIONS.UPDATE_PAYMENT]: 'Update payment',
  [LIFECYCLE_ACTIONS.UPDATE_DELIVERY]: 'Update delivery detail',
  [LIFECYCLE_ACTIONS.ADD_GATE_PASS]: 'Add gate pass detail',
  [LIFECYCLE_ACTIONS.ADD_RCM]: 'Add RCM detail',
};

const LotLifecycleModal = ({
  open,
  onClose,
  auctionId,
  actionType,
  onCreateAuthLetter,
  onViewAuthLetter,
  onDownloadAuthLetter,
}) => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auction-lifecycle', auctionId],
    queryFn: () => auctionsApi.getLifecycle(auctionId),
    enabled: open && !!auctionId,
  });

  const lifecycle = data?.data || data;
  const lots = lifecycle?.lots || [];
  const auction = lifecycle?.auction;

  const editableLots = useMemo(
    () => lots.filter((l) => l.editable !== false && !l.locked),
    [lots],
  );
  const lockedLots = useMemo(
    () => lots.filter((l) => l.locked || !l.editable),
    [lots],
  );

  const [outcomeForms, setOutcomeForms] = useState({});

  useEffect(() => {
    if (!open || !editableLots.length) return;
    const initial = {};
    editableLots.forEach((lot) => {
      const id = lot._id || lot.id;
      initial[id] = {
        lotId: id,
        outcomeStatus: lot.outcomeStatus || 'PENDING',
        totalAmount: lot.deal?.totalAmount ?? '',
        preEmdAmount: lot.preEmdAmount ?? lot.deal?.preEmdAmount ?? '',
        dealClosedAt: lot.deal?.dealClosedAt
          ? String(lot.deal.dealClosedAt).slice(0, 16)
          : '',
        paymentDueDate: lot.deal?.paymentDueDate
          ? String(lot.deal.paymentDueDate).slice(0, 10)
          : undefined,
      };
    });
    setOutcomeForms(initial);
  }, [open, editableLots]);

  const outcomeMutation = useMutation({
    mutationFn: (payload) => auctionsApi.updateLotOutcome(auctionId, payload),
    onSuccess: () => {
      toast.success('Lot status updated');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Update failed'),
  });

  const handleSaveOutcome = () => {
    const lotsPayload = Object.values(outcomeForms).map((form) => ({
      lotId: form.lotId,
      outcomeStatus: form.outcomeStatus,
      ...(form.outcomeStatus === 'DEAL_DONE'
        ? {
            totalAmount: Number(form.totalAmount),
            preEmdAmount: form.preEmdAmount !== '' ? Number(form.preEmdAmount) : undefined,
            dealClosedAt: form.dealClosedAt
              ? new Date(form.dealClosedAt).toISOString()
              : undefined,
            paymentDueDate: form.paymentDueDate || undefined,
          }
        : {}),
    }));
    if (!lotsPayload.length) {
      toast.error('No editable lots to update');
      return;
    }
    outcomeMutation.mutate({ lots: lotsPayload });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (actionType) {
      case LIFECYCLE_ACTIONS.UPDATE_LOT_STATUS:
        return (
          <Box>
            {lockedLots.map((lot) => (
              <LotAccordionPanel key={lot._id || lot.id} lot={lot} subtitle="Saved — read only">
                <LotOutcomeFields lot={lot} value={{ outcomeStatus: lot.outcomeStatus }} disabled />
              </LotAccordionPanel>
            ))}
            {editableLots.map((lot) => {
              const id = lot._id || lot.id;
              return (
                <LotAccordionPanel key={id} lot={lot} subtitle="Editable">
                  <LotOutcomeFields
                    lot={lot}
                    value={outcomeForms[id]}
                    onChange={(next) => setOutcomeForms((p) => ({ ...p, [id]: { ...next, lotId: id } }))}
                  />
                </LotAccordionPanel>
              );
            })}
            {!editableLots.length && !lockedLots.length && (
              <span style={{ color: '#666' }}>No lots found.</span>
            )}
          </Box>
        );
      case LIFECYCLE_ACTIONS.UPDATE_PAYMENT:
        return <LotPaymentPanel lots={lots} auctionId={auctionId} />;
      case LIFECYCLE_ACTIONS.UPDATE_DELIVERY:
        return <LotDeliveryPanel lots={lots} auction={auction} auctionId={auctionId} />;
      case LIFECYCLE_ACTIONS.ADD_GATE_PASS:
        return <LotGatePassPanel lots={lots} auctionId={auctionId} />;
      case LIFECYCLE_ACTIONS.ADD_RCM:
        return <LotRcmPanel lots={lots} auctionId={auctionId} />;
      default:
        return null;
    }
  };

  const showSave = actionType === LIFECYCLE_ACTIONS.UPDATE_LOT_STATUS && editableLots.length > 0;

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title={MODAL_TITLES[actionType] || ACTION_LABELS[actionType] || 'Lot lifecycle'}
      maxWidth="lg"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onClose}>Close</Button>
          {showSave && (
            <Button
              variant="contained"
              onClick={handleSaveOutcome}
              disabled={outcomeMutation.isPending}
            >
              {outcomeMutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          )}
          {actionType !== LIFECYCLE_ACTIONS.UPDATE_LOT_STATUS && (
            <Button variant="text" onClick={() => refetch()}>Refresh</Button>
          )}
        </Box>
      }
    >
      {auctionId && (
        <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
          <AuthorizationLetterStatus
            auctionId={auctionId}
            onCreate={() => onCreateAuthLetter?.(auctionId)}
            onView={onViewAuthLetter}
            onDownload={onDownloadAuthLetter}
          />
        </Box>
      )}
      {renderContent()}
    </NormalModal>
  );
};

export default LotLifecycleModal;
