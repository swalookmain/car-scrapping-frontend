import React, { useState } from 'react';
import { validateFileSize, MAX_FILE_SIZE_LABEL } from '../../utils/fileValidation';
import PropTypes from 'prop-types';
import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import inputSx from '../../services/inputStyles';
import NormalModal from '../../ui/NormalModal';
import UploadStatusBadge, { useUploadStatus } from '../common/UploadStatusBadge';
import toast from 'react-hot-toast';

const DOCUMENT_ACCEPT = '.jpg,.jpeg,.png,.pdf';
const IMAGE_ACCEPT = '.jpg,.jpeg,.png';
const INITIAL_FILES = {
  vehicleFront: null,
  vehicleRight: null,
  vehicleEngine: null,
  vehicleLeft: null,
  vehicleBack: null,
  vehicleInterior: null,
  rcFront: null,
  rcBack: null,
  aadhaarFront: null,
  aadhaarBack: null,
  pan: null,
  bankDetail: null,
};

// ── Info bar shared style ────────────────────────────────────────────────────
const InfoBar = () => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      px: 1.25,
      py: 0.5,
      mb: 1.5,
      borderRadius: '6px',
      backgroundColor: 'rgba(99,102,241,0.07)',
      border: '1px solid rgba(99,102,241,0.18)',
    }}
  >
    <Typography variant="caption" sx={{ color: 'var(--color-grey-600)', fontWeight: 500 }}>
      📎 Accepted: JPG, PNG, PDF &nbsp;·&nbsp; Max {MAX_FILE_SIZE_LABEL} per file
    </Typography>
  </Box>
);

export default function LeadDocumentFormV2({ open, onClose, onSubmit, leadName, leadDetails }) {
  const [aadhaarPageMode, setAadhaarPageMode] = useState('single');
  const [rcPageMode, setRcPageMode] = useState('single');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [meta, setMeta] = useState({});
  const { status, progress, startUpload, finishUpload } = useUploadStatus();

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('aadhaarPageMode', aadhaarPageMode);
    formData.append('rcPageMode', rcPageMode);
    Object.entries(files).forEach(([k, v]) => v && formData.append(k, v));

    const hasFiles = Object.values(files).some(Boolean);
    if (hasFiles) startUpload();
    try {
      await onSubmit(formData, meta);
      if (hasFiles) finishUpload(true);
      setFiles(INITIAL_FILES);
      setMeta({});
      onClose();
    } catch {
      if (hasFiles) finishUpload(false);
      toast.error('Upload failed. Please try again.');
    }
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title={`Lead Document Section${leadName ? ` - ${leadName}` : ''}`}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={status === 'uploading'}>
            {status === 'uploading' ? 'Uploading…' : 'Save Documents'}
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Header row with upload status */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2">
            Upload happens after lead creation.
          </Typography>
          <UploadStatusBadge status={status} progress={progress} />
        </Box>
        <InfoBar />

        <Grid container spacing={2}>
          {[
            ['vehicleFront', 'Vehicle Front', IMAGE_ACCEPT],
            ['vehicleRight', 'Vehicle Right', IMAGE_ACCEPT],
            ['vehicleEngine', 'Vehicle Engine', IMAGE_ACCEPT],
            ['vehicleLeft', 'Vehicle Left', IMAGE_ACCEPT],
            ['vehicleBack', 'Vehicle Back', IMAGE_ACCEPT],
            ['vehicleInterior', 'Vehicle Interior', IMAGE_ACCEPT],
          ].map(([key, label, accept]) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                type="file"
                label={label}
                fullWidth
                sx={inputSx}
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept, capture: 'environment' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && !validateFileSize(f)) { e.target.value = ''; return; }
                  setFiles((p) => ({ ...p, [key]: f || null }));
                }}
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6}>
            <TextField select label="RC Page Mode" value={rcPageMode} fullWidth sx={inputSx} onChange={(e) => setRcPageMode(e.target.value)}>
              <MenuItem value="single">One Page</MenuItem>
              <MenuItem value="double">Two Pages</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField type="file" label="RC Front / Single" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => { const f = e.target.files?.[0]; if (f && !validateFileSize(f)) { e.target.value = ''; return; } setFiles((p) => ({ ...p, rcFront: f || null })); }} />
          </Grid>
          {rcPageMode === 'double' && (
            <Grid item xs={12} sm={6}>
              <TextField type="file" label="RC Back" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => { const f = e.target.files?.[0]; if (f && !validateFileSize(f)) { e.target.value = ''; return; } setFiles((p) => ({ ...p, rcBack: f || null })); }} />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField select label="Aadhaar Page Mode" value={aadhaarPageMode} fullWidth sx={inputSx} onChange={(e) => setAadhaarPageMode(e.target.value)}>
              <MenuItem value="single">One Page</MenuItem>
              <MenuItem value="double">Two Pages</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField type="file" label="Aadhaar Front / Single" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => { const f = e.target.files?.[0]; if (f && !validateFileSize(f)) { e.target.value = ''; return; } setFiles((p) => ({ ...p, aadhaarFront: f || null })); }} />
          </Grid>
          {aadhaarPageMode === 'double' && (
            <Grid item xs={12} sm={6}>
              <TextField type="file" label="Aadhaar Back" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => { const f = e.target.files?.[0]; if (f && !validateFileSize(f)) { e.target.value = ''; return; } setFiles((p) => ({ ...p, aadhaarBack: f || null })); }} />
            </Grid>
          )}

          <Grid item xs={12} sm={6}><TextField label="Aadhaar Number" defaultValue={leadDetails?.aadhaarNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, aadhaarNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Mobile linked with Aadhaar" defaultValue={leadDetails?.aadhaarLinkedMobileNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, aadhaarLinkedMobileNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Email ID" defaultValue={leadDetails?.email || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, email: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Bank Account Number" defaultValue={leadDetails?.bankAccountNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankAccountNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="IFSC Code" defaultValue={leadDetails?.bankIfscCode || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankIfscCode: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Branch Name" defaultValue={leadDetails?.bankBranchName || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankBranchName: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Bank Name" defaultValue={leadDetails?.bankName || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankName: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField type="file" label="Bank Proof Upload" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT }} onChange={(e) => { const f = e.target.files?.[0]; if (f && !validateFileSize(f)) { e.target.value = ''; return; } setFiles((p) => ({ ...p, bankDetail: f || null })); }} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="PAN Number" defaultValue={leadDetails?.panNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, panNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField type="file" label="PAN Upload" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT }} onChange={(e) => { const f = e.target.files?.[0]; if (f && !validateFileSize(f)) { e.target.value = ''; return; } setFiles((p) => ({ ...p, pan: f || null })); }} /></Grid>
        </Grid>
      </Box>
    </NormalModal>
  );
}

LeadDocumentFormV2.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  leadName: PropTypes.string,
  leadDetails: PropTypes.object,
};
