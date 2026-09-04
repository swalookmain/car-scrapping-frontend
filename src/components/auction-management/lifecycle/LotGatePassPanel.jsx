import React, { useState } from 'react';
import { validateFileSize, MAX_FILE_SIZE_LABEL } from '../../../utils/fileValidation';
import { Box, Button, IconButton, Link, TextField, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LotAccordionPanel from './LotAccordionPanel';
import inputSx from '../../../services/inputStyles';
import { auctionsApi } from '../../../services/api';
import UploadStatusBadge, { useUploadStatus } from '../../common/UploadStatusBadge';

const LotGatePassForm = ({ lot, auctionId }) => {
  const queryClient = useQueryClient();
  const [gatePassDate, setGatePassDate] = useState(
    lot.gatePass?.gatePassDate ? String(lot.gatePass.gatePassDate).slice(0, 10) : '',
  );
  const [file, setFile] = useState(null);
  const { status: uploadStatus, progress: uploadProgress, startUpload, finishUpload } = useUploadStatus();

  const mutation = useMutation({
    mutationFn: (formData) => auctionsApi.uploadGatePass(lot._id || lot.id, formData),
    onMutate: () => startUpload(),
    onSuccess: () => {
      finishUpload(true);
      toast.success('Gate pass uploaded');
      queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
      setFile(null);
    },
    onError: (err) => {
      finishUpload(false);
      toast.error(err?.response?.data?.message || 'Upload failed');
    },
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
        {/* Status row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'var(--color-grey-500)' }}>
            📎 Accepted: Image / PDF &nbsp;·&nbsp; Max {MAX_FILE_SIZE_LABEL}
          </Typography>
          <UploadStatusBadge status={uploadStatus} progress={uploadProgress} />
        </Box>

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Current document:{' '}
              <Link href={lot.gatePassDocumentUrl} target="_blank" rel="noopener">
                View gate pass
              </Link>
            </Typography>
            <Tooltip title="Delete uploaded file">
              <IconButton
                size="small"
                color="error"
                onClick={async () => {
                  try {
                    await auctionsApi.deleteGatePassFile(lot._id || lot.id);
                    toast.success('Gate pass file deleted');
                    queryClient.invalidateQueries({ queryKey: ['auction-lifecycle', auctionId] });
                  } catch (err) {
                    toast.error(err?.response?.data?.message || 'Failed to delete');
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        <Button component="label" variant="outlined" sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
          {file ? file.name : `Upload image / PDF (Max ${MAX_FILE_SIZE_LABEL})`}
          <input
            type="file"
            hidden
            accept="image/*,.pdf"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f && !validateFileSize(f)) { e.target.value = ''; return; }
              setFile(f);
            }}
          />
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={mutation.isPending}
          sx={{ alignSelf: 'flex-end', textTransform: 'none' }}
        >
          {mutation.isPending ? 'Uploading…' : 'Save gate pass'}
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
