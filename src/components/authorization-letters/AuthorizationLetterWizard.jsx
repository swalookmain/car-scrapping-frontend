import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import NormalModal from '../../ui/NormalModal';
import { authorizationLettersApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import tokenStorage from '../../services/tokenStorage';

const STEPS = ['Select auction', 'Letter details', 'Preview & download'];

const AuthorizationLetterWizard = ({ open, onClose, preselectedAuctionId = null }) => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAuctionId, setSelectedAuctionId] = useState('');
  const [letterId, setLetterId] = useState('');
  const [form, setForm] = useState({
    extensionDays: 3,
    recipientName: '',
    recipientAddress: '',
    recipientPinCode: '',
    buyerReferenceNumber: '',
  });
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const { data: eligibleData, isLoading: loadingEligible } = useQuery({
    queryKey: ['auth-letter-eligible-auctions'],
    queryFn: () => authorizationLettersApi.getEligibleAuctions(),
    enabled: open,
  });

  const eligibleAuctions = eligibleData?.data ?? eligibleData ?? [];

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setLetterId('');
    setPreviewHtml('');
    if (preselectedAuctionId) {
      setSelectedAuctionId(preselectedAuctionId);
    } else {
      setSelectedAuctionId('');
    }
    setForm({
      extensionDays: 3,
      recipientName: '',
      recipientAddress: '',
      recipientPinCode: '',
      buyerReferenceNumber: '',
    });
  }, [open, preselectedAuctionId]);

  useEffect(() => {
    if (!selectedAuctionId) return;
    const auction = eligibleAuctions.find(
      (a) => (a._id || a.id) === selectedAuctionId,
    );
    if (!auction) return;
    setForm((prev) => ({
      ...prev,
      recipientName: auction.sellerEntityName || auction.sellerName || prev.recipientName,
      recipientAddress:
        [auction.auctionLocation || auction.vehicleLocation, auction.city, auction.state]
          .filter(Boolean)
          .join(', ') || prev.recipientAddress,
      buyerReferenceNumber: auction.buyerReferenceNumber || prev.buyerReferenceNumber,
    }));
  }, [selectedAuctionId, eligibleAuctions]);

  const createMutation = useMutation({
    mutationFn: (payload) => authorizationLettersApi.create(payload),
    onSuccess: (res) => {
      const letter = res?.data ?? res;
      const id = letter?._id || letter?.id;
      setLetterId(id);
      toast.success('Authorization letter draft created');
      queryClient.invalidateQueries({ queryKey: ['authorization-letters'] });
      setActiveStep(2);
      loadPreview(id);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create letter'),
  });

  const loadPreview = async (id) => {
    if (!id) return;
    setLoadingPreview(true);
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(authorizationLettersApi.getPreviewUrl(id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const html = await response.text();
      setPreviewHtml(html);
    } catch {
      toast.error('Failed to load preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCreate = () => {
    if (!selectedAuctionId) {
      toast.error('Select an auction');
      return;
    }
    createMutation.mutate({
      auctionId: selectedAuctionId,
      extensionDays: Number(form.extensionDays) || 3,
      recipientOverrides: {
        recipientName: form.recipientName || undefined,
        recipientAddress: form.recipientAddress || undefined,
        recipientPinCode: form.recipientPinCode || undefined,
        buyerReferenceNumber: form.buyerReferenceNumber || undefined,
      },
    });
  };

  const handleDownload = async () => {
    if (!letterId) return;
    try {
      const letter = await authorizationLettersApi.getById(letterId);
      const data = letter?.data ?? letter;
      await authorizationLettersApi.downloadPdf(
        letterId,
        `${data?.letterNumber || 'authorization-letter'}.pdf`,
      );
      toast.success('PDF downloaded');
      queryClient.invalidateQueries({ queryKey: ['authorization-letters'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'PDF download failed');
    }
  };

  const renderStep = () => {
    if (loadingEligible) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (activeStep === 0) {
      return (
        <TextField
          select
          fullWidth
          label="Eligible auction"
          value={selectedAuctionId}
          onChange={(e) => setSelectedAuctionId(e.target.value)}
          sx={inputSx}
        >
          {eligibleAuctions.length === 0 && (
            <MenuItem value="" disabled>No eligible auctions</MenuItem>
          )}
          {eligibleAuctions.map((auction) => (
            <MenuItem key={auction._id || auction.id} value={auction._id || auction.id}>
              {auction.auctionNumber} — {auction.sellerName || auction.sellerEntityName || 'Seller'}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (activeStep === 1) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Extension days"
              value={form.extensionDays}
              onChange={(e) => setForm((p) => ({ ...p, extensionDays: e.target.value }))}
              sx={inputSx}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Buyer reference number"
              value={form.buyerReferenceNumber}
              onChange={(e) => setForm((p) => ({ ...p, buyerReferenceNumber: e.target.value }))}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recipient name"
              value={form.recipientName}
              onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recipient address"
              value={form.recipientAddress}
              onChange={(e) => setForm((p) => ({ ...p, recipientAddress: e.target.value }))}
              sx={inputSx}
              multiline
              minRows={2}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Recipient PIN code"
              value={form.recipientPinCode}
              onChange={(e) => setForm((p) => ({ ...p, recipientPinCode: e.target.value }))}
              sx={inputSx}
            />
          </Grid>
        </Grid>
      );
    }

    return (
      <Box>
        {loadingPreview ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Box
            sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              height: 420,
              overflow: 'auto',
              bgcolor: '#fff',
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}
      </Box>
    );
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedAuctionId) {
        toast.error('Select an auction');
        return;
      }
      setActiveStep(1);
      return;
    }
    if (activeStep === 1) {
      handleCreate();
      return;
    }
    handleDownload();
  };

  const nextLabel =
    activeStep === 1 ? (createMutation.isPending ? 'Creating...' : 'Create & preview') : activeStep === 2 ? 'Download PDF' : 'Next';

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title="Create authorization letter"
      maxWidth="lg"
      actions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          {activeStep > 0 && activeStep < 2 && (
            <Button onClick={() => setActiveStep((s) => s - 1)}>Back</Button>
          )}
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={createMutation.isPending || (activeStep === 0 && !eligibleAuctions.length)}
          >
            {nextLabel}
          </Button>
        </Box>
      }
    >
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {renderStep()}
    </NormalModal>
  );
};

export default AuthorizationLetterWizard;
