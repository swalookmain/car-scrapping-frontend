import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import {
  LetterAssetUploads,
  LetterMobileNumbersField,
  LetterSettingsTextFields,
} from './letterSettingsFormParts';
import { useLetterSettingsForm } from './useLetterSettingsForm';

const LetterSettingsForm = () => {
  const {
    form,
    mobileInput,
    setMobileInput,
    saving,
    uploading,
    isLoading,
    handleChange,
    addMobile,
    removeMobile,
    uploadAsset,
    handleSave,
  } = useLetterSettingsForm();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid var(--color-grey-100)' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Letterhead settings
      </Typography>
      <Grid container spacing={2}>
        <LetterSettingsTextFields form={form} onChange={handleChange} />
        <LetterMobileNumbersField
          mobileNumbers={form.mobileNumbers}
          mobileInput={mobileInput}
          onInputChange={setMobileInput}
          onAdd={addMobile}
          onRemove={removeMobile}
        />
        <LetterAssetUploads form={form} uploading={uploading} onUpload={uploadAsset} />
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </Button>
      </Box>
    </Paper>
  );
};

export default LetterSettingsForm;
