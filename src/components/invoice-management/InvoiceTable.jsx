import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Typography, Box, Divider, Button } from '@mui/material';
import ConfirmDialog from '../../ui/ConfirmDialog';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import DocumentPreview from '../../ui/DocumentPreview';
import TableToolbar from '../../ui/TableToolbar';
import InvoiceForm from './InvoiceForm';
import { getInvoiceColumns, invoiceStatusColor } from './invoiceColumns';
import { invoicesApi } from '../../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';

const InvoiceTable = ({ isLoading }) => {
  const { canPerform } = usePermissions();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formRef = useRef(null);
  const tableRef = useRef(null);
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
  const { data: invoiceResult, isLoading: loadingData, refetch: refetchInvoices } = useQuery({
    queryKey: ['invoices', page, rowsPerPage],
    queryFn: async () => {
      const res = await invoicesApi.getAll(page + 1, rowsPerPage, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : [];
      return { data: items, total: res?.meta?.total ?? items.length };
    },
  });

  const invoices = invoiceResult?.data ?? [];
  const total = invoiceResult?.total ?? 0;

  // ── Handlers ─────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    if (formRef.current && formRef.current.open) formRef.current.open();
  }, []);

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
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (err) {
      console.error('Invoice save error:', err);
      toast.error('Failed to save invoice. Please try again.');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  };

  const openDeleteConfirm = useCallback((item) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewOpen(false);
    setViewItem(null);
    setViewStep(0);
  }, []);

  const [preview, setPreview] = useState({ open: false, src: null, name: null, mime: null });

  const handleViewBack = useCallback(() => setViewStep(0), []);

  const handleViewNext = useCallback(() => {
    if (viewStep === 0) setViewStep(1);
    else { setViewOpen(false); setViewItem(null); setViewStep(0); }
  }, [viewStep]);

  const handleDelete = async (id) => {
    try {
      await invoicesApi.delete(id);
      toast.success('Invoice deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
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

  const columns = useMemo(
    () => getInvoiceColumns({ canPerform, handleView, handleEdit, openDeleteConfirm, showVehicle, showReg }),
    [canPerform, handleView, handleEdit, openDeleteConfirm, showVehicle, showReg],
  );

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search invoices..."
      searchValue={query}
      onSearchChange={(val) => { setQuery(val); setPage(0); }}
      onCopy={() => {}}
      onPrint={() => window.print()}
      showFilter={false}
      onAdd={handleAdd}
      showExportCsv={true}
      onExportCsv={() => tableRef.current?.exportCsv()}
      showRefresh={true}
      onRefresh={refetchInvoices}
      showColumnToggle={true}
      onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
    />
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <NormalTable
        ref={tableRef}
        csvFilename="invoices"
        columns={columns}
        data={tableData}
        isLoading={isLoading || loadingData}
        toolbar={toolbar}
        showCheckbox={false}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={(p) => setPage(p)}
        onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
      />

      <InvoiceForm ref={formRef} onSubmit={handleCreateOrUpdate} />

      <NormalModal
        open={viewOpen}
        onClose={handleViewClose}
        title={viewStep === 0 ? 'Invoice Details' : 'Vehicle Details'}
        maxWidth="md"
        actions={(
          <>
            {viewStep > 0 && (
              <Button onClick={handleViewBack} sx={{ color: 'var(--color-grey-600)' }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleViewNext}
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
          const st = invoiceStatusColor[inv.status] || invoiceStatusColor.DRAFT;
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
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {rows.map(({ label, value }) => (
                  <Box key={label}>
                    <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                    <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.5 }}>{value || '—'}</Typography>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Box>

              {(inv.documents || inv.purchaseDocuments || inv.documentsUrls || []).length > 0 && (
                <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Documents</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(inv.documents || inv.purchaseDocuments || inv.documentsUrls || []).map((d, i) => {
                      const name = typeof d === 'string' ? d.split('/').pop() : d.name || `Document ${i + 1}`;
                      const src = typeof d === 'string' ? d : d.url || d.data || d.dataUrl || null;
                      const mime = typeof d === 'string' ? '' : d.type || '';
                      return (
                        <Button key={src || name || i} size="small" variant="outlined" onClick={() => setPreview({ open: true, src, name, mime })}>
                          {name}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </>
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

      <DocumentPreview
        open={preview.open}
        onClose={() => setPreview({ open: false, src: null, name: null, mime: null })}
        src={preview.src}
        name={preview.name}
        mime={preview.mime}
      />
    </>
  );
};

InvoiceTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default InvoiceTable;
