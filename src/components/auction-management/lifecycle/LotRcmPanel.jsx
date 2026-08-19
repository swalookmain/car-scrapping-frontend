import React, { useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LotAccordionPanel from './LotAccordionPanel';
import inputSx from '../../../services/inputStyles';
import { auctionsApi } from '../../../services/api';
import { formatINR } from '../../../services/taxEngine';

const LotRcmForm = ({ lot, auctionId, readOnly }) => {
  const queryClient = useQueryClient();
  const lotId = String(lot._id || lot.id || '');
  const [challanNumber, setChallanNumber] = useState(lot.rcm?.challanNumber || '');
  const [transactionDate, setTransactionDate] = useState(
    lot.rcm?.transactionDate ? String(lot.rcm.transactionDate).slice(0, 10) : '',
  );
  const [amount, setAmount] = useState(
    lot.rcm?.amount != null && lot.rcm?.amount !== '' ? String(lot.rcm.amount) : '',
  );

  const mutation = useMutation({
    mutationFn: (payload) => auctionsApi.updateLotRcm(lotId, payload),
    onSuccess: () => {
      toast.success('RCM details saved');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      toast.error(
        text ||
          (err?.message === 'Network Error'
            ? 'Could not reach server. Confirm API is running, then retry.'
            : 'Failed to save RCM'),
      );
    },
  });

  const handleSave = () => {
    if (!lotId || lotId === 'undefined') {
      toast.error('Lot id missing. Close and reopen this dialog.');
      return;
    }
    if (!challanNumber.trim() && !transactionDate && amount === '') {
      toast.error('Enter challan number, date, or amount');
      return;
    }
    mutation.mutate({
      ...(challanNumber.trim() ? { challanNumber: challanNumber.trim() } : {}),
      ...(transactionDate ? { transactionDate } : {}),
      ...(amount !== '' && !Number.isNaN(Number(amount))
        ? { amount: Number(amount) }
        : {}),
    });
  };

  if (readOnly && lot.rcm?.challanNumber) {
    return (
      <LotAccordionPanel lot={lot}>
        Challan: {lot.rcm.challanNumber} · {formatINR(lot.rcm.amount)} ·{' '}
        {lot.rcm.transactionDate ? new Date(lot.rcm.transactionDate).toLocaleDateString() : ''}
      </LotAccordionPanel>
    );
  }

  return (
    <LotAccordionPanel lot={lot}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Challan number"
          value={challanNumber}
          onChange={(e) => setChallanNumber(e.target.value)}
          disabled={readOnly}
          sx={inputSx}
        />
        <TextField
          fullWidth
          type="date"
          label="Transaction date"
          InputLabelProps={{ shrink: true }}
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          disabled={readOnly}
          sx={inputSx}
        />
        <TextField
          fullWidth
          type="number"
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={readOnly}
          inputProps={{ min: 0, step: '0.01' }}
          sx={inputSx}
        />
        {!readOnly && (
          <Button
            variant="contained"
            sx={{ alignSelf: 'flex-end', textTransform: 'none' }}
            disabled={mutation.isPending}
            onClick={handleSave}
          >
            {mutation.isPending ? 'Saving...' : 'Save RCM'}
          </Button>
        )}
      </Box>
    </LotAccordionPanel>
  );
};

const LotRcmPanel = ({ lots, auctionId }) => {
  const dealDoneLots = lots.filter((l) => l.outcomeStatus === 'DEAL_DONE');
  if (!dealDoneLots.length) return <span style={{ color: '#666' }}>No deal-done lots.</span>;
  return (
    <Box>
      {dealDoneLots.map((lot) => (
        <LotRcmForm
          key={lot._id || lot.id}
          lot={{ ...lot, locked: false }}
          auctionId={auctionId}
          readOnly={false}
        />
      ))}
    </Box>
  );
};

export default LotRcmPanel;
