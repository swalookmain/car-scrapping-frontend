import { useState } from 'react';
import { yardApi } from '../../services/api';

// ── Constants ──────────────────────────────────────────────────
export const RTO_STATUS_OPTIONS = ['NOT_APPLIED', 'APPLIED', 'APPROVED', 'REJECTED'];

export const INITIAL_FORM = {
  yardVehicleId: '',
  vehicleId: '',
  invoiceId: '',
  codGenerated: false,
  codInwardNumber: '',
  codIssueDate: '',
  cvsGenerated: false,
  rtoOffice: '',
  rtoStatus: 'NOT_APPLIED',
  remarks: '',
};

const mapYardVehicleOption = (v) => {
  const id = v._id || v.id || '';
  const source =
    v.sourceType === 'AUCTION'
      ? 'Auction'
      : v.sourceType === 'LEAD'
        ? 'Lead'
        : v.sourceType || '';
  const label =
    [
      v.registrationNumber,
      [v.make, v.modelName].filter(Boolean).join(' '),
      source,
      v.currentStatus?.replace(/_/g, ' '),
    ]
      .filter(Boolean)
      .join(' • ') || id;
  return { ...v, id, label };
};

// ── Hook ───────────────────────────────────────────────────────
export function useComplianceForm({ onSubmit, readOnly, onClose }) {
  const [open, setOpen]               = useState(false);
  const [form, setForm]               = useState({ ...INITIAL_FORM });
  const [errors, setErrors]           = useState({});
  const [editingId, setEditingId]     = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Yard vehicle selection (invoice optional)
  const [yardVehicles, setYardVehicles] = useState([]);
  const [yardVehiclesLoading, setYardVehiclesLoading] = useState(false);
  const [selectedYardVehicleId, setSelectedYardVehicleId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleLabel, setVehicleLabel] = useState('');

  // Document states (null | URL string | { name, type, dataUrl })
  const [codDoc, setCodDoc] = useState(null);
  const [cvsDoc, setCvsDoc] = useState(null);

  // ── Internal helpers ─────────────────────────────────────────
  const resetState = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setEditingId(null);
    setIsUpdateMode(false);
    setSelectedYardVehicleId('');
    setSelectedInvoiceId('');
    setSelectedVehicleId('');
    setVehicleLabel('');
    setYardVehicles([]);
    setCodDoc(null);
    setCvsDoc(null);
  };

  const fetchYardVehicles = async () => {
    setYardVehiclesLoading(true);
    try {
      const res = await yardApi.getVehicles({ page: 1, limit: 200 });
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const eligible = rows
        .filter(
          (v) =>
            v.currentStatus !== 'EXITED' &&
            v.currentStatus !== 'REGISTERED',
        )
        .map(mapYardVehicleOption)
        .filter((v) => Boolean(v.id));
      setYardVehicles(eligible);
    } catch {
      setYardVehicles([]);
    } finally {
      setYardVehiclesLoading(false);
    }
  };

  // ── Public handlers ──────────────────────────────────────────
  const handleChange = (field, value) => {
    if (readOnly) return;
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleYardVehicleSelect = (yardVehicleId) => {
    setSelectedYardVehicleId(yardVehicleId);
    handleChange('yardVehicleId', yardVehicleId);
    if (errors.yardVehicleId) {
      setErrors((p) => ({ ...p, yardVehicleId: '' }));
    }
    if (!yardVehicleId) {
      setSelectedInvoiceId('');
      setSelectedVehicleId('');
      setVehicleLabel('');
      handleChange('invoiceId', '');
      handleChange('vehicleId', '');
      return;
    }
    const selected = yardVehicles.find((v) => v.id === yardVehicleId);
    setVehicleLabel(selected?.label || '');
    const vehicleInvoiceId =
      selected?.vehicleInvoiceId?._id || selected?.vehicleInvoiceId || '';
    const invoiceId = selected?.invoiceId?._id || selected?.invoiceId || '';
    setSelectedVehicleId(vehicleInvoiceId ? String(vehicleInvoiceId) : '');
    setSelectedInvoiceId(invoiceId ? String(invoiceId) : '');
    handleChange('vehicleId', vehicleInvoiceId ? String(vehicleInvoiceId) : '');
    handleChange('invoiceId', invoiceId ? String(invoiceId) : '');
  };

  const validate = () => {
    const err = {};
    if (!isUpdateMode) {
      if (!selectedYardVehicleId) err.yardVehicleId = 'Select a yard vehicle';
    }
    if (form.codGenerated && !form.codInwardNumber.trim()) {
      err.codInwardNumber = 'COD Inward Number is required when COD is generated';
    }
    if (form.codGenerated && !form.codIssueDate) {
      err.codIssueDate = 'COD Issue Date is required when COD is generated';
    }
    if (form.rtoStatus === 'APPLIED' || form.rtoStatus === 'APPROVED') {
      if (!form.rtoOffice.trim()) err.rtoOffice = 'RTO Office is required';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const resolveDoc = (doc) => {
      if (!doc) return undefined;
      if (typeof doc === 'string') return doc;
      return doc.dataUrl || undefined;
    };

    if (isUpdateMode) {
      onSubmit({
        payload: {
          codGenerated: form.codGenerated,
          codDocumentUrl: resolveDoc(codDoc),
          codGeneratedAt: form.codGenerated ? new Date().toISOString() : undefined,
          cvsGenerated: form.cvsGenerated,
          cvsDocumentUrl: resolveDoc(cvsDoc),
          cvsGeneratedAt: form.cvsGenerated ? new Date().toISOString() : undefined,
          rtoOffice: form.rtoOffice,
          rtoStatus: form.rtoStatus,
          remarks: form.remarks,
        },
        editingId,
        isUpdate: true,
      });
    } else {
      onSubmit({
        payload: {
          // One vehicle id everywhere = yardVehicleId
          yardVehicleId: selectedYardVehicleId,
          codGenerated: form.codGenerated,
          codInwardNumber: form.codInwardNumber,
          codIssueDate: form.codIssueDate || undefined,
          codDocumentUrl: resolveDoc(codDoc),
          cvsGenerated: form.cvsGenerated,
          cvsDocumentUrl: resolveDoc(cvsDoc),
          rtoOffice: form.rtoOffice,
          rtoStatus: form.rtoStatus,
          remarks: form.remarks,
        },
        editingId: null,
        isUpdate: false,
      });
    }

    resetState();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  // ── Imperative handles (exposed via ref in the component) ────
  const openModal = (item) => {
    if (item) {
      setForm({
        yardVehicleId: item.yardVehicleId || '',
        vehicleId: item.vehicleId || '',
        invoiceId: item.invoiceId || '',
        codGenerated: Boolean(item.codGenerated),
        codInwardNumber: item.codInwardNumber || '',
        codIssueDate: item.codIssueDate ? item.codIssueDate.slice(0, 10) : '',
        cvsGenerated: Boolean(item.cvsGenerated),
        rtoOffice: item.rtoOffice || '',
        rtoStatus: item.rtoStatus || 'NOT_APPLIED',
        remarks: item.remarks || '',
      });
      setEditingId(item._id || item.id || null);
      setIsUpdateMode(true);
      setSelectedYardVehicleId(
        item.yardVehicleId ? String(item.yardVehicleId) : '',
      );
      setSelectedInvoiceId(item.invoiceId ? String(item.invoiceId) : '');
      setSelectedVehicleId(item.vehicleId ? String(item.vehicleId) : '');
      setVehicleLabel(
        item.registrationNumber ||
          item.vehicleLabel ||
          item.vehicleId ||
          item.yardVehicleId ||
          '',
      );
      setCodDoc(item.codDocumentUrl || null);
      setCvsDoc(item.cvsDocumentUrl || null);
    } else {
      setForm({ ...INITIAL_FORM });
      setEditingId(null);
      setIsUpdateMode(false);
      setSelectedYardVehicleId('');
      setSelectedInvoiceId('');
      setSelectedVehicleId('');
      setVehicleLabel('');
      setCodDoc(null);
      setCvsDoc(null);
    }
    setErrors({});
    fetchYardVehicles();
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditingId(null);
    if (onClose) onClose();
  };

  return {
    // state
    open, form, errors, isUpdateMode,
    yardVehicles, yardVehiclesLoading,
    selectedYardVehicleId, selectedInvoiceId, selectedVehicleId, vehicleLabel,
    codDoc, setCodDoc, cvsDoc, setCvsDoc,
    // handlers
    handleChange, handleYardVehicleSelect,
    handleSubmit, handleClose,
    // imperative
    openModal, closeModal,
  };
}
