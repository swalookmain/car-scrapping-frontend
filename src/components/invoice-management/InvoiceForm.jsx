import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Grid,
  CircularProgress
} from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { invoicesApi } from '../../services/api';
import InvoiceSellerFields from './InvoiceSellerFields';
import InvoiceVehicleStep from './InvoiceVehicleStep';

// ── Constants ──────────────────────────────────────────────────
const SELLER_TYPES = ['DIRECT', 'MSTC', 'GEM'];
const STEPS = ['Invoice Details', 'Vehicle Details'];

const INITIAL_INVOICE = {
  sellerName: '',
  sellerType: 'DIRECT',
  invoiceNumber: '',
  sellerGstin: '',
  purchaseAmount: '',
  purchaseDate: '',
  gstApplicable: false,
  gstRate: '',
  gstAmount: '',
  reverseChargeApplicable: false,
  status: 'DRAFT',
  // DIRECT-specific
  mobile: '',
  email: '',
  aadhaarNumber: '',
  panNumber: '',
  leadSource: 'WEBSITE',
  // MSTC-specific
  auctionNumber: '',
  auctionDate: '',
  source: '',
  lotNumber: '',
};

const INITIAL_VEHICLE = {
  ownerName: '',
  vehicle_type: 'CAR',
  make: '',
  model_name: '',
  variant: '',
  fuel_type: 'PETROL',
  registration_number: '',
  chassis_number: '',
  engine_number: '',
  color: '',
  year_of_manufacture: '',
  vehicle_purchase_date: '',
};

