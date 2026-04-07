import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import inputSx from '../../services/inputStyles';
import NormalModal from '../../ui/NormalModal';

const DOCUMENT_ACCEPT = '.jpg,.jpeg,.png,.pdf';

const INITIAL_FILES = {
  aadhaarFront: null,
  aadhaarBack: null,
  rcFront: null,
  rcBack: null,
  pan: null,
  bankDetail: null,
};

export default function LeadDocumentForm({ open, onClose, onSubmit, leadName }) {
  const [pageMode, setPageMode] = useState('single');
  const [files, setFiles] = useState(INITIAL_FILES);

  const handleFile = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file || null }));
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('pageMode', pageMode);
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });
    await onSubmit(formData);
    setFiles(INITIAL_FILES);
    setPageMode('single');
    onClose();
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title={`Upload Lead Documents${leadName ? ` - ${leadName}` : ''}`}
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Documents
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
          Documents are optional at lead stage. Aadhaar and RC can be uploaded as
          single-page or double-page. Supported formats: JPEG, PNG, PDF.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Page Mode"
              value={pageMode}
              onChange={(e) => setPageMode(e.target.value)}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="single">Single Page</MenuItem>
              <MenuItem value="double">Double Page</MenuItem>
            </TextField>
          </Grid>
          {[
            ['aadhaarFront', 'Aadhaar Front'],
            ...(pageMode === 'double' ? [['aadhaarBack', 'Aadhaar Back']] : []),
            ['rcFront', 'RC Front'],
            ...(pageMode === 'double' ? [['rcBack', 'RC Back']] : []),
            ['pan', 'PAN'],
            ['bankDetail', 'Bank Detail'],
          ].map(([field, label]) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                type="file"
                label={label}
                fullWidth
                sx={inputSx}
                inputProps={{ accept: DOCUMENT_ACCEPT }}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => handleFile(field, e.target.files?.[0])}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </NormalModal>
  );
}

LeadDocumentForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  leadName: PropTypes.string,
};
