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
const STEPS = ['Lead Details', 'Vehicle Details', 'KYC Details', 'Documents'];

const INITIAL_FORM = {
  name: '',
  mobileNumber: '',
  location: '',
  purchaseDate: '',
  isOwnerSelf: true,
  vehicleWorkingCondition: 'WORKING',
  leadSource: 'WEBSITE',
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

  const organizationId = user?.organizationId ?? user?.organization?._id ?? user?.organization ?? user?.orgId ?? null;

  useEffect(() => {
    if (!open || !organizationId) return;
    let mounted = true;
    usersApi.getAllStaffByOrganization(organizationId, 1, 100).then((res) => {
      if (!mounted) return;
      const items = Array.isArray(res?.data) ? res.data : [];
      setStaffOptions(items.map((item) => ({ id: item._id || item.id, label: item.name })));
    }).catch(() => {
      if (mounted) setStaffOptions([]);
    });
    return () => {
      mounted = false;
    };
  }, [open, organizationId]);

  const getPendingStep = (nextForm, docs = []) => {
    const docsList = Array.isArray(docs) ? docs : [];
    const stepOneDone = Boolean(
      nextForm.name?.trim() && nextForm.mobileNumber?.trim() && nextForm.location?.trim(),
    );
    if (!stepOneDone) return 0;
    const stepTwoDone = Boolean(nextForm.registrationNumber?.trim());
    if (!stepTwoDone) return 1;
    const stepThreeDone = Boolean(
      nextForm.aadhaarNumber?.trim() &&
        nextForm.panNumber?.trim() &&
        nextForm.bankAccountNumber?.trim() &&
        nextForm.bankIfscCode?.trim(),
    );
    if (!stepThreeDone) return 2;
    const stepFourDone = docsList.length > 0;
    if (!stepFourDone) return 3;
    return 3;
  };

  useImperativeHandle(ref, () => ({
    open: (item) => {
      setStep(0);
      setErrors({});
      setDocuments(INITIAL_DOCUMENTS);
      setAadhaarPageMode('single');
      setRcPageMode('single');
      if (item) {
        setEditingId(item._id || item.id || null);
        setForm({
          ...INITIAL_FORM,
          name: item.name || '',
          mobileNumber: item.mobileNumber || '',
          location: item.location || '',
          purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : '',
          isOwnerSelf: typeof item.isOwnerSelf === 'boolean' ? item.isOwnerSelf : true,
          vehicleWorkingCondition: item.vehicleWorkingCondition || 'WORKING',
          leadSource: item.leadSource || 'WEBSITE',
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
        });
      } else {
        setEditingId(null);
        setForm(INITIAL_FORM);
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
        isOwnerSelf: typeof item.isOwnerSelf === 'boolean' ? item.isOwnerSelf : true,
        vehicleWorkingCondition: item.vehicleWorkingCondition || 'WORKING',
        leadSource: item.leadSource || 'WEBSITE',
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

  const validateLeadStep = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Lead name is required';
    if (!form.mobileNumber.trim()) next.mobileNumber = 'Mobile number is required';
    if (!form.location.trim()) next.location = 'Location is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildLeadPayloadByStep = (currentStep) => {
    if (currentStep === 0) {
      return {
        name: form.name,
        mobileNumber: form.mobileNumber,
        location: form.location,
        isOwnerSelf: form.isOwnerSelf,
        vehicleWorkingCondition: form.vehicleWorkingCondition,
        leadSource: form.leadSource,
        purchaseDate: form.purchaseDate || undefined,
      };
    }
    if (currentStep === 1) {
      return {
        ownerName: form.ownerName || undefined,
        registrationNumber: form.registrationNumber || undefined,
        vehicleType: form.vehicleType || undefined,
        vehicleName: form.vehicleName || undefined,
        variant: form.variant || undefined,
        yearOfManufacture: form.yearOfManufacture
          ? Number(form.yearOfManufacture)
          : undefined,
        color: form.color || undefined,
        rtoDistrictBranch: form.rtoDistrictBranch || undefined,
        last5ChassisNumber: form.last5ChassisNumber || undefined,
      };
    }
    if (currentStep === 2) {
      return {
        aadhaarNumber: form.aadhaarNumber || undefined,
        aadhaarLinkedMobileNumber: form.aadhaarLinkedMobileNumber || undefined,
        email: form.email || undefined,
        panNumber: form.panNumber || undefined,
        bankAccountNumber: form.bankAccountNumber || undefined,
        bankIfscCode: form.bankIfscCode || undefined,
        bankBranchName: form.bankBranchName || undefined,
        bankName: form.bankName || undefined,
        assignedTo: form.assignedTo || undefined,
        remarks: form.remarks || undefined,
      };
    }
    return {};
  };

  const handleNext = async () => {
    if (readOnly) return;
    if (step === 0 && !validateLeadStep()) return;
    setSaving(true);
    try {
      if (step <= 2) {
        const payload = buildLeadPayloadByStep(step);
        const saved = await onSubmit(payload, editingId);
        const savedId = saved?._id || saved?.id || editingId;
        if (savedId) setEditingId(savedId);
      }

      if (step === 3) {
        if (editingId && onUploadDocuments) {
          const formData = new FormData();
          formData.append('aadhaarPageMode', aadhaarPageMode);
          formData.append('rcPageMode', rcPageMode);
          Object.entries(documents).forEach(([key, file]) => {
            if (file) formData.append(key, file);
          });
          const hasFiles = Object.values(documents).some(Boolean);
          if (hasFiles) {
            await onUploadDocuments(editingId, formData);
          }
        }
        toast.success('Lead saved. Remaining empty fields can be filled during invoice creation.');
        setOpen(false);
        setStep(0);
        setEditingId(null);
        setForm(INITIAL_FORM);
        setDocuments(INITIAL_DOCUMENTS);
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
              {step === 3 ? 'Finish' : 'Save & Next'}
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
          You can leave optional fields empty now and complete them later at invoice generation.
        </Typography>

        {step === 0 && (
          <Box>
            <SectionLabel>Lead Details</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField label="Lead Name *" value={form.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.name)} helperText={errors.name} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Mobile Number *" value={form.mobileNumber} onChange={(e) => handleChange('mobileNumber', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.mobileNumber)} helperText={errors.mobileNumber} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Location *" value={form.location} onChange={(e) => handleChange('location', e.target.value)} fullWidth sx={inputSx} error={Boolean(errors.location)} helperText={errors.location} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Lead Date" type="date" value={form.purchaseDate} onChange={(e) => handleChange('purchaseDate', e.target.value)} fullWidth sx={inputSx} InputLabelProps={{ shrink: true }} /></Grid>
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
              <Grid item xs={12} sm={4}>
                <TextField select label="Source of Lead" value={form.leadSource} onChange={(e) => handleChange('leadSource', e.target.value)} fullWidth sx={inputSx}>
                  {LEAD_SOURCES.map((item) => <MenuItem key={item} value={item}>{item.replaceAll('_', ' ')}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}

        {step === 1 && (
          <Box>
            <SectionLabel>Vehicle Details</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField label="Owner Name" value={form.ownerName} onChange={(e) => handleChange('ownerName', e.target.value)} fullWidth sx={inputSx} helperText="Name should be as per RC" /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Vehicle Number" value={form.registrationNumber} onChange={(e) => handleChange('registrationNumber', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField select label="Vehicle Type" value={form.vehicleType} onChange={(e) => handleChange('vehicleType', e.target.value)} fullWidth sx={inputSx}>{VEHICLE_TYPES.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField></Grid>
              <Grid item xs={12} sm={4}><TextField label="Make / Manufacturer / Company" value={form.vehicleName} onChange={(e) => handleChange('vehicleName', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Model" value={form.variant} onChange={(e) => handleChange('variant', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Year of Registration" type="number" value={form.yearOfManufacture} onChange={(e) => handleChange('yearOfManufacture', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Colour" value={form.color} onChange={(e) => handleChange('color', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="RTO District / Branch" value={form.rtoDistrictBranch} onChange={(e) => handleChange('rtoDistrictBranch', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Last 5 Chassis Digits" value={form.last5ChassisNumber} onChange={(e) => handleChange('last5ChassisNumber', e.target.value)} fullWidth sx={inputSx} /></Grid>
            </Grid>
          </Box>
        )}

        {step === 2 && (
          <Box>
            <SectionLabel>KYC Details</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField label="Aadhaar Number" value={form.aadhaarNumber} onChange={(e) => handleChange('aadhaarNumber', e.target.value)} fullWidth sx={inputSx} /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Mobile linked with Aadhaar" value={form.aadhaarLinkedMobileNumber} onChange={(e) => handleChange('aadhaarLinkedMobileNumber', e.target.value)} fullWidth sx={inputSx} /></Grid>
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

        {step === 3 && (
          <Box>
            <SectionLabel>Documents</SectionLabel>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField select label="Aadhaar Page Mode" value={aadhaarPageMode} onChange={(e) => setAadhaarPageMode(e.target.value)} fullWidth sx={inputSx}><MenuItem value="single">One Page</MenuItem><MenuItem value="double">Two Pages</MenuItem></TextField></Grid>
              <Grid item xs={12} sm={4}><TextField select label="RC Page Mode" value={rcPageMode} onChange={(e) => setRcPageMode(e.target.value)} fullWidth sx={inputSx}><MenuItem value="single">One Page</MenuItem><MenuItem value="double">Two Pages</MenuItem></TextField></Grid>
              {[
                ['vehicleFront', 'Vehicle Front'],
                ['vehicleRight', 'Vehicle Right'],
                ['vehicleEngine', 'Vehicle Engine'],
                ['vehicleLeft', 'Vehicle Left'],
                ['vehicleBack', 'Vehicle Back'],
                ['vehicleInterior', 'Vehicle Interior'],
                ['rcFront', 'RC Front / Single'],
                ...(rcPageMode === 'double' ? [['rcBack', 'RC Back']] : []),
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
                    onChange={(e) => setDocuments((prev) => ({ ...prev, [field]: e.target.files?.[0] || null }))}
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
