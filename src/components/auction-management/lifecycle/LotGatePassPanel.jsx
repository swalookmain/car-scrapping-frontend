import React, { useState } from 'react';
import { Box, Button, Link, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LotAccordionPanel from './LotAccordionPanel';
import inputSx from '../../../services/inputStyles';
import { auctionsApi } from '../../../services/api';

const LotGatePassForm = ({ lot, auctionId }) => {
  const queryClient = useQueryClient();
  const [gatePassDate, setGatePassDate] = useState(
    lot.gatePass?.gatePassDate ? String(lot.gatePass.gatePassDate).slice(0, 10) : '',
  );
  const [file, setFile] = useState(null);

  const mutation = useMutation({
    mutationFn: (formData) => auctionsApi.uploadGatePass(lot._id || lot.id, formData),
    onSuccess: () => {
      toast.success('Gate pass uploaded');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
      setFile(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Upload failed'),
  });

  const handleSubmit = () => {
    if (!gatePassDate) {
      toast.error('Gate pass date is required');
      return;
    }
    if (!file && !lot.gatePassDocumentUrl) {
      toast.error('Please upload a file');
      return;
    }
    const formData = new FormData();
    formData.append('gatePassDate', gatePassDate);
    if (file) formData.append('file', file);
    mutation.mutate(formData);
  };

  return (
    <LotAccordionPanel lot={lot}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          type="date"
          label="Date of gate pass"
          InputLabelProps={{ shrink: true }}
          value={gatePassDate}
          onChange={(e) => setGatePassDate(e.target.value)}
          sx={inputSx}
        />
        {lot.gatePassDocumentUrl && (
          <Typography variant="body2">
            Current document:{' '}
            <Link href={lot.gatePassDocumentUrl} target="_blank" rel="noopener">
              View gate pass
            </Link>
          </Typography>
        )}
        <Button component="label" variant="outlined" sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
          {file ? file.name : 'Upload image / PDF'}
          <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending} sx={{ alignSelf: 'flex-end', textTransform: 'none' }}>
          Save gate pass
        </Button>
      </Box>
    </LotAccordionPanel>
  );
};

const LotGatePassPanel = ({ lots, auctionId }) => {
  const paidLots = lots.filter((l) => l.payment?.paymentStatus === 'PAID');
  if (!paidLots.length) return <Typography color="text.secondary">Available after payment is complete.</Typography>;
  return (
    <Box>
      {paidLots.map((lot) => (
        <LotGatePassForm key={lot._id || lot.id} lot={lot} auctionId={auctionId} />
      ))}
    </Box>
  );
};

export default LotGatePassPanel;
