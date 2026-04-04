import { useState, useRef } from 'react';
import { invoicesApi } from '../../services/api';
import useApiCall from '../../hooks/useApiCall';

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
export const PART_TYPES  = ['ENGINE', 'TRANSMISSION', 'BODY', 'METAL', 'PLASTIC', 'ELECTRICAL', 'OTHER'];
export const CONDITIONS  = ['GOOD', 'DAMAGED'];
export const STATUSES    = ['AVAILABLE', 'PARTIAL_SOLD', 'SOLD_OUT', 'DAMAGE_ONLY'];

let _partIdCounter = 0;
const generatePartId = () => `part_${++_partIdCounter}_${Date.now()}`;

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

  // Invoice & Vehicle selection
  const [invoices,         setInvoices]         = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleLabel,     setVehicleLabel]     = useState('');
  // vehicleFetching now comes from useApiCall above

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

  const fetchVehicleForInvoice = async (invoiceId) => {
    setSelectedVehicleId('');
    setVehicleLabel('');
    try {
      await executeVehicle(async () => {
        const vehRes  = await invoicesApi.getVehicleById(invoiceId);
        const vehicles = Array.isArray(vehRes?.data)
          ? vehRes.data
          : vehRes?.data ? [vehRes.data] : [];
        if (vehicles.length > 0) {
          const v   = vehicles[0];
          const vid = v._id || v.id || '';
          const label =
            [v.make, v.model_name || v.model, v.registration_number]
              .filter(Boolean)
              .join(' • ') || vid;
          setSelectedVehicleId(vid);
          setVehicleLabel(label);
        }
      });
    } catch {
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
      setSelectedVehicleId('');
      setVehicleLabel('');
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
    }
    parts.forEach((part, i) => {
      if (!part.partName.trim()) err[`part_${i}_partName`] = 'Part name is required';
      if (part.unitPrice === '' || part.unitPrice === null || part.unitPrice === undefined)
        err[`part_${i}_unitPrice`] = 'Unit price is required';
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
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
              parts: parts.map((part) => ({
                partName:         part.partName || '',
                partType:         part.partType || 'ENGINE',
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
    setSelectedVehicleId('');
    setVehicleLabel('');
    setParts([createInitialPart()]);
    setErrors({});
  };

  const openFormWith = (item) => {
    if (item) {
      setEditMode(true);
      setEditingId(item._id || item.id);
      setSelectedInvoiceId(item.invoiceId || '');
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
    selectedInvoiceId, selectedVehicleId, vehicleLabel, vehicleFetching,
    parts, errors,
    fileInputRefs,
    // handlers
    handleInvoiceSelect, getInvoiceLabel,
    handlePartChange, addPart, removePart,
    handleFileSelect, removeDocument,
    handleSubmit, handleClose,
    // imperative
    openFormWith,
  };
}
