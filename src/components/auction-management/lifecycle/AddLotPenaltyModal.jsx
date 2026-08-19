import React, { useState } from 'react';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import NormalModal from '../../../ui/NormalModal';
import inputSx from '../../../services/inputStyles';
import { formatINR } from '../../../services/taxEngine';
import { auctionsApi } from '../../../services/api';

const AddLotPenaltyModal = ({ open, onClose, lot, auctionId }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [bank, setBank] = useState('');
  const [remark, setRemark] = useState('');
  const lotId = lot?._id || lot?.id;
  const currentPenalty = lot?.payment?.penaltyAmount ?? 0;
  const balance = lot?.deal?.balanceAmount ?? 0;

  const resetForm = () => {
    setAmount('');
    setTransactionNumber('');
    setBank('');
    setRemark('');
  };

  const mutation = useMutation({
    mutationFn: (payload) => auctionsApi.addLotPenalty(lotId, payload),
    onSuccess: () => {
      toast.success('Penalty recorded as paid');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      resetForm();
      onClose();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to add penalty');
    },
  });

  const handleSubmit = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error('Enter a valid penalty amount');
      return;
    }
    mutation.mutate({
      amount: value,
      transactionNumber: transactionNumber.trim() || undefined,
      bank: bank.trim() || undefined,
      remark: remark.trim() || undefined,
    });
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title={`Add penalty — Lot ${lot?.lotNumber || ''}`}
      maxWidth="sm"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={mutation.isPending || !amount}
            startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <GavelIcon />}
          >
            {mutation.isPending ? 'Saving...' : 'Add penalty'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Balance due {formatINR(balance)}
          {currentPenalty > 0 ? ` · Penalty paid so far ${formatINR(currentPenalty)}` : ''}
          . Penalty is already paid — it adds to total/paid, not to left to pay.
        </Typography>
        <TextField
          fullWidth
          type="number"
          label="Penalty amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 0.01, step: '0.01' }}
          sx={inputSx}
        />
        <TextField
          fullWidth
          label="Transaction number"
          value={transactionNumber}
          onChange={(e) => setTransactionNumber(e.target.value)}
          sx={inputSx}
        />
        <TextField
          fullWidth
          label="Bank name"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          sx={inputSx}
        />
        <TextField
          fullWidth
          label="Remark (optional)"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          multiline
          rows={2}
          sx={inputSx}
        />
      </Box>
    </NormalModal>
  );
};

export default AddLotPenaltyModal;
