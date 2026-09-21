import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import UploadStatusBadge, { useUploadStatus } from '../common/UploadStatusBadge';
import toast from 'react-hot-toast';
import { validateFileSize, MAX_FILE_SIZE_LABEL } from '../../utils/fileValidation';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { usersApi, leadsApi } from '../../services/api';
import {
  LEAD_WIZARD_STEPS as STEPS,
  VEHICLE_NUMBER_REGEX,
  buildLeadStepPayload,
  getPendingStep,
  mapLeadToForm,
  normalizeRegistration,
  snapshotStepPayloads,
} from './leadWizard';

const VEHICLE_TYPES = ['CAR', 'BIKE', 'COMMERCIAL'];
const LEAD_SOURCES = ['WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'MAIN_SITE', 'OTHER'];

const INITIAL_FORM = {
  name: '',
  mobileNumber: '',
  location: '',
  purchaseDate: '',
  leadSource: 'WEBSITE',
  isOwnerSelf: true,
  vehicleWorkingCondition: 'WORKING',
  isInterested: true,
  ownerName: '',
  registrationNumber: '',
  vehicleType: 'CAR',
  vehicleName: '',
  variant: '',
  yearOfManufacture: '',
  color: '',
  rtoDistrictBranch: '',
  last5ChassisNumber: '',
  aadhaarNumber: '',
  aadhaarLinkedMobileNumber: '',
  email: '',
  panNumber: '',
  bankAccountNumber: '',
  bankIfscCode: '',
  bankBranchName: '',
  bankName: '',
  assignedTo: '',
  remarks: '',
  offerAmount: '',
  counterAmount: '',
  dealStatus: 'OPEN',
  closingAmount: '',
  codNumber: '',
  codInwardNumber: '',
  liftingStaffId: '',
  expectedArrivalAt: '',
};

const INITIAL_DOCUMENTS = {
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
  cod: null,
};

const SectionLabel = ({ children }) => (
  <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
    {children}
  </Typography>
);

SectionLabel.propTypes = { children: PropTypes.node.isRequired };

const LeadForm = forwardRef(({ onSubmit, onUploadDocuments, readOnly = false }, ref) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [aadhaarPageMode, setAadhaarPageMode] = useState('single');
  const [rcPageMode, setRcPageMode] = useState('single');
  const [errors, setErrors] = useState({});
  const [staffOptions, setStaffOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const { status: uploadStatus, progress: uploadProgress, startUpload, finishUpload } = useUploadStatus();
  const [savedStepPayloads, setSavedStepPayloads] = useState({
    0: null,
    1: null,
    3: null,
    4: null,
  });

  const isAdmin = user?.role === 'ADMIN';

  const organizationId =
    user?.organizationId ??
    user?.organization?._id ??
    user?.organization ??
    user?.orgId ??
    null;

  useEffect(() => {
    if (!open || !organizationId) return;
    let mounted = true;
    usersApi
      .getAllStaffByOrganization(organizationId, 1, 100)
      .then((res) => {
        if (!mounted) return;
        const items = Array.isArray(res?.data) ? res.data : [];
        setStaffOptions(
          items.map((item) => ({
            id: item._id || item.id,
            label: item.name,
            allowedModules: Array.isArray(item.allowedModules) ? item.allowedModules : [],
          })),
        );
      })
      .catch(() => {
        if (mounted) setStaffOptions([]);
      });
    return () => {
      mounted = false;
    };
  }, [open, organizationId]);

  const buildStepPayload = (currentStep, currentForm) =>
    buildLeadStepPayload(currentStep, currentForm, { isAdmin });

  useImperativeHandle(ref, () => ({
    open: (item) => {
      setErrors({});
      setDocuments(INITIAL_DOCUMENTS);
      setAadhaarPageMode('single');
      setRcPageMode('single');
      if (item) {
        const nextForm = mapLeadToForm(item, INITIAL_FORM);
        setEditingId(item._id || item.id || null);
        setForm(nextForm);
        setSavedStepPayloads(snapshotStepPayloads(nextForm, { isAdmin }));
        setStep(0);
      } else {
        setEditingId(null);
        setForm(INITIAL_FORM);
        setSavedStepPayloads({ 0: null, 1: null, 3: null, 4: null });
        setStep(0);
      }
      setOpen(true);
    },
    openPending: (item) => {
      setErrors({});
      setDocuments(INITIAL_DOCUMENTS);
      setAadhaarPageMode('single');
      setRcPageMode('single');
      if (!item) {
        setEditingId(null);
        setForm(INITIAL_FORM);
        setSavedStepPayloads({ 0: null, 1: null, 3: null, 4: null });
        setStep(0);
        setOpen(true);
        return;
      }
      const nextForm = mapLeadToForm(item, INITIAL_FORM);
      setEditingId(item._id || item.id || null);
      setForm(nextForm);
      setSavedStepPayloads(snapshotStepPayloads(nextForm, { isAdmin }));
      setStep(getPendingStep(nextForm, item.documents));
      setOpen(true);
    },
  }));

  const selectedStaff = useMemo(
    () => staffOptions.find((item) => item.id === form.assignedTo) || null,
    [staffOptions, form.assignedTo],
  );

  const liftingStaffOptions = useMemo(
    () => staffOptions.filter((item) => (item.allowedModules || []).includes('lifting')),
    [staffOptions],
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    const next = {};
    if (step === 0) {
      if (!form.name.trim()) next.name = 'Lead name is required';
      if (!/^\d{10}$/.test(form.mobileNumber || '')) {
        next.mobileNumber = 'Mobile number must be exactly 10 digits';
      }
      if (!form.location.trim()) next.location = 'Location is required';
    }
    if (step === 1 || step === 3 || step === 4) {
      if (step === 1 && form.registrationNumber) {
        const normalized = normalizeRegistration(form.registrationNumber);
        if (!VEHICLE_NUMBER_REGEX.test(normalized)) {
          next.registrationNumber = 'Only letters and numbers allowed (no special characters)';
        }
      }
      if (step === 4 && form.aadhaarLinkedMobileNumber && !/^\d{10}$/.test(form.aadhaarLinkedMobileNumber)) {
        next.aadhaarLinkedMobileNumber = 'Aadhaar linked mobile must be 10 digits';
      }
      if (step === 3) {
        if (form.offerAmount === '' || Number(form.offerAmount) < 0) {
          next.offerAmount = 'Offer amount is required';
        }
        if (form.counterAmount === '' || Number(form.counterAmount) < 0) {
          next.counterAmount = 'Counter amount is required';
        }
      }
      if (step === 1 && form.yearOfManufacture) {
        const year = Number(form.yearOfManufacture);
        const maxYear = new Date().getFullYear() + 1;
        if (Number.isNaN(year) || year < 1900 || year > maxYear) {
          next.yearOfManufacture = `Year must be between 1900 and ${maxYear}`;
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const hasPayloadChanged = (currentStep, payload) =>
    JSON.stringify(savedStepPayloads[currentStep] || {}) !== JSON.stringify(payload || {});

  const handleNext = async () => {
    if (readOnly) return;
    if (!validateStep()) return;
    setSaving(true);
    try {
      if (step === 0 || step === 1 || step === 3 || step === 4) {
        const payload = buildStepPayload(step, form);
        const shouldCall =
          !editingId || hasPayloadChanged(step, payload);
        if (shouldCall) {
          const saved = await onSubmit(payload, editingId);
          const savedId = saved?._id || saved?.id || editingId;
          if (savedId) setEditingId(savedId);
          setSavedStepPayloads((prev) => ({ ...prev, [step]: payload }));
        }
      }

      if (step === 2) {
        if (editingId && onUploadDocuments) {
          const formData = new FormData();
          formData.append('aadhaarPageMode', 'single');
          formData.append('rcPageMode', rcPageMode);
          ['vehicleFront', 'vehicleRight', 'vehicleEngine', 'vehicleLeft', 'vehicleBack', 'vehicleInterior', 'rcFront', 'rcBack'].forEach((key) => {
            if (documents[key]) formData.append(key, documents[key]);
          });
          const hasFiles = ['vehicleFront', 'vehicleRight', 'vehicleEngine', 'vehicleLeft', 'vehicleBack', 'vehicleInterior', 'rcFront', 'rcBack']
            .some((key) => Boolean(documents[key]));
          if (hasFiles) {
            startUpload();
            try {
              await onUploadDocuments(editingId, formData);
              finishUpload(true);
            } catch {
              finishUpload(false);
              toast.error('Document upload failed. Please try again.');
              return;
            }
          }
        }
      }

      if (step === 5) {
        if (editingId && onUploadDocuments) {
          const formData = new FormData();
          formData.append('aadhaarPageMode', aadhaarPageMode);
          formData.append('rcPageMode', 'single');
          ['aadhaarFront', 'aadhaarBack', 'pan', 'bankDetail'].forEach((key) => {
            if (documents[key]) formData.append(key, documents[key]);
          });
          const hasFiles = ['aadhaarFront', 'aadhaarBack', 'pan', 'bankDetail'].some((key) => Boolean(documents[key]));
          if (hasFiles) {
            startUpload();
            try {
              await onUploadDocuments(editingId, formData);
              finishUpload(true);
            } catch {
              finishUpload(false);
              toast.error('Document upload failed. Please try again.');
              return;
            }
          }
        }
      }

      if (step === 6) {
        if (!editingId) {
          toast.error('Save the lead before closing the deal');
          return;
        }
        if (form.dealStatus === 'CLOSED' && documents.cod && onUploadDocuments) {
          const formData = new FormData();
          formData.append('cod', documents.cod);
          await onUploadDocuments(editingId, formData);
        }
        await leadsApi.updateStatus(editingId, {
          status: form.dealStatus,
          closingAmount:
            form.dealStatus === 'CLOSED' && form.closingAmount !== ''
              ? Number(form.closingAmount)
              : undefined,
          codNumber: form.codNumber || undefined,
          codInwardNumber: form.codInwardNumber || undefined,
          liftingStaffId: form.liftingStaffId || undefined,
          expectedArrivalAt: form.expectedArrivalAt || undefined,
        });
        toast.success(
          form.dealStatus === 'CLOSED'
            ? 'Deal closed. Vehicle sent to yard and lifting.'
            : 'Lead status updated',
        );
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['yard-vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['lifting'] });
        setOpen(false);
        setStep(0);
        setEditingId(null);
        setForm(INITIAL_FORM);
        setDocuments(INITIAL_DOCUMENTS);
        setSavedStepPayloads({ 0: null, 1: null, 3: null, 4: null });
        return;
      }

      setStep((prev) => prev + 1);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  return (
    <NormalModal
      open={open}
      onClose={() => setOpen(false)}
      title={editingId ? 'Edit Lead' : 'Create Lead'}
      maxWidth="lg"
      actions={
        <>
          <Button onClick={() => setOpen(false)}>Close</Button>
          {step > 0 && !readOnly && <Button onClick={handleBack}>Back</Button>}
          {!readOnly && (
            <Button variant="contained" onClick={handleNext} disabled={saving}>
              {step === 6 ? 'Finish' : 'Save & Next'}
            </Button>
          )}
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
        <Stepper
          activeStep={step}
          sx={{
            mb: 1,
            '& .MuiStepIcon-root.Mui-active': { color: 'var(--color-secondary-main)' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#2e7d32' },
          }}
        >
          {STEPS.map((label, index) => (
            <Step key={label} completed={index < step}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Typography variant="caption" sx={{ color: 'var(--color-grey-600)' }}>
          Optional fields can be completed later before/during invoice conversion.
        </Typography>

        {step === 0 && (
          <Box>
            <SectionLabel>Lead Details</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField label="Lead Name *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.name)} helperText={errors.name} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Mobile Number *" value={form.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} fullWidth sx={inputSx} error={Boolean(errors.mobileNumber)} helperText={errors.mobileNumber} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Location *" value={form.location} onChange={(e) => handleChange('location', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.location)} helperText={errors.location} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Lead Date" type="date" value={form.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField select label="Source of Lead" value={form.leadSource} onChange={(e) => handleChange('leadSource', e.target.value)} fullWidth sx={inputSx}>
                  {LEAD_SOURCES.map((item) => (
                    <MenuItem key={item} value={item}>{item.replaceAll('_', ' ')}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <SectionLabel>Vehicle Details</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl>
                  <Typography variant="caption">Interested</Typography>
                  <RadioGroup row value={form.isInterested ? 'YES' : 'NO'} onChange={(e) => handleChange('isInterested', e.target.value === 'YES')}>
                    <FormControlLabel value="YES" control={<Radio />} label="Yes" />
                    <FormControlLabel value="NO" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl>
                  <Typography variant="caption">Vehicle owned by</Typography>
                  <RadioGroup row value={form.isOwnerSelf ? 'SELF' : 'OTHER'} onChange={(e) => handleChange('isOwnerSelf', e.target.value === 'SELF')}>
                    <FormControlLabel value="SELF" control={<Radio />} label="Self" />
                    <FormControlLabel value="OTHER" control={<Radio />} label="Other" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl>
                  <Typography variant="caption">Vehicle working condition</Typography>
                  <RadioGroup row value={form.vehicleWorkingCondition} onChange={(e) => handleChange('vehicleWorkingCondition', e.target.value)}>
                    <FormControlLabel value="WORKING" control={<Radio />} label="Working" />
                    <FormControlLabel value="NOT_WORKING" control={<Radio />} label="Not Working" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}><TextField label="Owner Name" value={form.ownerName} onChange={(e) => handleChange('ownerName', e.target.value)} fullWidth sx={inputSx} helperText="Name should be as per RC" /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Vehicle Number" value={form.registrationNumber} onChange={(e) => handleChange('registrationNumber', e.target.value.toUpperCase())} fullWidth sx={inputSx} error={Boolean(errors.registrationNumber)} helperText={errors.registrationNumber} /></Grid>
              <Grid item xs={12} sm={4}><TextField select label="Vehicle Type" value={form.vehicleType} onChange={(e) => handleChange('vehicleType', e.target.value)} fullWidth sx={inputSx}>{VEHICLE_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} sm={4}><TextField label="Make / Manufacturer / Company" value={form.vehicleName} onChange={(e) => handleChange('vehicleName', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Model" value={form.variant} onChange={(e) => handleChange('variant', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Year of Registration" type="number" value={form.yearOfManufacture} onChange={(e) => handleChange('yearOfManufacture', e.target.value.slice(0, 4))} fullWidth sx={inputSx} error={Boolean(errors.yearOfManufacture)} helperText={errors.yearOfManufacture} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Colour" value={form.color} onChange={(e) => handleChange('color', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="RTO District / Branch" value={form.rtoDistrictBranch} onChange={(e) => handleChange('rtoDistrictBranch', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Last 5 Chassis Digits"
                  value={form.last5ChassisNumber}
                  onChange={(e) =>
                    handleChange(
                      'last5ChassisNumber',
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5),
                    )
                  }
                  fullWidth
                  sx={inputSx}
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>

            </Grid>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <SectionLabel>Document 1 (Vehicle Images + RC)</SectionLabel>
              <UploadStatusBadge status={uploadStatus} progress={uploadProgress} />
            </Box>
            {/* Single clean info bar — no per-field helper text to avoid overlap */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
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
            <Grid container spacing={2}>
              {[
                ['vehicleFront', 'Vehicle Front'],
                ['vehicleRight', 'Vehicle Right'],
                ['vehicleEngine', 'Vehicle Engine'],
                ['vehicleLeft', 'Vehicle Left'],
                ['vehicleBack', 'Vehicle Back'],
                ['vehicleInterior', 'Vehicle Interior'],
              ].map(([field, label]) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    type="file"
                    label={label}
                    fullWidth
                    sx={inputSx}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ accept: '.jpg,.jpeg,.png,.pdf' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && !validateFileSize(f)) { e.target.value = ''; return; }
                      setDocuments((prev) => ({ ...prev, [field]: f || null }));
                    }}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, color: 'var(--color-grey-700)' }}>
                  RC Upload
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="RC Page Mode"
                  value={rcPageMode}
                  onChange={(e) => setRcPageMode(e.target.value)}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="single">Single Page</MenuItem>
                  <MenuItem value="double">Double Page</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="file"
                  label="RC Front / Single"
                  fullWidth
                  sx={inputSx}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ accept: '.jpg,.jpeg,.png,.pdf' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && !validateFileSize(f)) { e.target.value = ''; return; }
                    setDocuments((prev) => ({ ...prev, rcFront: f || null }));
                  }}
                />
              </Grid>
              {rcPageMode === 'double' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="file"
                    label="RC Back"
                    fullWidth
                    sx={inputSx}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ accept: '.jpg,.jpeg,.png,.pdf' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && !validateFileSize(f)) { e.target.value = ''; return; }
                      setDocuments((prev) => ({ ...prev, rcBack: f || null }));
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {step === 3 && (
          <Box>
            <SectionLabel>Offer</SectionLabel>
            <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', mb: 2 }}>
              Both amounts are required before KYC can start.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Offer amount *"
                  type="number"
                  value={form.offerAmount}
                  onChange={(e) => handleChange('offerAmount', e.target.value)}
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.offerAmount)}
                  helperText={errors.offerAmount}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Counter amount *"
                  type="number"
                  value={form.counterAmount}
                  onChange={(e) => handleChange('counterAmount', e.target.value)}
                  fullWidth
                  sx={inputSx}
                  error={Boolean(errors.counterAmount)}
                  helperText={errors.counterAmount}
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {step === 4 && (
          <Box>
            <SectionLabel>KYC Details</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField label="Aadhaar Number" value={form.aadhaarNumber} onChange={(e) => handleChange('aadhaarNumber', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Mobile linked with Aadhaar" value={form.aadhaarLinkedMobileNumber} onChange={(e) => handleChange('aadhaarLinkedMobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))} fullWidth sx={inputSx} error={Boolean(errors.aadhaarLinkedMobileNumber)} helperText={errors.aadhaarLinkedMobileNumber} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Email ID" value={form.email} onChange={(e) => handleChange('email', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="PAN Number" value={form.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Bank Account Number" value={form.bankAccountNumber} onChange={(e) => handleChange('bankAccountNumber', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="IFSC Code" value={form.bankIfscCode} onChange={(e) => handleChange('bankIfscCode', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Branch Name" value={form.bankBranchName} onChange={(e) => handleChange('bankBranchName', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Bank Name" value={form.bankName} onChange={(e) => handleChange('bankName', e.target.value)} fullWidth sx={inputSx} /></Grid>
              {isAdmin && (
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={staffOptions}
                  getOptionLabel={(option) => option.label || ''}
                  value={selectedStaff}
                  onChange={(_, value) => handleChange('assignedTo', value?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Assign Staff" fullWidth sx={inputSx} />}
                />
              </Grid>
              )}
            </Grid>
            <Box sx={{ mt: 2 }}>
              <TextField label="Remarks" value={form.remarks} onChange={(e) => handleChange('remarks', e.target.value)} fullWidth multiline minRows={3} sx={inputSx} />
            </Box>
          </Box>
        )}

        {step === 5 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <SectionLabel>Documents (KYC)</SectionLabel>
              <UploadStatusBadge status={uploadStatus} progress={uploadProgress} />
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField select label="Aadhaar Page Mode" value={aadhaarPageMode} onChange={(e) => setAadhaarPageMode(e.target.value)} fullWidth sx={inputSx}><MenuItem value="single">One Page</MenuItem><MenuItem value="double">Two Pages</MenuItem></TextField></Grid>
              {[
                ['aadhaarFront', 'Aadhaar Front / Single'],
                ...(aadhaarPageMode === 'double' ? [['aadhaarBack', 'Aadhaar Back']] : []),
                ['pan', 'PAN Upload'],
                ['bankDetail', 'Bank Proof Upload'],
              ].map(([field, label]) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    type="file"
                    label={label}
                    fullWidth
                    sx={inputSx}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ accept: '.jpg,.jpeg,.png,.pdf' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && !validateFileSize(f)) { e.target.value = ''; return; }
                      setDocuments((prev) => ({ ...prev, [field]: f || null }));
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {step === 6 && (
          <Box>
            <SectionLabel>Close deal</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Lead status"
                  value={form.dealStatus}
                  onChange={(e) => handleChange('dealStatus', e.target.value)}
                  fullWidth
                  sx={inputSx}
                >
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </TextField>
              </Grid>
              {form.dealStatus === 'CLOSED' && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Closing amount"
                      type="number"
                      value={form.closingAmount}
                      onChange={(e) => handleChange('closingAmount', e.target.value)}
                      fullWidth
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="COD number"
                      value={form.codNumber}
                      onChange={(e) => handleChange('codNumber', e.target.value)}
                      fullWidth
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Inward number"
                      value={form.codInwardNumber}
                      onChange={(e) => handleChange('codInwardNumber', e.target.value)}
                      fullWidth
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      type="date"
                      label="Expected arrival"
                      value={form.expectedArrivalAt}
                      onChange={(e) => handleChange('expectedArrivalAt', e.target.value)}
                      fullWidth
                      sx={inputSx}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={liftingStaffOptions}
                      getOptionLabel={(option) => option.label || ''}
                      value={liftingStaffOptions.find((s) => s.id === form.liftingStaffId) || null}
                      onChange={(_, value) => handleChange('liftingStaffId', value?.id || '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Lifting staff" fullWidth sx={inputSx} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="file"
                      label="COD document"
                      fullWidth
                      sx={inputSx}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ accept: '.jpg,.jpeg,.png,.pdf' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && !validateFileSize(f)) {
                          e.target.value = '';
                          return;
                        }
                        setDocuments((prev) => ({ ...prev, cod: f || null }));
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )}
      </Box>
    </NormalModal>
  );
});

LeadForm.displayName = 'LeadForm';
LeadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onUploadDocuments: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default LeadForm;
