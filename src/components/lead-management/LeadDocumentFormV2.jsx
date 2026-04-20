import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import inputSx from '../../services/inputStyles';
import NormalModal from '../../ui/NormalModal';

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

export default function LeadDocumentFormV2({ open, onClose, onSubmit, leadName, leadDetails }) {
  const [aadhaarPageMode, setAadhaarPageMode] = useState('single');
  const [rcPageMode, setRcPageMode] = useState('single');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [meta, setMeta] = useState({});

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('aadhaarPageMode', aadhaarPageMode);
    formData.append('rcPageMode', rcPageMode);
    Object.entries(files).forEach(([k, v]) => v && formData.append(k, v));
    await onSubmit(formData, meta);
    setFiles(INITIAL_FILES);
    setMeta({});
    onClose();
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title={`Lead Document Section${leadName ? ` - ${leadName}` : ''}`}
      maxWidth="md"
      actions={<><Button onClick={onClose}>Cancel</Button><Button variant="contained" onClick={handleSave}>Save Documents</Button></>}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2">Upload happens after lead creation.</Typography>
        <Grid container spacing={2}>
          {[
            ['vehicleFront', 'Vehicle Front'],
            ['vehicleRight', 'Vehicle Right'],
            ['vehicleEngine', 'Vehicle Engine'],
            ['vehicleLeft', 'Vehicle Left'],
            ['vehicleBack', 'Vehicle Back'],
            ['vehicleInterior', 'Vehicle Interior'],
          ].map(([key, label]) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField type="file" label={label} fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: IMAGE_ACCEPT, capture: 'environment' }} onChange={(e) => setFiles((p) => ({ ...p, [key]: e.target.files?.[0] || null }))} />
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <TextField select label="RC Page Mode" value={rcPageMode} fullWidth sx={inputSx} onChange={(e) => setRcPageMode(e.target.value)}><MenuItem value="single">One Page</MenuItem><MenuItem value="double">Two Pages</MenuItem></TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField type="file" label="RC Front / Single" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => setFiles((p) => ({ ...p, rcFront: e.target.files?.[0] || null }))} />
          </Grid>
          {rcPageMode === 'double' && <Grid item xs={12} sm={6}><TextField type="file" label="RC Back" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => setFiles((p) => ({ ...p, rcBack: e.target.files?.[0] || null }))} /></Grid>}
          <Grid item xs={12} sm={6}>
            <TextField select label="Aadhaar Page Mode" value={aadhaarPageMode} fullWidth sx={inputSx} onChange={(e) => setAadhaarPageMode(e.target.value)}><MenuItem value="single">One Page</MenuItem><MenuItem value="double">Two Pages</MenuItem></TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField type="file" label="Aadhaar Front / Single" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => setFiles((p) => ({ ...p, aadhaarFront: e.target.files?.[0] || null }))} />
          </Grid>
          {aadhaarPageMode === 'double' && <Grid item xs={12} sm={6}><TextField type="file" label="Aadhaar Back" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT, capture: 'environment' }} onChange={(e) => setFiles((p) => ({ ...p, aadhaarBack: e.target.files?.[0] || null }))} /></Grid>}
          <Grid item xs={12} sm={6}><TextField label="Aadhaar Number" defaultValue={leadDetails?.aadhaarNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, aadhaarNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Mobile linked with Aadhaar" defaultValue={leadDetails?.aadhaarLinkedMobileNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, aadhaarLinkedMobileNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Email ID" defaultValue={leadDetails?.email || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, email: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Bank Account Number" defaultValue={leadDetails?.bankAccountNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankAccountNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="IFSC Code" defaultValue={leadDetails?.bankIfscCode || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankIfscCode: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Branch Name" defaultValue={leadDetails?.bankBranchName || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankBranchName: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Bank Name" defaultValue={leadDetails?.bankName || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, bankName: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField type="file" label="Bank Proof Upload" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT }} onChange={(e) => setFiles((p) => ({ ...p, bankDetail: e.target.files?.[0] || null }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="PAN Number" defaultValue={leadDetails?.panNumber || ''} fullWidth sx={inputSx} onChange={(e) => setMeta((p) => ({ ...p, panNumber: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField type="file" label="PAN Upload" fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} inputProps={{ accept: DOCUMENT_ACCEPT }} onChange={(e) => setFiles((p) => ({ ...p, pan: e.target.files?.[0] || null }))} /></Grid>
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
