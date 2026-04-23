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
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { usersApi } from '../../services/api';

const VEHICLE_TYPES = ['CAR', 'BIKE', 'COMMERCIAL'];
const LEAD_SOURCES = ['WEBSITE', 'WHATSAPP', 'INSTAGRAM', 'MAIN_SITE', 'OTHER'];
const STEPS = [
  'Lead Details',
  'Vehicle Details',
  'Document 1',
  'KYC Details',
  'Documents',
];
const VEHICLE_NUMBER_REGEX =
  /^(?:[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,3}[- ]?\d{4}|[0-9]{2}[- ]?BH[- ]?[0-9]{4}[- ]?[A-Z]{2})$/;

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
};

const SectionLabel = ({ children }) => (
  <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
    {children}
  </Typography>
);

SectionLabel.propTypes = { children: PropTypes.node.isRequired };

const normalizeRegistration = (value) => (value || '').toUpperCase().replace(/[\s-]+/g, '');

const LeadForm = forwardRef(({ onSubmit, onUploadDocuments, readOnly = false }, ref) => {
  const { user } = useAuth();
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
  const [savedStepPayloads, setSavedStepPayloads] = useState({
    0: null,
    1: null,
    3: null,
  });

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
        setStaffOptions(items.map((item) => ({ id: item._id || item.id, label: item.name })));
      })
      .catch(() => {
        if (mounted) setStaffOptions([]);
      });
    return () => {
      mounted = false;
    };
  }, [open, organizationId]);

  const buildStepPayload = (currentStep, currentForm) => {
    if (currentStep === 0) {
      return {
        name: currentForm.name,
        mobileNumber: currentForm.mobileNumber,
        location: currentForm.location,
        purchaseDate: currentForm.purchaseDate || undefined,
        leadSource: currentForm.leadSource,
      };
    }
    if (currentStep === 1) {
      return {
        isOwnerSelf: currentForm.isOwnerSelf,
        vehicleWorkingCondition: currentForm.vehicleWorkingCondition,
        isInterested: currentForm.isInterested,
        ownerName: currentForm.ownerName || undefined,
        registrationNumber: currentForm.registrationNumber || undefined,
        vehicleType: currentForm.vehicleType || undefined,
        vehicleName: currentForm.vehicleName || undefined,
        variant: currentForm.variant || undefined,
        yearOfManufacture: currentForm.yearOfManufacture
          ? Number(currentForm.yearOfManufacture)
          : undefined,
        color: currentForm.color || undefined,
        rtoDistrictBranch: currentForm.rtoDistrictBranch || undefined,
        last5ChassisNumber: currentForm.last5ChassisNumber || undefined,
      };
    }
    return {
      aadhaarNumber: currentForm.aadhaarNumber || undefined,
      aadhaarLinkedMobileNumber: currentForm.aadhaarLinkedMobileNumber || undefined,
      email: currentForm.email || undefined,
      panNumber: currentForm.panNumber || undefined,
      bankAccountNumber: currentForm.bankAccountNumber || undefined,
      bankIfscCode: currentForm.bankIfscCode || undefined,
      bankBranchName: currentForm.bankBranchName || undefined,
      bankName: currentForm.bankName || undefined,
      assignedTo: currentForm.assignedTo || undefined,
      remarks: currentForm.remarks || undefined,
    };
  };

  const getPendingStep = (nextForm, docs = []) => {
    const docsList = Array.isArray(docs) ? docs : [];
    const stepOneDone = Boolean(
      nextForm.name?.trim() &&
        /^\d{10}$/.test(nextForm.mobileNumber || '') &&
        nextForm.location?.trim(),
    );
    if (!stepOneDone) return 0;
    const stepTwoDone = Boolean(
      nextForm.registrationNumber?.trim() &&
        VEHICLE_NUMBER_REGEX.test(normalizeRegistration(nextForm.registrationNumber)) &&
        nextForm.yearOfManufacture,
    );
    if (!stepTwoDone) return 1;
    const hasDoc1 = docsList.some((doc) =>
      ['vehicleFront', 'vehicleRight', 'vehicleEngine', 'vehicleLeft', 'vehicleBack', 'vehicleInterior', 'rc'].includes(
        doc.documentType,
      ),
    );
    if (!hasDoc1) return 2;
    const stepFourDone = Boolean(
      nextForm.aadhaarNumber?.trim() || nextForm.panNumber?.trim() || nextForm.bankAccountNumber?.trim(),
    );
    if (!stepFourDone) return 3;
    const hasFinalDocs = docsList.some((doc) =>
      ['aadhaar', 'pan', 'bankDetail'].includes(doc.documentType),
    );
    if (!hasFinalDocs) return 4;
    return 4;
  };

  useImperativeHandle(ref, () => ({
    open: (item) => {
      setErrors({});
      setDocuments(INITIAL_DOCUMENTS);
      setAadhaarPageMode('single');
      setRcPageMode('single');
      if (item) {
        const nextForm = {
          ...INITIAL_FORM,
          name: item.name || '',
          mobileNumber: item.mobileNumber || '',
          location: item.location || '',
          purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : '',
          leadSource: item.leadSource || 'WEBSITE',
          isOwnerSelf: typeof item.isOwnerSelf === 'boolean' ? item.isOwnerSelf : true,
          vehicleWorkingCondition: item.vehicleWorkingCondition || 'WORKING',
          isInterested:
            typeof item.isInterested === 'boolean' ? item.isInterested : true,
          ownerName: item.ownerName || '',
          registrationNumber: item.registrationNumber || '',
          vehicleType: item.vehicleType || 'CAR',
          vehicleName: item.vehicleName || '',
          variant: item.variant || '',
          yearOfManufacture: item.yearOfManufacture ?? '',
          color: item.color || '',
          rtoDistrictBranch: item.rtoDistrictBranch || '',
          last5ChassisNumber: item.last5ChassisNumber || '',
          aadhaarNumber: item.aadhaarNumber || '',
          aadhaarLinkedMobileNumber: item.aadhaarLinkedMobileNumber || '',
          email: item.email || '',
          panNumber: item.panNumber || '',
          bankAccountNumber: item.bankAccountNumber || '',
          bankIfscCode: item.bankIfscCode || '',
          bankBranchName: item.bankBranchName || '',
          bankName: item.bankName || '',
          assignedTo: item.assignedTo?._id || item.assignedTo || '',
          remarks: item.remarks || '',
        };
        setEditingId(item._id || item.id || null);
        setForm(nextForm);
        setSavedStepPayloads({
          0: buildStepPayload(0, nextForm),
          1: buildStepPayload(1, nextForm),
          3: buildStepPayload(3, nextForm),
        });
        setStep(0);
      } else {
        setEditingId(null);
        setForm(INITIAL_FORM);
        setSavedStepPayloads({ 0: null, 1: null, 3: null });
        setStep(0);
      }
      setOpen(true);
    },
    openPending: (item) => {
      if (!item) {
        setEditingId(null);
        setForm(INITIAL_FORM);
        setSavedStepPayloads({ 0: null, 1: null });
        setStep(0);
        setOpen(true);
        return;
      }
      const nextForm = {
        ...INITIAL_FORM,
        name: item.name || '',
        mobileNumber: item.mobileNumber || '',
        location: item.location || '',
        purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : '',
        leadSource: item.leadSource || 'WEBSITE',
        isOwnerSelf: typeof item.isOwnerSelf === 'boolean' ? item.isOwnerSelf : true,
        vehicleWorkingCondition: item.vehicleWorkingCondition || 'WORKING',
        isInterested: typeof item.isInterested === 'boolean' ? item.isInterested : true,
        ownerName: item.ownerName || '',
        registrationNumber: item.registrationNumber || '',
        vehicleType: item.vehicleType || 'CAR',
        vehicleName: item.vehicleName || '',
        variant: item.variant || '',
        yearOfManufacture: item.yearOfManufacture ?? '',
        color: item.color || '',
        rtoDistrictBranch: item.rtoDistrictBranch || '',
        last5ChassisNumber: item.last5ChassisNumber || '',
        aadhaarNumber: item.aadhaarNumber || '',
        aadhaarLinkedMobileNumber: item.aadhaarLinkedMobileNumber || '',
        email: item.email || '',
        panNumber: item.panNumber || '',
        bankAccountNumber: item.bankAccountNumber || '',
        bankIfscCode: item.bankIfscCode || '',
        bankBranchName: item.bankBranchName || '',
        bankName: item.bankName || '',
        assignedTo: item.assignedTo?._id || item.assignedTo || '',
        remarks: item.remarks || '',
      };
      setEditingId(item._id || item.id || null);
      setForm(nextForm);
      setSavedStepPayloads({
        0: buildStepPayload(0, nextForm),
        1: buildStepPayload(1, nextForm),
        3: buildStepPayload(3, nextForm),
      });
      setStep(getPendingStep(nextForm, item.documents));
      setOpen(true);
    },
  }));

  const selectedStaff = useMemo(
    () => staffOptions.find((item) => item.id === form.assignedTo) || null,
    [staffOptions, form.assignedTo],
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
    if (step === 1 || step === 3) {
      if (step === 1 && form.registrationNumber) {
        const normalized = normalizeRegistration(form.registrationNumber);
        if (!VEHICLE_NUMBER_REGEX.test(normalized)) {
          next.registrationNumber = 'Enter valid Indian vehicle number';
        }
      }
      if (step === 3 && form.aadhaarLinkedMobileNumber && !/^\d{10}$/.test(form.aadhaarLinkedMobileNumber)) {
        next.aadhaarLinkedMobileNumber = 'Aadhaar linked mobile must be 10 digits';
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
      if (step === 0 || step === 1 || step === 3) {
        const payload = buildStepPayload(step, {
          ...form,
          registrationNumber: normalizeRegistration(form.registrationNumber),
        });
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
          if (hasFiles) await onUploadDocuments(editingId, formData);
        }
      }

      if (step === 4) {
        if (editingId && onUploadDocuments) {
          const formData = new FormData();
          formData.append('aadhaarPageMode', aadhaarPageMode);
          formData.append('rcPageMode', 'single');
          ['aadhaarFront', 'aadhaarBack', 'pan', 'bankDetail'].forEach((key) => {
            if (documents[key]) formData.append(key, documents[key]);
          });
          const hasFiles = ['aadhaarFront', 'aadhaarBack', 'pan', 'bankDetail'].some((key) => Boolean(documents[key]));
          if (hasFiles) await onUploadDocuments(editingId, formData);
        }
        toast.success('Lead saved. Missing fields can be completed later.');
        setOpen(false);
        setStep(0);
        setEditingId(null);
        setForm(INITIAL_FORM);
        setDocuments(INITIAL_DOCUMENTS);
        setSavedStepPayloads({ 0: null, 1: null, 3: null });
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
              {step === 4 ? 'Finish' : 'Save & Next'}
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
            '& .MuiStepIcon-root.Mui-completed': { color: 'var(--color-secondary-main)' },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
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
            <SectionLabel>Document 1 (Vehicle Images + RC)</SectionLabel>
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
                    onChange={(e) =>
                      setDocuments((prev) => ({ ...prev, [field]: e.target.files?.[0] || null }))
                    }
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
                  onChange={(e) =>
                    setDocuments((prev) => ({ ...prev, rcFront: e.target.files?.[0] || null }))
                  }
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
                    onChange={(e) =>
                      setDocuments((prev) => ({ ...prev, rcBack: e.target.files?.[0] || null }))
                    }
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {step === 3 && (
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
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  options={staffOptions}
                  value={selectedStaff}
                  onChange={(_, value) => handleChange('assignedTo', value?.id || '')}
                  renderInput={(params) => <TextField {...params} label="Assign Staff" fullWidth sx={inputSx} />}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <TextField label="Remarks" value={form.remarks} onChange={(e) => handleChange('remarks', e.target.value)} fullWidth multiline minRows={3} sx={inputSx} />
            </Box>
          </Box>
        )}

        {step === 4 && (
          <Box>
            <SectionLabel>Documents</SectionLabel>
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
                    onChange={(e) =>
                      setDocuments((prev) => ({ ...prev, [field]: e.target.files?.[0] || null }))
                    }
                  />
                </Grid>
              ))}
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
