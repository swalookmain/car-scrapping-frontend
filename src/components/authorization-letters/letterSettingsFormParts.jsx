import React, { useRef } from 'react';
import { Box, Button, Chip, Grid, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import inputSx from '../../services/inputStyles';
import DocUploadField from '../vehicle-compliance/DocUploadField';

export const EMPTY_LETTER_SETTINGS_FORM = {
  legalName: '',
  tagline: '',
  gstin: '',
  proprietorName: '',
  proprietorTitle: 'Proprietor',
  signatoryAddress: '',
  address: '',
  pinCode: '',
  mobileNumbers: [],
  email: '',
  website: '',
  buyerRefLabel: 'MSTC BUYER REF. NO.',
  logoUrl: '',
  rvsfLogoUrl: '',
  signatureUrl: '',
};

export function mapSettingsToForm(settings) {
  if (!settings) return EMPTY_LETTER_SETTINGS_FORM;
  return {
    legalName: settings.legalName || '',
    tagline: settings.tagline || '',
    gstin: settings.gstin || '',
    proprietorName: settings.proprietorName || '',
    proprietorTitle: settings.proprietorTitle || 'Proprietor',
    signatoryAddress: settings.signatoryAddress || '',
    address: settings.address || '',
    pinCode: settings.pinCode || '',
    mobileNumbers: Array.isArray(settings.mobileNumbers) ? settings.mobileNumbers : [],
    email: settings.email || '',
    website: settings.website || '',
    buyerRefLabel: settings.buyerRefLabel || 'MSTC BUYER REF. NO.',
    logoUrl: settings.logoUrl || '',
    rvsfLogoUrl: settings.rvsfLogoUrl || '',
    signatureUrl: settings.signatureUrl || '',
  };
}

export function LetterSettingsTextFields({ form, onChange }) {
  return (
    <>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="Legal name" value={form.legalName} onChange={(e) => onChange('legalName', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="Tagline" value={form.tagline} onChange={(e) => onChange('tagline', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="GSTIN" value={form.gstin} onChange={(e) => onChange('gstin', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="Buyer ref label" value={form.buyerRefLabel} onChange={(e) => onChange('buyerRefLabel', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="Proprietor name" value={form.proprietorName} onChange={(e) => onChange('proprietorName', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="Proprietor title" value={form.proprietorTitle} onChange={(e) => onChange('proprietorTitle', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12}>
        <TextField fullWidth label="Signatory address" value={form.signatoryAddress} onChange={(e) => onChange('signatoryAddress', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={8}>
        <TextField fullWidth label="Footer address" value={form.address} onChange={(e) => onChange('address', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="PIN code" value={form.pinCode} onChange={(e) => onChange('pinCode', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="Email" value={form.email} onChange={(e) => onChange('email', e.target.value)} sx={inputSx} />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField fullWidth label="Website" value={form.website} onChange={(e) => onChange('website', e.target.value)} sx={inputSx} />
      </Grid>
    </>
  );
}

export function LetterMobileNumbersField({
  mobileNumbers,
  mobileInput,
  onInputChange,
  onAdd,
  onRemove,
}) {
  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Mobile numbers</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        {mobileNumbers.map((mobile) => (
          <Chip key={mobile} label={mobile} onDelete={() => onRemove(mobile)} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          label="Add mobile"
          value={mobileInput}
          onChange={(e) => onInputChange(e.target.value)}
          sx={{ ...inputSx, flex: 1 }}
        />
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAdd}>Add</Button>
      </Box>
    </Grid>
  );
}

function AssetUploadSlot({ label, url, assetType, uploading, onSelect }) {
  const inputRef = useRef(null);
  const isUploading = uploading === assetType;

  return (
    <Grid item xs={12} md={4}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
      <DocUploadField label={label} docState={url || null} onChange={() => {}} readOnly />
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => onSelect(assetType, e.target.files?.[0])}
      />
      <Button
        size="small"
        sx={{ mt: 1 }}
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? 'Uploading...' : `Upload ${label.toLowerCase()}`}
      </Button>
    </Grid>
  );
}

export function LetterAssetUploads({ form, uploading, onUpload }) {
  return (
    <>
      <AssetUploadSlot label="Logo" url={form.logoUrl} assetType="logo" uploading={uploading} onSelect={onUpload} />
      <AssetUploadSlot label="RVSF logo" url={form.rvsfLogoUrl} assetType="rvsfLogo" uploading={uploading} onSelect={onUpload} />
      <AssetUploadSlot label="Signature" url={form.signatureUrl} assetType="signature" uploading={uploading} onSelect={onUpload} />
    </>
  );
}
