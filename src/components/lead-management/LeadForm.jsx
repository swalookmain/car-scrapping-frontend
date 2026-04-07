import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { usersApi } from '../../services/api';

const VEHICLE_TYPES = ['CAR', 'BIKE', 'COMMERCIAL'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'];
const LEAD_SOURCES = ['WEBSITE', 'WORD_OF_MOUTH'];
const WHEEL_VARIANTS = [
  'TWO_WHEELER',
  'THREE_WHEELER',
  'FOUR_WHEELER',
  'SIX_WHEELER',
  'EIGHT_WHEELER',
];

const INITIAL_FORM = {
  name: '',
  mobileNumber: '',
  location: '',
  vehicleName: '',
  vehicleType: 'CAR',
  variant: 'FOUR_WHEELER',
  fuelType: 'PETROL',
  registrationNumber: '',
  last5ChassisNumber: '',
  engineNumber: '',
  color: '',
  yearOfManufacture: '',
  rtoDistrictBranch: '',
  isOwnerSelf: true,
  email: '',
  aadhaarNumber: '',
  panNumber: '',
  leadSource: 'WEBSITE',
  placeOfSupplyState: '',
  purchaseAmount: '',
  purchaseDate: '',
  reverseChargeApplicable: false,
  assignedTo: '',
  remarks: '',
};

const LeadForm = forwardRef(({ onSubmit, readOnly = false }, ref) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [staffOptions, setStaffOptions] = useState([]);
  const [saving, setSaving] = useState(false);

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
            email: item.email,
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

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        setEditingId(item._id || item.id || null);
        setForm({
          ...INITIAL_FORM,
          name: item.name || '',
          mobileNumber: item.mobileNumber || '',
          location: item.location || '',
          vehicleName: item.vehicleName || '',
          vehicleType: item.vehicleType || 'CAR',
          variant: item.variant || 'FOUR_WHEELER',
          fuelType: item.fuelType || 'PETROL',
          registrationNumber: item.registrationNumber || '',
          last5ChassisNumber: item.last5ChassisNumber || '',
          engineNumber: item.engineNumber || '',
          color: item.color || '',
          yearOfManufacture: item.yearOfManufacture ?? '',
          rtoDistrictBranch: item.rtoDistrictBranch || '',
          isOwnerSelf:
            typeof item.isOwnerSelf === 'boolean' ? item.isOwnerSelf : true,
          email: item.email || '',
          aadhaarNumber: item.aadhaarNumber || '',
          panNumber: item.panNumber || '',
          leadSource: item.leadSource || 'WEBSITE',
          placeOfSupplyState: item.placeOfSupplyState || '',
          purchaseAmount: item.purchaseAmount ?? '',
          purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : '',
          reverseChargeApplicable: Boolean(item.reverseChargeApplicable),
          assignedTo:
            item.assignedTo?._id || item.assignedTo || item.assignedToId || '',
          remarks: item.remarks || '',
        });
      } else {
        setEditingId(null);
        setForm(INITIAL_FORM);
      }
      setErrors({});
      setOpen(true);
    },
  }));

  const selectedStaff = useMemo(
    () => staffOptions.find((item) => item.id === form.assignedTo) || null,
    [staffOptions, form.assignedTo],
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Lead name is required';
    if (!form.mobileNumber.trim()) next.mobileNumber = 'Mobile number is required';
    if (!form.vehicleName.trim()) next.vehicleName = 'Vehicle name is required';
    if (!form.variant.trim()) next.variant = 'Variant is required';
    if (
      form.last5ChassisNumber &&
      !/^[a-zA-Z0-9]{5}$/.test(form.last5ChassisNumber)
    ) {
      next.last5ChassisNumber = 'Enter exactly last 5 chassis digits';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries({
          ...form,
          yearOfManufacture: form.yearOfManufacture
            ? Number(form.yearOfManufacture)
            : undefined,
          purchaseAmount: form.purchaseAmount
            ? Number(form.purchaseAmount)
            : undefined,
        }).filter(([, value]) => value !== '' && value !== undefined),
      );
      await onSubmit(
        payload,
        editingId,
      );
      setOpen(false);
      setEditingId(null);
      setForm(INITIAL_FORM);
      setErrors({});
    } finally {
      setSaving(false);
    }
  };

  return (
    <NormalModal
      open={open}
      onClose={() => setOpen(false)}
      title={editingId ? 'Edit Lead' : 'Create Lead'}
      maxWidth="lg"
      actions={
        <>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {!readOnly && (
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {editingId ? 'Save Lead' : 'Create Lead'}
            </Button>
          )}
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Lead Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lead Name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mobile Number"
              value={form.mobileNumber}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
              error={Boolean(errors.mobileNumber)}
              helperText={errors.mobileNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={staffOptions}
              value={selectedStaff}
              onChange={(_, value) => handleChange('assignedTo', value?.id || '')}
              renderInput={(params) => (
                <TextField {...params} label="Assign Staff" fullWidth sx={inputSx} />
              )}
              clearOnEscape
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vehicle Name"
              value={form.vehicleName}
              onChange={(e) => handleChange('vehicleName', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
              error={Boolean(errors.vehicleName)}
              helperText={errors.vehicleName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Wheel Variant"
              value={form.variant}
              onChange={(e) => handleChange('variant', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
              error={Boolean(errors.variant)}
              helperText={errors.variant}
            >
              {WHEEL_VARIANTS.map((item) => (
                <MenuItem key={item} value={item}>
                  {item.replaceAll('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Vehicle Type"
              value={form.vehicleType}
              onChange={(e) => handleChange('vehicleType', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            >
              {VEHICLE_TYPES.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Fuel Type"
              value={form.fuelType}
              onChange={(e) => handleChange('fuelType', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            >
              {FUEL_TYPES.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last 5 Chassis Digits"
              value={form.last5ChassisNumber}
              onChange={(e) => handleChange('last5ChassisNumber', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
              error={Boolean(errors.last5ChassisNumber)}
              helperText={errors.last5ChassisNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Registration Number"
              value={form.registrationNumber}
              onChange={(e) => handleChange('registrationNumber', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Engine Number"
              value={form.engineNumber}
              onChange={(e) => handleChange('engineNumber', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="RTO District / Branch"
              value={form.rtoDistrictBranch}
              onChange={(e) => handleChange('rtoDistrictBranch', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Color"
              value={form.color}
              onChange={(e) => handleChange('color', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Year Of Manufacture"
              type="number"
              value={form.yearOfManufacture}
              onChange={(e) => handleChange('yearOfManufacture', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Lead Source"
              select
              value={form.leadSource}
              onChange={(e) => handleChange('leadSource', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            >
              {LEAD_SOURCES.map((item) => (
                <MenuItem key={item} value={item}>
                  {item.replaceAll('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isOwnerSelf}
                  onChange={(e) => handleChange('isOwnerSelf', e.target.checked)}
                  disabled={readOnly}
                />
              }
              label={form.isOwnerSelf ? 'Owner: Self' : 'Owner: Other'}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.reverseChargeApplicable}
                  onChange={(e) =>
                    handleChange('reverseChargeApplicable', e.target.checked)
                  }
                  disabled={readOnly}
                />
              }
              label="Reverse Charge"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Aadhaar Number"
              value={form.aadhaarNumber}
              onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="PAN Number"
              value={form.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Place Of Supply State"
              value={form.placeOfSupplyState}
              onChange={(e) => handleChange('placeOfSupplyState', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Purchase Amount"
              type="number"
              value={form.purchaseAmount}
              onChange={(e) => handleChange('purchaseAmount', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Purchase Date"
              type="date"
              value={form.purchaseDate}
              onChange={(e) => handleChange('purchaseDate', e.target.value)}
              fullWidth
              sx={inputSx}
              disabled={readOnly}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Remarks / Additional Comments"
              value={form.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              fullWidth
              multiline
              minRows={3}
              sx={inputSx}
              disabled={readOnly}
            />
          </Grid>
        </Grid>
      </Box>
    </NormalModal>
  );
});

LeadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default LeadForm;