// ── Component ──────────────────────────────────────────────────
const InvoiceForm = forwardRef(({ onSubmit, readOnly = false, onClose }, ref) => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [invoice, setInvoice] = useState({ ...INITIAL_INVOICE });
  const [vehicle, setVehicle] = useState({ ...INITIAL_VEHICLE });
  const [initialInvoice, setInitialInvoice] = useState(null);
  const [initialVehicle, setInitialVehicle] = useState(null);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // refs for focus-on-error
  const fieldRefs = useRef({});

  useImperativeHandle(ref, () => ({
    open: (item) => {
      if (item) {
        // Populate invoice fields
        const loadedInvoice = {
          sellerName: item.sellerName || '',
          sellerType: item.sellerType || 'DIRECT',
          invoiceNumber: item.invoiceNumber || '',
          sellerGstin: item.sellerGstin || '',
          purchaseAmount: item.purchaseAmount ?? '',
          purchaseDate: item.purchaseDate ? item.purchaseDate.slice(0, 10) : '',
          gstApplicable: Boolean(item.gstApplicable),
          gstRate: item.gstRate ?? '',
          gstAmount: item.gstAmount ?? '',
          reverseChargeApplicable: Boolean(item.reverseChargeApplicable),
          status: item.status || 'DRAFT',
          mobile: item.mobile || '',
          email: item.email || '',
          aadhaarNumber: item.aadhaarNumber || '',
          panNumber: item.panNumber || '',
          leadSource: item.leadSource || 'WEBSITE',
          auctionNumber: item.auctionNumber || '',
          auctionDate: item.auctionDate ? item.auctionDate.slice(0, 10) : '',
          source: item.source || '',
          lotNumber: item.lotNumber || '',
        };
        setInvoice(loadedInvoice);
        setInitialInvoice(loadedInvoice);
        // Populate vehicle fields if present
        if (item.vehicle) {
          const loadedVehicle = {
            ownerName: item.vehicle.ownerName || '',
            vehicle_type: item.vehicle.vehicle_type || 'CAR',
            make: item.vehicle.make || '',
            model_name: item.vehicle.model_name || item.vehicle.model || '',
            variant: item.vehicle.variant || '',
            fuel_type: item.vehicle.fuel_type || 'PETROL',
            registration_number: item.vehicle.registration_number || '',
            chassis_number: item.vehicle.chassis_number || '',
            engine_number: item.vehicle.engine_number || '',
            color: item.vehicle.color || '',
            year_of_manufacture: item.vehicle.year_of_manufacture ?? '',
            vehicle_purchase_date: item.vehicle.vehicle_purchase_date ? item.vehicle.vehicle_purchase_date.slice(0, 10) : '',
          };
          setVehicle(loadedVehicle);
          setInitialVehicle(loadedVehicle);
          setEditingVehicleId(item.vehicle._id || item.vehicle.id || null);
        } else {
          const emptyVehicle = { ...INITIAL_VEHICLE };
          setVehicle(emptyVehicle);
          setInitialVehicle(emptyVehicle);
          setEditingVehicleId(null);
        }
        setEditingId(item._id || item.id || null);
        // If opened in readOnly mode, try to fetch linked vehicle immediately
        if (readOnly) {
          const id = item._id || item.id || null;
          if (id) {
            setVehicleLoading(true);
            (async () => {
              try {
                const res = await invoicesApi.getVehicleById(id);
                const vehicles = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
                const vData = vehicles.length > 0 ? vehicles[0] : null;
                if (vData) populateVehicleFromData(vData);
              } catch (err) {
                // ignore
              } finally {
                setVehicleLoading(false);
              }
            })();
          }
        }
      } else {
        setInvoice({ ...INITIAL_INVOICE });
        setVehicle({ ...INITIAL_VEHICLE });
        setInitialInvoice(null);
        setInitialVehicle(null);
        setEditingId(null);
        setEditingVehicleId(null);
      }
      setActiveStep(0);
      setErrors({});
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingId(null);
      setEditingVehicleId(null);
      if (onClose) onClose();
    },
  }));

  // ── Helpers ──────────────────────────────────────────────────
  const handleInvoiceChange = (field, value) => {
    if (readOnly) return;
    setInvoice((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleVehicleChange = (field, value) => {
    if (readOnly) return;
    setVehicle((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  // ── Validation ───────────────────────────────────────────────
  const validateInvoice = () => {
    const err = {};
    if (!invoice.sellerName.trim()) err.sellerName = 'Seller name is required';
    if (!invoice.invoiceNumber.trim()) err.invoiceNumber = 'Invoice number is required';
    if (!invoice.purchaseAmount && invoice.purchaseAmount !== 0) err.purchaseAmount = 'Purchase amount is required';
    if (!invoice.purchaseDate) err.purchaseDate = 'Purchase date is required';

    // Seller-type specific validations
    if (invoice.sellerType === 'DIRECT') {
      if (!invoice.mobile.trim()) err.mobile = 'Mobile is required';
      if (!invoice.email.trim()) err.email = 'Email is required';
      if (!invoice.aadhaarNumber.trim()) err.aadhaarNumber = 'Aadhaar number is required';
      if (!invoice.panNumber.trim()) err.panNumber = 'PAN number is required';
    }
    if (invoice.sellerType === 'MSTC') {
      if (!invoice.auctionNumber.trim()) err.auctionNumber = 'Auction number is required';
      if (!invoice.auctionDate) err.auctionDate = 'Auction date is required';
      if (!invoice.source.trim()) err.source = 'Source is required';
      if (!invoice.lotNumber.trim()) err.lotNumber = 'Lot number is required';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateVehicle = () => {
    const err = {};
    if (!vehicle.ownerName.trim()) err.ownerName = 'Owner name is required';
    if (!vehicle.make.trim()) err.make = 'Make is required';
    if (!vehicle.model_name.trim()) err.model_name = 'Model is required';
    if (!vehicle.registration_number.trim()) err.registration_number = 'Registration number is required';
    if (!vehicle.chassis_number.trim()) err.chassis_number = 'Chassis number is required';
    if (!vehicle.engine_number.trim()) err.engine_number = 'Engine number is required';
    if (!vehicle.year_of_manufacture) err.year_of_manufacture = 'Year of manufacture is required';
    if (!vehicle.vehicle_purchase_date) err.vehicle_purchase_date = 'Vehicle purchase date is required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Populate vehicle from API response ────────────────────────
  const populateVehicleFromData = (vData) => {
    const loadedVehicle = {
      ownerName: vData.ownerName || vData.owner || vData.owner_name || '',
      vehicle_type: vData.vehicle_type || vData.vehicleType || 'CAR',
      make: vData.make || vData.make_name || vData.vehicleName || '',
      model_name: vData.model_name || vData.model || vData.modelName || '',
      variant: vData.variant || '',
      fuel_type: vData.fuel_type || vData.fuelType || 'PETROL',
      registration_number: vData.registration_number || vData.registrationNumber || vData.vehicleNumber || '',
      chassis_number: vData.chassis_number || vData.chassisNumber || '',
      engine_number: vData.engine_number || vData.engineNumber || '',
      color: vData.color || '',
      year_of_manufacture: vData.year_of_manufacture ?? vData.yearOfManufacture ?? '',
      vehicle_purchase_date: (vData.vehicle_purchase_date || vData.vehiclePurchaseDate) ? (vData.vehicle_purchase_date || vData.vehiclePurchaseDate).slice(0, 10) : '',
    };
    setVehicle(loadedVehicle);
    setInitialVehicle(loadedVehicle);
    setEditingVehicleId(vData._id || vData.id || null);
  };

  // ── Step Navigation ──────────────────────────────────────────
  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateInvoice()) return;

      // When editing, fetch existing vehicle invoice by invoice ID
      if (editingId && !editingVehicleId) {
        setVehicleLoading(true);
        try {
          const res = await invoicesApi.getVehicleById(editingId);
          // API returns { data: [...], meta: {...} } - get first item from array
          const vehicles = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
          const vData = vehicles.length > 0 ? vehicles[0] : null;
          if (vData) {
            populateVehicleFromData(vData);
          }
        } catch (err) {
          // vehicle may not exist yet – keep empty form
          console.error('Vehicle fetch error:', err);
        } finally {
          setVehicleLoading(false);
        }
      }

      setActiveStep(1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep(0);
  };

  const handleReadOnlyNext = () => {
    if (activeStep === STEPS.length - 1) handleClose();
    else setActiveStep((s) => s + 1);
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validateVehicle()) return;

    // Build invoice payload based on seller type
    const invoicePayload = {
      sellerName: invoice.sellerName,
      sellerType: invoice.sellerType,
      invoiceNumber: invoice.invoiceNumber,
      sellerGstin: invoice.sellerGstin,
      purchaseAmount: Number(invoice.purchaseAmount),
      purchaseDate: invoice.purchaseDate,
      gstApplicable: invoice.gstApplicable,
      gstRate: invoice.gstRate ? Number(invoice.gstRate) : 0,
      gstAmount: invoice.gstAmount ? Number(invoice.gstAmount) : 0,
      reverseChargeApplicable: invoice.sellerType === 'DIRECT' ? invoice.reverseChargeApplicable : false,
      status: invoice.status,
    };

    // Add seller-specific fields
    if (invoice.sellerType === 'DIRECT') {
      invoicePayload.mobile = invoice.mobile;
      invoicePayload.email = invoice.email;
      invoicePayload.aadhaarNumber = invoice.aadhaarNumber;
      invoicePayload.panNumber = invoice.panNumber;
      invoicePayload.leadSource = invoice.leadSource;
    } else if (invoice.sellerType === 'MSTC') {
      invoicePayload.auctionNumber = invoice.auctionNumber;
      invoicePayload.auctionDate = invoice.auctionDate;
      invoicePayload.source = invoice.source;
      invoicePayload.lotNumber = invoice.lotNumber;
    }

    const vehiclePayload = {
      // include both snake_case and camelCase to match API variations
      ownerName: vehicle.ownerName,
      owner_name: vehicle.ownerName,
      vehicle_type: vehicle.vehicle_type,
      vehicleType: vehicle.vehicle_type,
      make: vehicle.make,
      model_name: vehicle.model_name,
      modelName: vehicle.model_name,
      variant: vehicle.variant,
      fuel_type: vehicle.fuel_type,
      fuelType: vehicle.fuel_type,
      registration_number: vehicle.registration_number,
      registrationNumber: vehicle.registration_number,
      vehicleNumber: vehicle.registration_number,
      chassis_number: vehicle.chassis_number,
      chassisNumber: vehicle.chassis_number,
      engine_number: vehicle.engine_number,
      engineNumber: vehicle.engine_number,
      color: vehicle.color,
      year_of_manufacture: vehicle.year_of_manufacture ? Number(vehicle.year_of_manufacture) : 0,
      yearOfManufacture: vehicle.year_of_manufacture ? Number(vehicle.year_of_manufacture) : 0,
      vehicle_purchase_date: vehicle.vehicle_purchase_date,
      vehiclePurchaseDate: vehicle.vehicle_purchase_date,
    };

    onSubmit({ invoice: invoicePayload, vehicle: vehiclePayload, editingId, editingVehicleId });

    // Reset
    setInvoice({ ...INITIAL_INVOICE });
    setVehicle({ ...INITIAL_VEHICLE });
    setInitialInvoice(null);
    setInitialVehicle(null);
    setErrors({});
    setEditingId(null);
    setEditingVehicleId(null);
    setActiveStep(0);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setInvoice({ ...INITIAL_INVOICE });
    setVehicle({ ...INITIAL_VEHICLE });
    setInitialInvoice(null);
    setInitialVehicle(null);
    setErrors({});
    setActiveStep(0);
  };

  // ── Step 1: Invoice Details ──────────────────────────────────
  const renderInvoiceStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
        Basic Invoice Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Seller Type"
            value={invoice.sellerType}
            onChange={(e) => handleInvoiceChange('sellerType', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
          >
            {SELLER_TYPES.map((st) => (
              <MenuItem key={st} value={st}>{st}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Seller Name"
            value={invoice.sellerName}
            onChange={(e) => handleInvoiceChange('sellerName', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.sellerName)}
            helperText={errors.sellerName}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Invoice Number"
            value={invoice.invoiceNumber}
            onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.invoiceNumber)}
            helperText={errors.invoiceNumber}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Seller GSTIN"
            value={invoice.sellerGstin}
            onChange={(e) => handleInvoiceChange('sellerGstin', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Purchase Amount"
            type="number"
            value={invoice.purchaseAmount}
            onChange={(e) => handleInvoiceChange('purchaseAmount', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            error={Boolean(errors.purchaseAmount)}
            helperText={errors.purchaseAmount}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Purchase Date"
            type="date"
            value={invoice.purchaseDate}
            onChange={(e) => handleInvoiceChange('purchaseDate', e.target.value)}
            fullWidth
            disabled={readOnly}
            sx={inputSx}
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.purchaseDate)}
            helperText={errors.purchaseDate}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={invoice.gstApplicable}
                onChange={(e) => handleInvoiceChange('gstApplicable', e.target.checked)}
                disabled={readOnly}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' },
                }}
              />
            }
            label="GST Applicable"
          />
        </Grid>
        {invoice.gstApplicable && (
          <>
            <Grid item xs={12} sm={4}>
              <TextField
                label="GST Rate (%)"
                type="number"
                value={invoice.gstRate}
                onChange={(e) => handleInvoiceChange('gstRate', e.target.value)}
                fullWidth
                disabled={readOnly}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="GST Amount"
                type="number"
                value={invoice.gstAmount}
                onChange={(e) => handleInvoiceChange('gstAmount', e.target.value)}
                fullWidth
                disabled={readOnly}
                sx={inputSx}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Divider sx={{ my: 1 }} />

      <InvoiceSellerFields
        sellerType={invoice.sellerType}
        invoice={invoice}
        errors={errors}
        onChange={handleInvoiceChange}
        readOnly={readOnly}
      />
    </Box>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <NormalModal
      open={open}
      onClose={handleClose}
      title={readOnly ? 'View Purchase Invoice' : (editingId ? 'Edit Purchase Invoice' : 'Add Purchase Invoice')}
      maxWidth="md"
      actions={
        readOnly ? (
          <>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ color: 'var(--color-grey-600)' }}>
                Back
              </Button>
            )}
            <Button
              onClick={handleReadOnlyNext}
              variant="contained"
              sx={{
                backgroundColor: 'var(--color-secondary-main)',
                '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
              }}
            >
              {activeStep === STEPS.length - 1 ? 'Close' : 'Next'}
            </Button>
          </>
        ) : (
          <>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ color: 'var(--color-grey-600)' }}>
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={vehicleLoading || (!!editingId && activeStep === STEPS.length - 1 && !(
                !initialInvoice ||
                JSON.stringify(invoice) !== JSON.stringify(initialInvoice) ||
                JSON.stringify(vehicle) !== JSON.stringify(initialVehicle)
              ))}
              sx={{
                backgroundColor: 'var(--color-secondary-main)',
                '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
              }}
            >
              {activeStep === STEPS.length - 1 ? (editingId ? 'Save' : 'Create Invoice') : 'Next'}
            </Button>
          </>
        )
      }
    >
      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 3,
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

      {activeStep === 0 ? renderInvoiceStep() : (
        vehicleLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress sx={{ color: 'var(--color-secondary-main)' }} />
          </Box>
        ) : <InvoiceVehicleStep vehicle={vehicle} errors={errors} onChange={handleVehicleChange} readOnly={readOnly} />
      )}
    </NormalModal>
  );
});

InvoiceForm.propTypes = {
  onSubmit: PropTypes.func,
  readOnly: PropTypes.bool,
  onClose: PropTypes.func,
};

export default InvoiceForm;
