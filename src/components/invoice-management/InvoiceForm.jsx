import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
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
  StepButton,
  Divider,
  Grid,
  CircularProgress
} from '@mui/material';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi, leadsApi, taxComplianceApi } from '../../services/api';
import { calculateGst, INDIAN_STATE_CODES } from '../../services/taxEngine';
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
  sellerState: '',
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
  leadId: '',
};

const INITIAL_VEHICLE = {
  ownerName: '',
  isOwnerSelf: true,
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
  rto_district_branch: '',
};

// ── Component ──────────────────────────────────────────────────
const InvoiceForm = forwardRef(({ onSaveInvoice, onSubmitVehicle, readOnly = false, onClose }, ref) => {
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
  const [leadOptions, setLeadOptions] = useState([]);
  const [documents, setDocuments] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    rcFront: null,
    rcBack: null,
    pan: null,
    bankDetail: null,
  });
  const [existingDocuments, setExistingDocuments] = useState([]);

  useEffect(() => {
    if (!open || readOnly || invoice.sellerType !== 'DIRECT') return;
    let active = true;
    leadsApi
      .getAll({ page: 1, limit: 200, status: 'OPEN' })
      .then((res) => {
        if (!active) return;
        const items = Array.isArray(res?.data) ? res.data : [];
        setLeadOptions(
          items.map((item) => ({
            ...item,
            id: item._id || item.id,
            label: `${item.name}${item.vehicleName ? ` - ${item.vehicleName}` : ''}`,
          })),
        );
      })
      .catch(() => {
        if (active) setLeadOptions([]);
      });

    return () => {
      active = false;
    };
  }, [open, readOnly, invoice.sellerType]);

  // ── Fetch tax config for GST breakup ─────────────────────────
  const { data: taxConfigData } = useQuery({
    queryKey: ['tax-config-for-purchase'],
    queryFn: () => taxComplianceApi.getConfig({ useCache: true }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const taxConfig = useMemo(() => {
    const cfg = taxConfigData?.data || taxConfigData;
    return {
      defaultGstRate: cfg?.defaultGstRate ?? cfg?.default_gst_rate ?? 18,
      stateCode: cfg?.stateCode ?? cfg?.state_code ?? '',
      gstEnabled: cfg?.gstEnabled ?? cfg?.gst_enabled ?? true,
    };
  }, [taxConfigData]);

  // ── GST Breakup Calculation ──────────────────────────────────
  const purchaseGstBreakup = useMemo(() => {
    return calculateGst({
      taxableAmount: Number(invoice.purchaseAmount) || 0,
      gstRate: Number(invoice.gstRate) || 0,
      gstApplicable: invoice.gstApplicable,
      orgStateCode: taxConfig.stateCode,
      placeOfSupplyState: invoice.sellerState || taxConfig.stateCode,
      reverseCharge: invoice.reverseChargeApplicable,
    });
  }, [invoice.purchaseAmount, invoice.gstRate, invoice.gstApplicable, invoice.sellerState, invoice.reverseChargeApplicable, taxConfig.stateCode]);

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
          sellerState: item.sellerState || item.seller_state || '',
          status: item.status || 'DRAFT',
          mobile: item.mobile || '',
          email: item.email || '',
          aadhaarNumber: item.aadhaarNumber || '',
          panNumber: item.panNumber || '',
          leadSource: item.leadSource || 'WEBSITE',
          leadId: item.leadId || '',
          auctionNumber: item.auctionNumber || '',
          auctionDate: item.auctionDate ? item.auctionDate.slice(0, 10) : '',
          source: item.source || '',
          lotNumber: item.lotNumber || '',
        };
        setInvoice(loadedInvoice);
        setInitialInvoice(loadedInvoice);
        const invoiceId = item._id || item.id || null;
        if (invoiceId) {
          invoicesApi
            .getDocuments(invoiceId)
            .then((res) => {
              const docs = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
              setExistingDocuments(docs);
            })
            .catch(() => setExistingDocuments([]));
        } else {
          setExistingDocuments([]);
        }
        // Populate vehicle fields if present
        if (item.vehicle) {
          const loadedVehicle = {
            ownerName: item.vehicle.ownerName || '',
            isOwnerSelf:
              typeof item.vehicle.isOwnerSelf === 'boolean'
                ? item.vehicle.isOwnerSelf
                : true,
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
            rto_district_branch: item.vehicle.rto_district_branch || '',
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
              } catch {
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
        setDocuments({
          aadhaarFront: null,
          aadhaarBack: null,
          rcFront: null,
          rcBack: null,
          pan: null,
          bankDetail: null,
        });
        setExistingDocuments([]);
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

  const handleDocumentChange = (field, value) => {
    setDocuments((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleLeadSelect = async (leadId) => {
    if (!leadId) {
      handleInvoiceChange('leadId', '');
      return;
    }

    try {
      const res = await leadsApi.getLookupById(leadId);
      const lead = res?.data || res;
      setInvoice((prev) => ({
        ...prev,
        leadId: lead._id || lead.id || '',
        sellerType: 'DIRECT',
        sellerName: lead.name || prev.sellerName,
        mobile: lead.mobileNumber || prev.mobile,
        email: lead.email || prev.email,
        aadhaarNumber: lead.aadhaarNumber || prev.aadhaarNumber,
        panNumber: lead.panNumber || prev.panNumber,
        leadSource: lead.leadSource || prev.leadSource,
        purchaseAmount: lead.purchaseAmount ?? prev.purchaseAmount,
        purchaseDate: lead.purchaseDate ? lead.purchaseDate.slice(0, 10) : prev.purchaseDate,
        sellerState: lead.placeOfSupplyState || prev.sellerState,
        reverseChargeApplicable:
          typeof lead.reverseChargeApplicable === 'boolean'
            ? lead.reverseChargeApplicable
            : prev.reverseChargeApplicable,
      }));
      setVehicle((prev) => ({
        ...prev,
        ownerName: lead.name || prev.ownerName,
        isOwnerSelf:
          typeof lead.isOwnerSelf === 'boolean' ? lead.isOwnerSelf : prev.isOwnerSelf,
        vehicle_type: lead.vehicleType || prev.vehicle_type,
        make: lead.vehicleName || prev.make,
        variant: lead.variant || prev.variant,
        fuel_type: lead.fuelType || prev.fuel_type,
        registration_number: lead.registrationNumber || prev.registration_number,
        chassis_number: lead.last5ChassisNumber || prev.chassis_number,
        engine_number: lead.engineNumber || prev.engine_number,
        color: lead.color || prev.color,
        year_of_manufacture: lead.yearOfManufacture ?? prev.year_of_manufacture,
        rto_district_branch: lead.rtoDistrictBranch || prev.rto_district_branch,
      }));
    } catch {
      // keep manual flow usable even if lookup hydration fails
    }
  };

  // ── Validation ───────────────────────────────────────────────
  const validateInvoice = () => {
    const err = {};
    if (!invoice.sellerName.trim()) err.sellerName = 'Seller name is required';
    // if (!invoice.invoiceNumber.trim()) err.invoiceNumber = 'Invoice number is required';
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
    const existingTypes = new Set(
      existingDocuments.map((document) => document.documentType),
    );
    if (!vehicle.ownerName.trim()) err.ownerName = 'Owner name is required';
    if (!vehicle.make.trim()) err.make = 'Make is required';
    if (!vehicle.model_name.trim()) err.model_name = 'Model is required';
    if (!vehicle.registration_number.trim()) err.registration_number = 'Registration number is required';
    if (!vehicle.chassis_number.trim()) err.chassis_number = 'Chassis number is required';
    if (!vehicle.engine_number.trim()) err.engine_number = 'Engine number is required';
    if (!vehicle.year_of_manufacture) err.year_of_manufacture = 'Year of manufacture is required';
    if (!vehicle.vehicle_purchase_date) err.vehicle_purchase_date = 'Vehicle purchase date is required';
    if (!vehicle.rto_district_branch?.trim())
      err.rto_district_branch = 'RTO district/branch is required';
    if (!documents.aadhaarFront && !existingTypes.has('aadhaarFront') && !existingTypes.has('ownerId')) {
      err.aadhaarFront = 'Aadhaar front is required';
    }
    if (!documents.rcFront && !existingTypes.has('rcFront')) {
      err.rcFront = 'RC front is required';
    }

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
      rto_district_branch: vData.rto_district_branch || '',
      isOwnerSelf:
        typeof vData.isOwnerSelf === 'boolean' ? vData.isOwnerSelf : true,
    };
    setVehicle(loadedVehicle);
    setInitialVehicle(loadedVehicle);
    setEditingVehicleId(vData._id || vData.id || null);
  };

  // ── Payload Helper ───────────────────────────────────────────
  const getInvoicePayload = () => {
    const invoicePayload = {
      sellerName: invoice.sellerName,
      sellerType: invoice.sellerType,
      sellerGstin: invoice.sellerGstin,
      purchaseAmount: Number(invoice.purchaseAmount),
      purchaseDate: invoice.purchaseDate,
      placeOfSupplyState: invoice.sellerState || taxConfig.stateCode,
      gstApplicable: invoice.gstApplicable,
      gstRate: invoice.gstRate ? Number(invoice.gstRate) : 0,
      gstAmount: invoice.gstAmount ? Number(invoice.gstAmount) : 0,
      reverseChargeApplicable: invoice.sellerType === 'DIRECT' ? invoice.reverseChargeApplicable : false,
      status: invoice.status,
      leadId: invoice.leadId || undefined,
    };

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
    return invoicePayload;
  };

  // ── Step Navigation ──────────────────────────────────────────
  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateInvoice()) return;

      setVehicleLoading(true);
      try {
        const payload = getInvoicePayload();
        const res = await onSaveInvoice(payload, editingId);
        
        if (res && res.success) {
          const newId = res.id;
          setEditingId(newId);
          setActiveStep(1);
        }
      } finally {
        setVehicleLoading(false);
      }
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
  const handleSubmit = async () => {
    if (!validateVehicle()) return;

    const vehiclePayload = {
      ownerName: vehicle.ownerName,
      isOwnerSelf: Boolean(vehicle.isOwnerSelf),
      vehicle_type: vehicle.vehicle_type,
      make: vehicle.make,
      model: vehicle.model_name,
      variant: vehicle.variant,
      fuel_type: vehicle.fuel_type,
      registration_number: vehicle.registration_number,
      chassis_number: vehicle.chassis_number,
      engine_number: vehicle.engine_number,
      color: vehicle.color,
      year_of_manufacture: vehicle.year_of_manufacture ? Number(vehicle.year_of_manufacture) : 0,
      vehicle_purchase_date: vehicle.vehicle_purchase_date,
      rto_district_branch: vehicle.rto_district_branch,
    };

    setVehicleLoading(true);
    const res = await onSubmitVehicle(
      vehiclePayload,
      editingId,
      editingVehicleId,
      documents,
    );
    setVehicleLoading(false);

    if (res && res.success) {
      // Reset
      setInvoice({ ...INITIAL_INVOICE });
      setVehicle({ ...INITIAL_VEHICLE });
      setInitialInvoice(null);
      setInitialVehicle(null);
      setErrors({});
      setEditingId(null);
      setEditingVehicleId(null);
      setDocuments({
        aadhaarFront: null,
        aadhaarBack: null,
        rcFront: null,
        rcBack: null,
        pan: null,
        bankDetail: null,
      });
      setExistingDocuments([]);
      setActiveStep(0);
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInvoice({ ...INITIAL_INVOICE });
    setVehicle({ ...INITIAL_VEHICLE });
    setInitialInvoice(null);
    setInitialVehicle(null);
    setErrors({});
    setDocuments({
      aadhaarFront: null,
      aadhaarBack: null,
      rcFront: null,
      rcBack: null,
      pan: null,
      bankDetail: null,
    });
    setExistingDocuments([]);
    setActiveStep(0);
  };

  // ── Step 1: Invoice Details ──────────────────────────────────
  const renderInvoiceStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {invoice.sellerType === 'DIRECT' && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)' }}>
            Lead Selection
          </Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                select
                label="Lead Selection"
                value={invoice.leadId || ''}
                onChange={(e) => handleLeadSelect(e.target.value)}
                fullWidth
                sx={inputSx}
                disabled={readOnly}
                helperText="Select a lead to auto-fetch all details."
              >
                <MenuItem value="">None</MenuItem>
                {leadOptions.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
        </Box>
      )}

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
        {/* <Grid item xs={12} sm={6}>
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
        </Grid> */}
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
            sx={{ alignItems: 'center' }}
            control={
              <Switch
                checked={invoice.gstApplicable}
                onChange={(e) => handleInvoiceChange('gstApplicable', e.target.checked)}
                disabled={readOnly}
                sx={{
                  transform: 'translateY(4px)',
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
                select
                label="Seller State"
                value={invoice.sellerState}
                onChange={(e) => handleInvoiceChange('sellerState', e.target.value)}
                fullWidth
                disabled={readOnly}
                sx={inputSx}
                helperText={purchaseGstBreakup.isInterstate ? 'Inter-State (IGST)' : taxConfig.stateCode ? 'Intra-State (CGST+SGST)' : ''}
              >
                <MenuItem value="">Same as Org State</MenuItem>
                {INDIAN_STATE_CODES.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </>
        )}
        {invoice.gstApplicable && (
          <>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', p: 1.5, borderRadius: 2, backgroundColor: 'var(--color-grey-50)' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600 }}>CGST</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                    ₹{purchaseGstBreakup.cgstAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600 }}>SGST</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#00695c' }}>
                    ₹{purchaseGstBreakup.sgstAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600 }}>IGST</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#6a1b9a' }}>
                    ₹{purchaseGstBreakup.igstAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600 }}>Total Tax</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ₹{purchaseGstBreakup.totalTaxAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                {invoice.reverseChargeApplicable && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 600 }}>RCM Applied</Typography>
                    <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600 }}>
                      Tax not added to payable
                    </Typography>
                  </Box>
                )}
              </Box>
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
      maxWidth="lg"
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
              {activeStep === STEPS.length - 1 ? 'Save Vehicle' : (editingId ? 'Save & Next' : 'Save & Next')}
            </Button>
          </>
        )
      }
    >
      {/* Stepper */}
      <Stepper
        nonLinear={!!editingId}
        activeStep={activeStep}
        sx={{
          mb: 3,
          '& .MuiStepIcon-root.Mui-active': { color: 'var(--color-secondary-main)' },
          '& .MuiStepIcon-root.Mui-completed': { color: 'var(--color-secondary-main)' },
        }}
      >
        {STEPS.map((label, index) => (
          <Step key={label}>
            {editingId && !readOnly ? (
              <StepButton color="inherit" onClick={() => setActiveStep(index)}>
                {label}
              </StepButton>
            ) : (
              <StepLabel>{label}</StepLabel>
            )}
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 ? renderInvoiceStep() : (
        vehicleLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress sx={{ color: 'var(--color-secondary-main)' }} />
          </Box>
        ) : (
          <InvoiceVehicleStep
            vehicle={vehicle}
            errors={errors}
            onChange={handleVehicleChange}
            readOnly={readOnly}
            documents={documents}
            onDocumentChange={handleDocumentChange}
          />
        )
      )}
    </NormalModal>
  );
});

InvoiceForm.propTypes = {
  onSaveInvoice: PropTypes.func,
  onSubmitVehicle: PropTypes.func,
  readOnly: PropTypes.bool,
  onClose: PropTypes.func,
};

export default InvoiceForm;
