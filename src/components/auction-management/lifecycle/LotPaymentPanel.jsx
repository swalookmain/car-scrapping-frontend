import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import AmountSummaryChips from './AmountSummaryChips';
import LotAccordionPanel from './LotAccordionPanel';
import RecordLotPaymentModal from './RecordLotPaymentModal';
import { PAYMENT_STATUS_COLORS } from './lotLifecycleConstants';
import { formatINR } from '../../../services/taxEngine';
import inputSx from '../../../services/inputStyles';
import { auctionsApi } from '../../../services/api';

const AcceptanceLetterFields = ({ lot, auctionId, disabled }) => {
  const queryClient = useQueryClient();
  const [received, setReceived] = useState(lot.acceptanceLetter?.received ? 'yes' : 'no');
  const [letterNumber, setLetterNumber] = useState(lot.acceptanceLetter?.letterNumber || '');
  const [receivedDate, setReceivedDate] = useState(
    lot.acceptanceLetter?.receivedDate ? String(lot.acceptanceLetter.receivedDate).slice(0, 10) : '',
  );

  const mutation = useMutation({
    mutationFn: (payload) => auctionsApi.updateAcceptanceLetter(lot._id || lot.id, payload),
    onSuccess: () => {
      toast.success('Acceptance letter updated');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Update failed'),
  });

  if (lot.payment?.paymentStatus !== 'PAID') return null;

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Acceptance letter
      </Typography>
      <RadioGroup row value={received} onChange={(e) => setReceived(e.target.value)}>
        <FormControlLabel value="yes" label="Received" control={<Radio />} disabled={disabled} />
        <FormControlLabel value="no" label="Not received" control={<Radio />} disabled={disabled} />
      </RadioGroup>
      {received === 'yes' && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
          <TextField label="Letter number" value={letterNumber} onChange={(e) => setLetterNumber(e.target.value)} disabled={disabled} sx={{ ...inputSx, flex: 1 }} />
          <TextField type="date" label="Received date" InputLabelProps={{ shrink: true }} value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} disabled={disabled} sx={{ ...inputSx, flex: 1 }} />
        </Box>
      )}
      {!disabled && (
        <Button
          size="small"
          variant="outlined"
          sx={{ mt: 1, textTransform: 'none' }}
          onClick={() => {
            if (received === 'yes' && (!letterNumber || !receivedDate)) {
              toast.error('Letter number and date required');
              return;
            }
            mutation.mutate({
              received: received === 'yes',
              letterNumber: received === 'yes' ? letterNumber : undefined,
              receivedDate: received === 'yes' ? receivedDate : undefined,
            });
          }}
        >
          Save acceptance letter
        </Button>
      )}
      {disabled && lot.acceptanceLetter?.received && (
        <Typography variant="body2" color="text.secondary">
          #{lot.acceptanceLetter.letterNumber} — {lot.acceptanceLetter.receivedDate ? new Date(lot.acceptanceLetter.receivedDate).toLocaleDateString() : ''}
        </Typography>
      )}
    </Box>
  );
};

const LotPaymentPanel = ({ lots, auctionId, readOnly = false }) => {
  const [paymentLot, setPaymentLot] = useState(null);
  const dealDoneLots = lots.filter((l) => l.outcomeStatus === 'DEAL_DONE');

  if (!dealDoneLots.length) {
    return <Typography color="text.secondary">No deal-done lots for payment.</Typography>;
  }

  return (
    <Box>
      {dealDoneLots.map((lot) => {
        const payColors = PAYMENT_STATUS_COLORS[lot.payment?.paymentStatus] || PAYMENT_STATUS_COLORS.NOT_PAID;
        const balance = lot.deal?.balanceAmount ?? 0;
        const paid = lot.payment?.amountPaidTotal ?? 0;
        const left = lot.payment?.amountLeft ?? balance;

        return (
          <LotAccordionPanel key={lot._id || lot.id} lot={lot}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Chip label={(lot.payment?.paymentStatus || 'NOT_PAID').replace(/_/g, ' ')} size="small" sx={{ bgcolor: payColors.bg, color: payColors.color }} />
              {!readOnly && (
                <Button size="small" startIcon={<AddIcon />} onClick={() => setPaymentLot(lot)} sx={{ textTransform: 'none' }}>
                  Add payment
                </Button>
              )}
            </Box>
            <AmountSummaryChips total={balance} paid={paid} outstanding={left} labels={{ total: 'Balance due', paid: 'Paid', outstanding: 'Left to pay' }} />
            {lot.payments?.length > 0 && (
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Txn #</TableCell>
                    <TableCell>Bank</TableCell>
                    <TableCell>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lot.payments.map((p) => (
                    <TableRow key={p._id || p.id}>
                      <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{formatINR(p.amountPaid)}</TableCell>
                      <TableCell>{p.transactionNumber || '—'}</TableCell>
                      <TableCell>{p.bank || '—'}</TableCell>
                      <TableCell>{p.remark || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <AcceptanceLetterFields lot={lot} auctionId={auctionId} disabled={readOnly || left > 0} />
          </LotAccordionPanel>
        );
      })}
      {paymentLot && (
        <RecordLotPaymentModal
          open={Boolean(paymentLot)}
          onClose={() => setPaymentLot(null)}
          lot={paymentLot}
          auctionId={auctionId}
        />
      )}
    </Box>
  );
};

export default LotPaymentPanel;
