import { useState, useRef, useEffect, useCallback } from 'react';
import { invoicesApi, yardApi, partCatalogApi } from '../../services/api';
import useApiCall from '../../hooks/useApiCall';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const buildDocObjects = (docs) =>
  (docs || [])
    .map((doc) => {
      if (typeof doc === 'string') return { name: doc };
      if (doc.dataUrl) return { name: doc.name, type: doc.type, data: doc.dataUrl };
      const { dataUrl: _d, file: _f, size: _s, ...rest } = doc;
      return rest;
    })
    .filter(Boolean);

// ── Constants ──────────────────────────────────────────────────
export const PART_TYPES  = ['ENGINE', 'TRANSMISSION', 'BRAKES', 'SUSPENSION', 'ELECTRICAL', 'EXHAUST', 'BODY', 'PLASTIC', 'OTHER'];
export const CONDITIONS  = ['GOOD', 'DAMAGED'];
export const STATUSES    = ['AVAILABLE', 'PARTIAL_SOLD', 'SOLD_OUT', 'DAMAGE_ONLY'];
export const VEHICLE_TYPES = ['CAR', 'BIKE', 'COMMERCIAL'];

let _partIdCounter = 0;
const generatePartId = () => `part_${++_partIdCounter}_${Date.now()}`;

export const createPartFromCatalog = (item) => ({
  _uid: generatePartId(),
  catalogPartId: item.catalogPartId,
  catalogPartCode: item.code,
  partName: item.partName,
  partType: item.partType || 'OTHER',
  category: item.category || 'SALEABLE',
  openingStock: item.defaultQty ?? 1,
  quantityReceived: 0,
  quantityIssued: 0,
  unitPrice: 0,
  condition: 'GOOD',
  status: 'AVAILABLE',
  documents: [],
  included: item.category !== 'SCRAP',
});

export const createInitialPart = () => ({
  _uid: generatePartId(),
  partName: '',
  partType: 'ENGINE',
  openingStock: 0,
  quantityReceived: 0,
  quantityIssued: 0,
  unitPrice: '',
  condition: 'GOOD',
  status: 'AVAILABLE',
  documents: [],
});

