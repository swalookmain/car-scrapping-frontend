import React, { useState } from 'react';
import { Box, Button, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LotAccordionPanel from './LotAccordionPanel';
import OfficerFieldsGroup from './OfficerFieldsGroup';
import { minFutureDate } from './lotLifecycleConstants';
import inputSx from '../../../services/inputStyles';
import { auctionsApi } from '../../../services/api';

const LotDeliveryForm = ({ lot, auction, auctionId, readOnly }) => {
  const queryClient = useQueryClient();
  const [deliveryOrderNumber, setDeliveryOrderNumber] = useState(lot.delivery?.deliveryOrderNumber || '');
  const [lastLiftingDate, setLastLiftingDate] = useState(
    lot.delivery?.lastLiftingDate ? String(lot.delivery.lastLiftingDate).slice(0, 10) : '',
  );
  const [officers, setOfficers] = useState(
    lot.delivery?.officers?.length
      ? lot.delivery.officers
      : auction?.officers?.length
        ? auction.officers
        : [{ name: '', email: '', phoneNumber: '', officerType: 'MSTC' }],
  );
  const [finalApproval, setFinalApproval] = useState(
    lot.delivery?.finalApprovalForLifting ? 'yes' : 'no',
  );

  const mutation = useMutation({
    mutationFn: (payload) => auctionsApi.updateLotDelivery(lot._id || lot.id, payload),
    onSuccess: () => {
      toast.success('Delivery details saved');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Save failed'),
  });

  const handleSave = () => {
    mutation.mutate({
      deliveryOrderNumber: deliveryOrderNumber || undefined,
      lastLiftingDate: lastLiftingDate || undefined,
      officers,
      finalApprovalForLifting: finalApproval === 'yes',
    });
  };

  if (readOnly) {
    return (
      <LotAccordionPanel lot={lot}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span>DO: {lot.delivery?.deliveryOrderNumber || '—'}</span>
          <span>Lifting by: {lot.delivery?.lastLiftingDate ? new Date(lot.delivery.lastLiftingDate).toLocaleDateString() : '—'}</span>
          <span>Final approval: {lot.delivery?.finalApprovalForLifting ? 'Yes' : 'No'}</span>
        </Box>
      </LotAccordionPanel>
    );
  }

  return (
    <LotAccordionPanel lot={lot}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField fullWidth label="Delivery order number" value={deliveryOrderNumber} onChange={(e) => setDeliveryOrderNumber(e.target.value)} sx={inputSx} />
        <TextField
          fullWidth
          type="date"
          label="Last date of lifting"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minFutureDate() }}
          value={lastLiftingDate}
          onChange={(e) => setLastLiftingDate(e.target.value)}
          sx={inputSx}
        />
        <OfficerFieldsGroup officers={officers} onChange={setOfficers} />
        <RadioGroup row value={finalApproval} onChange={(e) => setFinalApproval(e.target.value)}>
          <FormControlLabel value="yes" label="Final approval for lifting — Yes" control={<Radio />} />
          <FormControlLabel value="no" label="No" control={<Radio />} />
        </RadioGroup>
        <Button variant="contained" onClick={handleSave} disabled={mutation.isPending} sx={{ alignSelf: 'flex-end', textTransform: 'none' }}>
          Save delivery
        </Button>
      </Box>
    </LotAccordionPanel>
  );
};

const LotDeliveryPanel = ({ lots, auction, auctionId }) => {
  const paidLots = lots.filter((l) => l.payment?.paymentStatus === 'PAID');
  if (!paidLots.length) {
    return <span style={{ color: '#666' }}>No fully paid lots yet.</span>;
  }
  return (
    <Box>
      {paidLots.map((lot) => (
        <LotDeliveryForm key={lot._id || lot.id} lot={lot} auction={auction} auctionId={auctionId} />
      ))}
    </Box>
  );
};

export default LotDeliveryPanel;
