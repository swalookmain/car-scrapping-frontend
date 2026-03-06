import { useState } from 'react';
import { invoicesApi } from '../../services/api';

// ── Constants ──────────────────────────────────────────────────
export const RTO_STATUS_OPTIONS = ['NOT_APPLIED', 'APPLIED', 'APPROVED', 'REJECTED'];

export const INITIAL_FORM = {
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

// ── Hook ───────────────────────────────────────────────────────
export function useComplianceForm({ onSubmit, readOnly, onClose }) {
  const [open, setOpen]               = useState(false);
  const [form, setForm]               = useState({ ...INITIAL_FORM });
  const [errors, setErrors]           = useState({});
  const [editingId, setEditingId]     = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Invoice & Vehicle selection
  const [invoices, setInvoices]             = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleLabel, setVehicleLabel]     = useState('');
  const [vehicleFetching, setVehicleFetching] = useState(false);

  // Document states (null | URL string | { name, type, dataUrl })
  const [codDoc, setCodDoc] = useState(null);
  const [cvsDoc, setCvsDoc] = useState(null);

  // ── Internal helpers ─────────────────────────────────────────
  const resetState = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setEditingId(null);
    setIsUpdateMode(false);
    setSelectedInvoiceId('');
    setSelectedVehicleId('');
    setVehicleLabel('');
    setCodDoc(null);
    setCvsDoc(null);
  };

  const fetchInvoices = async () => {
    setInvoiceLoading(true);
    try {
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
    } catch {
      setInvoices([]);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const fetchVehicleForInvoice = async (invoiceId) => {
    setVehicleFetching(true);
    setSelectedVehicleId('');
    setVehicleLabel('');
    try {
      const vehRes = await invoicesApi.getVehicleById(invoiceId);
      const vehicles = Array.isArray(vehRes?.data)
        ? vehRes.data
        : vehRes?.data ? [vehRes.data] : [];
      if (vehicles.length > 0) {
        const v = vehicles[0];
        const vid = v._id || v.id || '';
        const label =
          [v.make, v.model_name || v.model, v.registration_number]
            .filter(Boolean)
            .join(' • ') || vid;
        setSelectedVehicleId(vid);
        setVehicleLabel(label);
      }
    } catch {
      setSelectedVehicleId('');
      setVehicleLabel('No vehicle found');
    } finally {
      setVehicleFetching(false);
    }
  };

  // ── Public handlers ──────────────────────────────────────────
  const handleChange = (field, value) => {
    if (readOnly) return;
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleInvoiceSelect = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    handleChange('invoiceId', invoiceId);
    if (invoiceId) {
      fetchVehicleForInvoice(invoiceId);
    } else {
      setSelectedVehicleId('');
      setVehicleLabel('');
      handleChange('vehicleId', '');
    }
  };

  const getInvoiceLabel = (inv) => {
    const num = inv.invoiceNumber || '';
    const seller = inv.sellerName || '';
    return `${num}${seller ? ` — ${seller}` : ''}`;
  };

  const validate = () => {
    const err = {};
    if (!isUpdateMode) {
      if (!selectedInvoiceId) err.invoiceId = 'Select an invoice';
      if (!selectedVehicleId) err.vehicleId = 'No vehicle linked to this invoice';
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
          vehicleId: selectedVehicleId,
          invoiceId: selectedInvoiceId,
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
      setSelectedInvoiceId(item.invoiceId || '');
      setSelectedVehicleId(item.vehicleId || '');
      setVehicleLabel(item.vehicleLabel || item.vehicleId || '');
      setCodDoc(item.codDocumentUrl || null);
      setCvsDoc(item.cvsDocumentUrl || null);
    } else {
      setForm({ ...INITIAL_FORM });
      setEditingId(null);
      setIsUpdateMode(false);
      setSelectedInvoiceId('');
      setSelectedVehicleId('');
      setVehicleLabel('');
      setCodDoc(null);
      setCvsDoc(null);
    }
    setErrors({});
    fetchInvoices();
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
    invoices, invoiceLoading,
    selectedInvoiceId, selectedVehicleId, vehicleLabel, vehicleFetching,
    codDoc, setCodDoc, cvsDoc, setCvsDoc,
    // handlers
    handleChange, handleInvoiceSelect, getInvoiceLabel,
    handleSubmit, handleClose,
    // imperative
    openModal, closeModal,
  };
}
