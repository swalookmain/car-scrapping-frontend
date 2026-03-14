import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box, Button, MenuItem, TextField } from '@mui/material';
import ConfirmDialog from '../../ui/ConfirmDialog';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import TableToolbar from '../../ui/TableToolbar';
import SalesInvoiceForm from './SalesInvoiceForm';
import SalesInvoiceDetailView from './SalesInvoiceDetailView';
import { getSalesInvoiceColumns } from './salesInvoiceColumns';
import { salesInvoicesApi } from '../../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';
import inputSx from '../../services/inputStyles';

// ── Filter Options ─────────────────────────────────────────────
const FILTER_STATUSES = ['', 'DRAFT', 'CONFIRMED', 'CANCELLED'];

const SalesInvoiceTable = ({ isLoading }) => {
  const { canPerform } = usePermissions();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const formRef = useRef(null);
  const tableRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(''); // 'confirm' or 'cancel'
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // ── Fetch Sales Invoices via React Query ─────────────────────
  const { data: invoiceResult, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['sales-invoices', page, rowsPerPage, filterStatus],
    queryFn: async () => {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      const res = await salesInvoicesApi.getAll(page + 1, rowsPerPage, filters, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return { data: items, total: res?.meta?.total ?? res?.total ?? items.length };
    },
    placeholderData: (prev) => prev,
  });

  const invoices = invoiceResult?.data ?? [];
  const total = invoiceResult?.total ?? 0;

  // ── Handlers ─────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    if (formRef.current?.open) formRef.current.open();
  }, []);

  const handleEdit = useCallback((row) => {
    if (row.status !== 'DRAFT') {
      toast.error('Only draft invoices can be edited');
      return;
    }
    if (formRef.current?.open) formRef.current.open(row);
  }, []);

  const handleView = async (row) => {
    try {
      const res = await salesInvoicesApi.getById(row._id || row.id);
      setViewItem(res?.data || res || row);
    } catch {
      setViewItem(row);
    }
    setViewOpen(true);
  };

  const handleCreateOrUpdate = async ({ type, id, payload }) => {
    try {
      if (type === 'update') {
        await salesInvoicesApi.update(id, payload);
        toast.success('Sales invoice updated successfully');
      } else {
        await salesInvoicesApi.create(payload);
        toast.success('Sales invoice draft created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
    } catch (err) {
      console.error('Sales invoice save error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save sales invoice. Please try again.');
    }
  };

  const handleConfirmInvoice = useCallback((row) => {
    setConfirmTarget(row);
    setConfirmAction('confirm');
    setConfirmOpen(true);
  }, []);

  const handleCancelInvoice = useCallback((row) => {
    setConfirmTarget(row);
    setConfirmAction('cancel');
    setConfirmOpen(true);
  }, []);

  const handleConfirmAction = async () => {
    const id = confirmTarget?._id || confirmTarget?.id;
    if (!id) return;
    try {
      if (confirmAction === 'confirm') {
        await salesInvoicesApi.confirm(id);
        toast.success('Sales invoice confirmed. Inventory deducted.');
      } else if (confirmAction === 'cancel') {
        await salesInvoicesApi.cancel(id);
        toast.success('Sales invoice cancelled. Inventory reversed.');
      }
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err) {
      console.error('Action error:', err);
      toast.error(err?.response?.data?.message || `Failed to ${confirmAction} invoice.`);
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
      setConfirmAction('');
    }
  };

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setViewItem(null);
  }, []);

  // ── Search Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return invoices;
    const q = query.toLowerCase();
    return invoices.filter((item) =>
      [item.invoiceNumber, item.buyer?.buyerName, item.buyerName, item.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, invoices]);

  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  // ── Columns ──────────────────────────────────────────────────
  const columns = useMemo(
    () => getSalesInvoiceColumns({ canPerform, handleView, handleEdit, handleConfirm: handleConfirmInvoice, handleCancel: handleCancelInvoice }),
    [canPerform, handleView, handleEdit, handleConfirmInvoice, handleCancelInvoice],
  );

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <Box>
      <TableToolbar
        searchPlaceholder="Search sales invoices..."
        searchValue={query}
        onSearchChange={(val) => {
          setQuery(val);
          setPage(0);
        }}
        onCopy={() => {}}
        onPrint={() => window.print()}
        onFilter={() => setShowFilters((p) => !p)}
        onRefresh={refetch}
        onAdd={canPerform('salesInvoice:create') ? handleAdd : undefined}
        showAdd={canPerform('salesInvoice:create')}
        showFilter={true}
        showRefresh={true}
        showExportCsv={true}
        onExportCsv={() => tableRef.current?.exportCsv()}
        showColumnToggle={true}
        onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
      />
      {showFilters && (
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ ...inputSx, minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {FILTER_STATUSES.filter(Boolean).map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Button
            size="small"
            onClick={() => {
              setFilterStatus('');
              setPage(0);
            }}
            sx={{ color: 'var(--color-grey-600)', textTransform: 'none' }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Box>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <NormalTable
        ref={tableRef}
        csvFilename="sales-invoices"
        columns={columns}
        data={tableData}
        isLoading={isLoading || loadingData}
        toolbar={toolbar}
        showCheckbox={false}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={(p) => setPage(p)}
        onRowsPerPageChange={(r) => {
          setRowsPerPage(r);
          setPage(0);
        }}
      />

      <SalesInvoiceForm ref={formRef} onSubmit={handleCreateOrUpdate} />

      {/* Detail View Modal */}
      <NormalModal
        open={viewOpen}
        onClose={handleCloseView}
        title="Sales Invoice Details"
        maxWidth="lg"
        actions={
          <Button
            variant="contained"
            onClick={handleCloseView}
            sx={{
              backgroundColor: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
            }}
          >
            Close
          </Button>
        }
      >
        <SalesInvoiceDetailView item={viewItem} />
      </NormalModal>

      {/* Confirm / Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmAction === 'confirm' ? 'Confirm Sales Invoice' : 'Cancel Sales Invoice'}
        description={
          confirmAction === 'confirm'
            ? `Confirm invoice "${confirmTarget?.invoiceNumber || ''}"? This will deduct inventory and lock the invoice.`
            : `Cancel invoice "${confirmTarget?.invoiceNumber || ''}"? This will reverse inventory deductions.`
        }
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
          setConfirmAction('');
        }}
        onConfirm={handleConfirmAction}
        confirmText={confirmAction === 'confirm' ? 'Confirm' : 'Cancel Invoice'}
        cancelText="Go Back"
      />
    </>
  );
};

SalesInvoiceTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default SalesInvoiceTable;
