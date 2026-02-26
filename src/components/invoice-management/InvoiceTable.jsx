import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, Chip, IconButton, Tooltip, Box, Divider, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmDialog from '../../ui/ConfirmDialog';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import TableToolbar from '../../ui/TableToolbar';
import InvoiceForm from './InvoiceForm';
import { invoicesApi } from '../../services/api';
import toast from 'react-hot-toast';

// ── Status Chip Colors ─────────────────────────────────────────
const statusColor = {
  DRAFT: { bg: '#fff3e0', color: '#e65100', label: 'Draft' },
  CONFIRMED: { bg: '#e8f5e9', color: '#2e7d32', label: 'Confirmed' },
};

const InvoiceTable = ({ isLoading }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  const formRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [viewStep, setViewStep] = useState(0); // 0: invoice, 1: vehicle

  const handleView = async (row) => {
    try {
      const invoiceRes = await invoicesApi.getById(row._id || row.id);
      const invoiceData = invoiceRes?.data || invoiceRes || row;
      // try to fetch linked vehicle(s) for this invoice and attach first vehicle
      try {
        const id = invoiceData._id || invoiceData.id;
        if (id) {
          const vehRes = await invoicesApi.getVehicleById(id);
          const vehicles = Array.isArray(vehRes?.data) ? vehRes.data : (vehRes?.data ? [vehRes.data] : []);
          const vData = vehicles.length > 0 ? vehicles[0] : null;
          if (vData) invoiceData.vehicle = vData;
        }
      } catch (vehErr) {
        // ignore vehicle fetch errors — still show invoice
      }
      setViewItem(invoiceData);
      setViewStep(0);
      setViewOpen(true);
    } catch (err) {
      // fallback: try to fetch vehicle by row id if present
      try {
        const id = row._id || row.id;
        if (id) {
          const vehRes = await invoicesApi.getVehicleById(id);
          const vehicles = Array.isArray(vehRes?.data) ? vehRes.data : (vehRes?.data ? [vehRes.data] : []);
          const vData = vehicles.length > 0 ? vehicles[0] : null;
          const fallback = { ...row };
          if (vData) fallback.vehicle = vData;
          setViewItem(fallback);
        } else {
          setViewItem(row);
        }
      } catch (vehErr) {
        setViewItem(row);
      }
      setViewStep(0);
      setViewOpen(true);
    }
  };

  // ── Fetch Invoices ───────────────────────────────────────────
  const fetchInvoices = async (p = 1, limit = 10) => {
    setLoadingData(true);
    try {
      const res = await invoicesApi.getAll(p, limit, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : [];
      setInvoices(items);
      setTotal(res?.meta?.total ?? items.length);
    } catch (err) {
      setInvoices([]);
      setTotal(0);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ─────────────────────────────────────────────────
  const handleAdd = () => {
    if (formRef.current && formRef.current.open) formRef.current.open();
  };

  const handleEdit = async (row) => {
    try {
      // Fetch full invoice data to populate step 1
      const invoiceRes = await invoicesApi.getById(row._id || row.id);
      const invoiceData = invoiceRes?.data || invoiceRes;

      // Vehicle data will be fetched in the form when user clicks "Next"
      if (formRef.current && formRef.current.open) {
        formRef.current.open(invoiceData);
      }
    } catch (err) {
      // Fallback: open with row data only
      if (formRef.current && formRef.current.open) formRef.current.open(row);
    }
  };

  const handleCreateOrUpdate = async ({ invoice, vehicle, editingId, editingVehicleId }) => {
    try {
      if (editingId) {
        // Update invoice
        await invoicesApi.update(editingId, invoice);

        // Update or create vehicle
        if (editingVehicleId) {
          await invoicesApi.updateVehicle(editingVehicleId, vehicle);
        } else {
          await invoicesApi.createVehicle({ ...vehicle, invoiceId: editingId });
        }
      } else {
        // Create invoice first
        const invoiceRes = await invoicesApi.create(invoice);
        const createdInvoice = invoiceRes?.data || invoiceRes;
        const newInvoiceId = createdInvoice?._id || createdInvoice?.id;

        // Then create vehicle linked to invoice
        if (newInvoiceId) {
          await invoicesApi.createVehicle({ ...vehicle, invoiceId: newInvoiceId });
        }
      }

      toast.success(editingId ? 'Invoice updated successfully' : 'Invoice created successfully');
      // Refresh list
      fetchInvoices(page + 1, rowsPerPage);
    } catch (err) {
      console.error('Invoice save error:', err);
      toast.error('Failed to save invoice. Please try again.');
      // Still refresh to get latest state
      fetchInvoices(page + 1, rowsPerPage);
    }
  };

  const openDeleteConfirm = (item) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await invoicesApi.delete(id);
      toast.success('Invoice deleted successfully');
      fetchInvoices(page + 1, rowsPerPage);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete invoice. Please try again.');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  // ── Search Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return invoices;
    const q = query.toLowerCase();
    return invoices.filter((inv) =>
      [inv.sellerName, inv.invoiceNumber, inv.sellerType, inv.purchaseDate, inv.mobile, inv.email, inv.vehicle?.make, inv.vehicle?.model_name, inv.vehicle?.model, inv.vehicle?.registration_number]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, invoices]);

  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  // ── Columns ──────────────────────────────────────────────────
  const showVehicle = invoices.some((inv) => Boolean(inv.vehicle?.make || inv.vehicle?.model_name || inv.vehicle?.model));
  const showReg = invoices.some((inv) => Boolean(inv.vehicle?.registration_number || inv.registrationNumber));

  const columns = [
    {
      field: 'invoiceNumber',
      headerName: 'Invoice No.',
      width: '14%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-grey-900)' }}>
          {row.invoiceNumber || '—'}
        </Typography>
      ),
    },
    {
      field: 'sellerName',
      headerName: 'Seller Name',
      width: '16%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
          {row.sellerName || '—'}
        </Typography>
      ),
    },
    {
      field: 'purchaseDate',
      headerName: 'Purchase Date',
      width: '12%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
          {row.purchaseDate ? (new Date(row.purchaseDate).toLocaleDateString('en-GB')) : '—'}
        </Typography>
      ),
    },
    {
      field: 'sellerContact',
      headerName: 'Seller Contact',
      width: '14%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-700)' }}>
          {(row.mobile || row.email) ? `${row.mobile || ''}${row.mobile && row.email ? ' • ' : ''}${row.email || ''}` : '—'}
        </Typography>
      ),
    },
    {
      field: 'sellerType',
      headerName: 'Seller Type',
      width: '10%',
      render: (row) => (
        <Chip
          label={row.sellerType}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            backgroundColor: row.sellerType === 'DIRECT' ? '#e3f2fd' : row.sellerType === 'MSTC' ? '#fce4ec' : '#f3e5f5',
            color: row.sellerType === 'DIRECT' ? '#1565c0' : row.sellerType === 'MSTC' ? '#c62828' : '#6a1b9a',
          }}
        />
      ),
    },
    ...(
      showVehicle
        ? [
            {
              field: 'vehicle',
              headerName: 'Vehicle (Make / Model)',
              width: '16%',
              render: (row) => {
                const make = row.vehicle?.make || row.vehicleMake || '';
                const model = row.vehicle?.model_name || row.vehicle?.model || row.vehicleModel || '';
                return (
                  <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
                    {make || model ? `${make} ${model}`.trim() : '—'}
                  </Typography>
                );
              },
            },
          ]
        : []
    ),
    ...(
      showReg
        ? [
            {
              field: 'registrationNumber',
              headerName: 'Reg. No.',
              width: '12%',
              render: (row) => (
                <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
                  {row.vehicle?.registration_number || row.registrationNumber || '—'}
                </Typography>
              ),
            },
          ]
        : []
    ),
    {
      field: 'purchaseAmount',
      headerName: 'Amount',
      width: '10%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
          {row.purchaseAmount != null ? `₹${Number(row.purchaseAmount).toLocaleString('en-IN')}` : '—'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: '10%',
      render: (row) => {
        const st = statusColor[row.status] || statusColor.DRAFT;
        return (
          <Chip
            label={st.label}
            size="small"
            sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: st.bg, color: st.color }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: '15%',
      render: (row) => (
        <>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleView(row)} aria-label="view" sx={{ color: '#1565c0' }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEdit(row)} aria-label="edit" sx={{ color: 'var(--color-secondary-main)' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => openDeleteConfirm(row)} aria-label="delete" sx={{ color: '#e53935' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search invoices..."
      searchValue={query}
      onSearchChange={(val) => { setQuery(val); setPage(0); }}
      onCopy={() => {}}
      onPrint={() => window.print()}
      onAdd={handleAdd}
    />
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <NormalTable
        columns={columns}
        data={tableData}
        isLoading={isLoading || loadingData}
        toolbar={toolbar}
        showCheckbox={true}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={(p) => { setPage(p); fetchInvoices(p + 1, rowsPerPage); }}
        onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); fetchInvoices(1, r); }}
      />

      <InvoiceForm ref={formRef} onSubmit={handleCreateOrUpdate} />

      <NormalModal
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewItem(null); setViewStep(0); }}
        title={viewStep === 0 ? 'Invoice Details' : 'Vehicle Details'}
        maxWidth="md"
        actions={(
          <>
            {viewStep > 0 && (
              <Button onClick={() => setViewStep(0)} sx={{ color: 'var(--color-grey-600)' }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={() => {
                if (viewStep === 0) setViewStep(1);
                else { setViewOpen(false); setViewItem(null); setViewStep(0); }
              }}
              sx={{ backgroundColor: 'var(--color-secondary-main)', '&:hover': { backgroundColor: 'var(--color-secondary-dark)' } }}
            >
              {viewStep === 0 ? 'Next' : 'Close'}
            </Button>
          </>
        )}
      >
        {viewItem && (() => {
          const inv = viewItem;
          const veh = inv.vehicle || {};
          const make = veh.make || inv.vehicleMake || '';
          const model = veh.model_name || veh.model || inv.vehicleModel || '';
          const st = statusColor[inv.status] || statusColor.DRAFT;
          const invoiceRows = [
            { label: 'Invoice No.', value: inv.invoiceNumber },
            { label: 'Seller Name', value: inv.sellerName },
            { label: 'Seller Type', value: inv.sellerType },
            { label: 'Purchase Amount', value: inv.purchaseAmount != null ? `₹${Number(inv.purchaseAmount).toLocaleString('en-IN')}` : '—' },
            { label: 'Purchase Date', value: inv.purchaseDate ? new Date(inv.purchaseDate).toLocaleDateString() : '—' },
            { label: 'GST Applicable', value: inv.gstApplicable ? 'Yes' : 'No' },
            { label: 'GST Rate', value: inv.gstRate ?? '—' },
            { label: 'GST Amount', value: inv.gstAmount ?? '—' },
            { label: 'Mobile', value: inv.mobile || '—' },
            { label: 'Email', value: inv.email || '—' },
          ];

          const vehicleRows = [
            { label: 'Vehicle (Make / Model)', value: make || model ? `${make} ${model}`.trim() : '—' },
            { label: 'Registration No.', value: veh.registration_number || inv.registrationNumber || '—' },
            { label: 'Chassis No.', value: veh.chassis_number || '—' },
            { label: 'Engine No.', value: veh.engine_number || '—' },
            { label: 'Color', value: veh.color || '—' },
            { label: 'Year of Manufacture', value: veh.year_of_manufacture || '—' },
            { label: 'Vehicle Purchase Date', value: veh.vehicle_purchase_date ? new Date(veh.vehicle_purchase_date).toLocaleDateString() : '—' },
            { label: 'Status', value: st.label },
          ];

          const rows = viewStep === 0 ? invoiceRows : vehicleRows;

          return (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {rows.map(({ label, value }) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.5 }}>{value || '—'}</Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Box>
          );
        })()}
      </NormalModal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Invoice"
        description={
          confirmTarget
            ? `Delete invoice "${confirmTarget.invoiceNumber || confirmTarget.id}"? This cannot be undone.`
            : 'Delete item?'
        }
        onClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        onConfirm={() => handleDelete(confirmTarget?._id || confirmTarget?.id)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

InvoiceTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default InvoiceTable;