// ── Hook ───────────────────────────────────────────────────────
export function useInventoryForm({ onSubmit, readOnly }) {
  const [open,           setOpen]          = useState(false);
  const { execute: executeForm, loading: loading } = useApiCall();
  const { execute: executeInvoice, loading: invoiceLoading } = useApiCall();
  const { execute: executeVehicle, loading: vehicleFetching } = useApiCall();
  const { execute: executeYard, loading: yardLoading } = useApiCall();

  // Invoice & Vehicle selection
  const [invoices,         setInvoices]         = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [invoiceVehicles, setInvoiceVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleLabel,     setVehicleLabel]     = useState('');
  const [yardRecord, setYardRecord] = useState(null);

  // Catalog checklist
  const [catalogMode, setCatalogMode] = useState(false);
  const [catalogMeta, setCatalogMeta] = useState(null);
  const [catalogMmv, setCatalogMmv] = useState({
    make: '',
    model: '',
    variant: 'Standard',
    vehicleType: 'CAR',
  });
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Parts & validation
  const [parts,    setParts]  = useState([createInitialPart()]);
  const [errors,   setErrors] = useState({});

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editMode,  setEditMode]  = useState(false);

  // File input refs (indexed by part index)
  const fileInputRefs = useRef({});

  // ── Fetch helpers ────────────────────────────────────────────
  const fetchInvoices = async () => {
    try {
      await executeInvoice(async () => {
        let allInvoices = [];
        let page = 1;
        const limit = 100;
        const res = await invoicesApi.getAll(page, limit, { useCache: false });
        const items = Array.isArray(res?.data) ? res.data : [];
        allInvoices = items;
        const totalPages = res?.meta?.totalPages || 1;
        while (page < totalPages) {
          page++;
          const nextRes = await invoicesApi.getAll(page, limit, { useCache: false });
          const nextItems = Array.isArray(nextRes?.data) ? nextRes.data : [];
          allInvoices = [...allInvoices, ...nextItems];
        }
        setInvoices(allInvoices);
      });
    } catch {
      setInvoices([]);
    }
  };

  const fetchYardForVehicle = async (vehicleInvoiceId) => {
    if (!vehicleInvoiceId) {
      setYardRecord(null);
      return;
    }
    try {
      await executeYard(async () => {
        const res = await yardApi.getByVehicleInvoiceId(vehicleInvoiceId);
        setYardRecord(res?.data ?? res ?? null);
      });
    } catch {
      setYardRecord(null);
    }
  };

  const fetchVehicleForInvoice = async (invoiceId) => {
    setInvoiceVehicles([]);
    setSelectedVehicleId('');
    setVehicleLabel('');
    setYardRecord(null);
    try {
      await executeVehicle(async () => {
        const vehRes  = await invoicesApi.getVehicleById(invoiceId);
        const vehicles = Array.isArray(vehRes?.data)
          ? vehRes.data
          : vehRes?.data ? [vehRes.data] : [];
        const mappedVehicles = vehicles
          .map((v) => {
            const id = v._id || v.id || '';
            const label =
              [v.make, v.model_name || v.model, v.registration_number]
                .filter(Boolean)
                .join(' • ') || id;
            return { ...v, id, label };
          })
          .filter((v) => Boolean(v.id));
        setInvoiceVehicles(mappedVehicles);
        if (mappedVehicles.length > 0) {
          const first = mappedVehicles[0];
          setSelectedVehicleId(first.id);
          setVehicleLabel(first.label);
          syncCatalogMmvFromVehicle(first);
          await fetchYardForVehicle(first.id);
        }
      });
    } catch {
      setInvoiceVehicles([]);
      setSelectedVehicleId('');
      setVehicleLabel('No vehicle found');
    }
  };

  // ── Public handlers ──────────────────────────────────────────
  const handleInvoiceSelect = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    if (errors.invoiceId) setErrors((p) => ({ ...p, invoiceId: '' }));
    if (invoiceId) {
      fetchVehicleForInvoice(invoiceId);
    } else {
      setInvoiceVehicles([]);
      setSelectedVehicleId('');
      setVehicleLabel('');
      setYardRecord(null);
    }
  };

  const handleVehicleSelect = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    if (errors.vehicleId) setErrors((p) => ({ ...p, vehicleId: '' }));
    const selected = invoiceVehicles.find((v) => v.id === vehicleId);
    setVehicleLabel(selected?.label || '');
    syncCatalogMmvFromVehicle(selected);
    fetchYardForVehicle(vehicleId);
  };

  const yardStatus = yardRecord?.currentStatus || null;

  const syncCatalogMmvFromVehicle = (vehicle) => {
    if (!vehicle) return;
    setCatalogMmv({
      make: vehicle.make || '',
      model: vehicle.model_name || vehicle.model || '',
      variant: vehicle.variant || 'Standard',
      vehicleType: vehicle.vehicle_type || vehicle.vehicleType || 'CAR',
    });
  };

  const applyCatalogResponse = (data) => {
    const items = Array.isArray(data?.parts) ? data.parts : [];
    if (!items.length) {
      setCatalogMode(false);
      setCatalogMeta(null);
      return false;
    }
    setCatalogMeta({
      variantId: data.catalog?.variantId,
      make: data.vehicle?.make,
      model: data.vehicle?.model,
      variant: data.vehicle?.variant,
      vehicleType: data.vehicle?.vehicleType || data.catalog?.vehicleType,
      usesGenericMaster: data.meta?.usesGenericMaster,
      hasUserAddedParts: data.meta?.hasUserAddedParts,
    });
    setCatalogMmv({
      make: data.vehicle?.make || '',
      model: data.vehicle?.model || '',
      variant: data.vehicle?.variant || 'Standard',
      vehicleType: data.vehicle?.vehicleType || data.catalog?.vehicleType || 'CAR',
    });
    setParts(items.map(createPartFromCatalog));
    setCatalogMode(true);
    return true;
  };
  const hasYardRecord = Boolean(yardRecord?._id || yardRecord?.id);
  const canAddParts =
    editMode ||
    !hasYardRecord ||
    yardStatus === 'DISMANTLING_IN_PROGRESS';

  const loadCatalogChecklist = useCallback(async (vehicleId = selectedVehicleId) => {
    if (!vehicleId || editMode) return;
    setCatalogLoading(true);
    try {
      const res = await partCatalogApi.getChecklistForVehicle(vehicleId);
      const data = res?.data ?? res;
      applyCatalogResponse(data);
    } catch {
      setCatalogMode(false);
      setCatalogMeta(null);
    } finally {
      setCatalogLoading(false);
    }
  }, [selectedVehicleId, editMode]);

  const loadCatalogChecklistByMmv = useCallback(async (mmv = catalogMmv) => {
    if (editMode) return;
    if (!mmv.make?.trim() || !mmv.model?.trim()) {
      toast.error('Enter make and model to load catalog');
      return;
    }
    setCatalogLoading(true);
    try {
      const res = await partCatalogApi.getChecklistByMmv(mmv);
      const data = res?.data ?? res;
      const ok = applyCatalogResponse(data);
      if (ok && data.meta?.usesGenericMaster) {
        toast.success('Loaded master parts for this vehicle type — add any missing parts below');
      }
    } catch (e) {
      setCatalogMode(false);
      setCatalogMeta(null);
      toast.error(e?.response?.data?.message || e.message || 'Could not load catalog');
    } finally {
      setCatalogLoading(false);
    }
  }, [catalogMmv, editMode]);

  const handleCatalogMmvChange = (field, value) => {
    setCatalogMmv((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!selectedVehicleId || editMode) return;
    if (yardStatus === 'DISMANTLING_IN_PROGRESS') {
      loadCatalogChecklist(selectedVehicleId);
    }
  }, [selectedVehicleId, yardStatus, editMode, loadCatalogChecklist]);

  const handleAddGlobalPart = async (variantId, payload) => {
    const created = await partCatalogApi.addPartToVariant(variantId, {
      partName: payload.partName,
      partType: payload.partType,
      defaultQty: payload.defaultQty || 1,
    });
    const item = created?.data ?? created;
    setParts((prev) => [...prev, createPartFromCatalog(item)]);
    setCatalogMeta((prev) => (prev ? { ...prev, hasUserAddedParts: true, usesGenericMaster: false } : prev));
    toast.success('Part saved globally — next time this model is used, it will appear here');
  };

  const handleStartDismantling = async () => {
    if (!selectedVehicleId) return;
    try {
      await executeYard(async () => {
        await yardApi.startDismantling(selectedVehicleId);
        toast.success('Dismantling started — you can add parts now');
        await fetchYardForVehicle(selectedVehicleId);
        await loadCatalogChecklist(selectedVehicleId);
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Could not start dismantling');
    }
  };

  const handlePartChange = (index, field, value) => {
    if (readOnly) return;
    setParts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    if (errors[`part_${index}_${field}`]) {
      setErrors((p) => ({ ...p, [`part_${index}_${field}`]: '' }));
    }
  };

  const addPart    = () => setParts((prev) => [...prev, createInitialPart()]);
  const removePart = (index) => {
    if (parts.length <= 1) return;
    setParts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (partIndex, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newDocs = await Promise.all(
      files.map(async (file) => {
        let dataUrl = null;
        try { dataUrl = await fileToBase64(file); } catch {}
        return { name: file.name, type: file.type, size: file.size, dataUrl };
      })
    );
    setParts((prev) => {
      const updated = [...prev];
      updated[partIndex] = {
        ...updated[partIndex],
        documents: [...(updated[partIndex].documents || []), ...newDocs],
      };
      return updated;
    });
    if (fileInputRefs.current[partIndex]) fileInputRefs.current[partIndex].value = '';
  };

  const removeDocument = (partIndex, docIndex) => {
    setParts((prev) => {
      const updated = [...prev];
      const docs    = [...(updated[partIndex].documents || [])];
      docs.splice(docIndex, 1);
      updated[partIndex] = { ...updated[partIndex], documents: docs };
      return updated;
    });
  };

  const getInvoiceLabel = (inv) => {
    const num    = inv.invoiceNumber || '';
    const seller = inv.sellerName || '';
    return `${num}${seller ? ` — ${seller}` : ''}`;
  };

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (!editMode) {
      if (!selectedInvoiceId) err.invoiceId = 'Select an invoice';
      if (!selectedVehicleId) err.vehicleId = 'No vehicle linked to this invoice';
      if (hasYardRecord && yardStatus === 'PARKED') {
        err.yard = 'Start dismantling before adding parts';
      }
      if (
        hasYardRecord &&
        yardStatus &&
        yardStatus !== 'DISMANTLING_IN_PROGRESS' &&
        yardStatus !== 'PARKED'
      ) {
        err.yard = 'Vehicle must be parked and dismantling started in Yard first';
      }
    }
    const activeParts = parts.filter((p) => p.included !== false);
    activeParts.forEach((part, i) => {
      const idx = parts.indexOf(part);
      if (!part.partName.trim()) err[`part_${idx}_partName`] = 'Part name is required';
      if (part.unitPrice === '' || part.unitPrice === null || part.unitPrice === undefined)
        err[`part_${idx}_unitPrice`] = 'Unit price is required';
    });
    if (!editMode && catalogMode && activeParts.length === 0) {
      err.parts = 'Select at least one part from the checklist';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!editMode && hasYardRecord && !canAddParts) return;
    if (!validate()) return;
    try {
      await executeForm(async () => {
        if (editMode && editingId) {
          const part = parts[0];
          await onSubmit({
            type: 'update',
            id: editingId,
            payload: {
              partName:         part.partName || '',
              partType:         part.partType || 'ENGINE',
              openingStock:     Number(part.openingStock)     || 0,
              quantityReceived: Number(part.quantityReceived) || 0,
              quantityIssued:   Number(part.quantityIssued)   || 0,
              unitPrice:        Number(part.unitPrice)        || 0,
              condition:        part.condition || 'GOOD',
              documents:        buildDocObjects(part.documents),
            },
          });
        } else {
          await onSubmit({
            type: 'create',
            payload: {
              invoiceId: selectedInvoiceId,
              vechileId: selectedVehicleId,
              parts: parts
                .filter((part) => part.included !== false)
                .map((part) => ({
                partName:         part.partName || '',
                partType:         part.partType || 'ENGINE',
                catalogPartId:    part.catalogPartId || undefined,
                catalogPartCode:  part.catalogPartCode || undefined,
                openingStock:     Number(part.openingStock)     || 0,
                quantityReceived: Number(part.quantityReceived) || 0,
                quantityIssued:   Number(part.quantityIssued)   || 0,
                unitPrice:        Number(part.unitPrice)        || 0,
                condition:        part.condition || 'GOOD',
                documents:        buildDocObjects(part.documents),
              })),
            },
          });
        }
        handleClose();
      });
    } catch {
      // parent handles errors
    }
  };

  // ── Open / Close ─────────────────────────────────────────────
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setEditingId(null);
    setSelectedInvoiceId('');
    setInvoiceVehicles([]);
    setSelectedVehicleId('');
    setVehicleLabel('');
    setYardRecord(null);
    setParts([createInitialPart()]);
    setCatalogMode(false);
    setCatalogMeta(null);
    setCatalogMmv({ make: '', model: '', variant: 'Standard', vehicleType: 'CAR' });
    setErrors({});
  };

  const openFormWith = (item) => {
    if (item) {
      setEditMode(true);
      setEditingId(item._id || item.id);
      setSelectedInvoiceId(item.invoiceId || '');
      setInvoiceVehicles([]);
      setSelectedVehicleId(item.vechileId || item.vehicleId || '');
      setVehicleLabel(() => {
        const veh = item.vehicle;
        if (veh) {
          return [veh.make, veh.model_name || veh.model, veh.registration_number || veh.registrationNumber]
            .filter(Boolean)
            .join(' • ') || item.vehicleCode || item.vechileId || '';
        }
        return item.registrationNumber || item.vehicleCode || item.vechileId || '';
      });
      setParts([{
        _uid:             generatePartId(),
        partName:         item.partName || '',
        partType:         item.partType || 'ENGINE',
        openingStock:     item.openingStock     ?? 0,
        quantityReceived: item.quantityReceived ?? 0,
        quantityIssued:   item.quantityIssued   ?? 0,
        unitPrice:        item.unitPrice        ?? '',
        condition:        item.condition || 'GOOD',
        status:           item.status || 'AVAILABLE',
        documents:        item.documents || [],
      }]);
    } else {
      setEditMode(false);
      setEditingId(null);
      setSelectedInvoiceId('');
      setInvoiceVehicles([]);
      setSelectedVehicleId('');
      setVehicleLabel('');
      setParts([createInitialPart()]);
    }
    setErrors({});
    fetchInvoices();
    setOpen(true);
  };

  return {
    // state
    open, loading, editMode,
    invoices, invoiceLoading,
    selectedInvoiceId, invoiceVehicles, selectedVehicleId, vehicleLabel, vehicleFetching,
    yardRecord, yardStatus, yardLoading, hasYardRecord, canAddParts,
    catalogMode, catalogMeta, catalogMmv, catalogLoading,
    parts, errors,
    fileInputRefs,
    // handlers
    handleInvoiceSelect, handleVehicleSelect, getInvoiceLabel, handleStartDismantling,
    loadCatalogChecklist, loadCatalogChecklistByMmv, handleCatalogMmvChange, handleAddGlobalPart,
    handlePartChange, addPart, removePart,
    handleFileSelect, removeDocument,
    handleSubmit, handleClose,
    // imperative
    openFormWith,
  };
}
