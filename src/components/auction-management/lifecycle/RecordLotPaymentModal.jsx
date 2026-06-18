import React, { useState } from 'react';
import { Box, Button, CircularProgress, TextField } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import NormalModal from '../../../ui/NormalModal';
import inputSx from '../../../services/inputStyles';
import { formatINR } from '../../../services/taxEngine';
import { auctionsApi } from '../../../services/api';

const RecordLotPaymentModal = ({ open, onClose, lot, auctionId }) => {
  const queryClient = useQueryClient();
  const [amountPaid, setAmountPaid] = useState('');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [bank, setBank] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [remark, setRemark] = useState('');

  const outstanding = lot?.payment?.amountLeft ?? lot?.deal?.balanceAmount ?? 0;
  const lotId = lot?._id || lot?.id;

  const mutation = useMutation({
    mutationFn: (payload) => auctionsApi.recordLotPayment(lotId, payload),
    onSuccess: () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      resetForm();
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    },
  });

  const resetForm = () => {
    setAmountPaid('');
    setTransactionNumber('');
    setBank('');
    setTransferDate(new Date().toISOString().slice(0, 10));
    setRemark('');
  };

  const handleSubmit = () => {
    const amount = Number(amountPaid);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > outstanding) {
      toast.error(`Cannot exceed outstanding ${formatINR(outstanding)}`);
      return;
    }
    mutation.mutate({
      amountPaid: amount,
      transactionNumber: transactionNumber || undefined,
      bank: bank || undefined,
      transferDate: transferDate || undefined,
      remark: remark || undefined,
    });
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title={`Record payment — Lot ${lot?.lotNumber || ''}`}
      maxWidth="sm"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={mutation.isPending || !amountPaid}
            startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PaymentIcon />}
          >
            {mutation.isPending ? 'Saving...' : 'Record payment'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
        <TextField
          fullWidth
          type="number"
          label="Amount paid"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          sx={inputSx}
        />
        <TextField
          fullWidth
          label="Amount left to pay"
          value={formatINR(outstanding)}
          InputProps={{ readOnly: true }}
          sx={inputSx}
        />
        <TextField fullWidth label="Transaction number" value={transactionNumber} onChange={(e) => setTransactionNumber(e.target.value)} sx={inputSx} />
        <TextField fullWidth label="Bank" value={bank} onChange={(e) => setBank(e.target.value)} sx={inputSx} />
        <TextField fullWidth type="date" label="Date of transfer" InputLabelProps={{ shrink: true }} value={transferDate} onChange={(e) => setTransferDate(e.target.value)} sx={inputSx} />
        <TextField fullWidth label="Remark" value={remark} onChange={(e) => setRemark(e.target.value)} multiline rows={2} sx={inputSx} />
      </Box>
    </NormalModal>
  );
};

export default RecordLotPaymentModal;
