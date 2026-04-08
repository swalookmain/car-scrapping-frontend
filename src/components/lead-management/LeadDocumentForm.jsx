import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Divider,
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

const SectionLabel = ({ children }) => (
  <Typography
    variant="subtitle2"
    sx={{ 
      fontWeight: 700, 
      color: 'var(--color-grey-700)', 
      textTransform: 'uppercase', 
      letterSpacing: 0.8,
      fontSize: '0.75rem',
      mb: 1
    }}
  >
    {children}
  </Typography>
);

export default function LeadDocumentForm({ open, onClose, onSubmit, leadName }) {
  const [pageMode, setPageMode] = useState('single');
  const [files, setFiles] = useState(INITIAL_FILES);

  const handleFile = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file || null }));
  };

  const handleClose = () => {
    setFiles(INITIAL_FILES);
    setPageMode('single');
    onClose();
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('pageMode', pageMode);
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });
    await onSubmit(formData);
    handleClose();
  };

  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title={`Upload Lead Documents${leadName ? ` - ${leadName}` : ''}`}
      maxWidth="md"
      actions={
        <>
          <Button onClick={handleClose} sx={{ color: 'var(--color-grey-600)' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{ 
              backgroundColor: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } 
            }}
          >
            Save Documents
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
        <Box sx={{ p: 2, backgroundColor: 'var(--color-primary-light)', borderRadius: '12px', border: '1px solid var(--color-primary-200)' }}>
          <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 500, lineHeight: 1.6 }}>
            Documents are optional at the lead stage. Aadhaar and RC can be uploaded as
            single-page or double-page files. Supported formats: <strong>JPEG, PNG, PDF</strong>.
          </Typography>
        </Box>

        <Box>
          <SectionLabel>Upload Settings</SectionLabel>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Page View Mode"
                value={pageMode}
                onChange={(e) => setPageMode(e.target.value)}
                fullWidth
                sx={inputSx}
                helperText="Switch to double-page if you have separate front/back images"
              >
                <MenuItem value="single">Single Page (Fused)</MenuItem>
                <MenuItem value="double">Double Page (Separate)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        <Box>
          <SectionLabel>Identification Documents</SectionLabel>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              ['aadhaarFront', 'Aadhaar Front'],
              ...(pageMode === 'double' ? [['aadhaarBack', 'Aadhaar Back']] : []),
              ['rcFront', 'RC Front'],
              ...(pageMode === 'double' ? [['rcBack', 'RC Back']] : []),
              ['pan', 'PAN Card'],
              ['bankDetail', 'Bank Detail / Cancelled Cheque'],
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
