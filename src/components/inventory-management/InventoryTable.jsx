import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import {
  Typography,
  Box,
  Divider,
  Button,
  MenuItem,
  TextField,
  Grid,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import ConfirmDialog from '../../ui/ConfirmDialog';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import TableToolbar from '../../ui/TableToolbar';
import InventoryForm from './InventoryForm';
import { inventoryApi, invoicesApi, damageAdjustmentsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';
import InventoryFilters from './InventoryFilters';
import InventoryDetailView from './InventoryDetailView';
import MarkDamagedModal from './MarkDamagedModal';
import { getInventoryColumns } from './inventoryColumns';

// ── Filter Options ─────────────────────────────────────────────
const FILTER_CONDITIONS = ['', 'GOOD', 'DAMAGED'];
const FILTER_STATUSES = ['', 'AVAILABLE', 'PARTIAL_SOLD', 'SOLD_OUT', 'DAMAGE_ONLY'];

const InventoryTable = ({ isLoading }) => {
  const { canPerform } = usePermissions();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [filterCondition, setFilterCondition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVechileId, setFilterVechileId] = useState('');
  const [filterInvoiceId, setFilterInvoiceId] = useState('');
  const [vehicleFetching, setVehicleFetching] = useState(false);
  const [selectedVehicleLabel, setSelectedVehicleLabel] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const formRef = useRef(null);
  const tableRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [damagedModalOpen, setDamagedModalOpen] = useState(false);
  const [damagedTarget, setDamagedTarget] = useState(null);
  const [damagedLoading, setDamagedLoading] = useState(false);

  // ── Fetch Inventory via React Query ────────────────────────────
  const { data: inventoryResult, isLoading: loadingData, refetch: refetchInventory } = useQuery({
    queryKey: ['inventory', page, rowsPerPage, filterCondition, filterStatus, filterVechileId, filterInvoiceId],
    queryFn: async () => {
      const params = {
        ...(filterCondition ? { condition: filterCondition } : {}),
        ...(filterStatus   ? { status:    filterStatus   } : {}),
        ...(filterVechileId ? { vechileId: filterVechileId } : {}),
        ...(filterInvoiceId ? { invoiceId: filterInvoiceId } : {}),
        page: page + 1,
        limit: rowsPerPage,
      };
      const res = await inventoryApi.getAll(params, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return { data: items, total: res?.meta?.total ?? items.length };
    },
    placeholderData: (prev) => prev,
  });

  const inventory = inventoryResult?.data  ?? [];
  const total     = inventoryResult?.total ?? 0;

  // ── Fetch Invoices for filter dropdown ────────────────────────
  const { data: invoicesForFilter = [] } = useQuery({
    queryKey: ['invoices-all-for-filter'],
    queryFn: async () => {
      let allInvoices = [];
      let pg = 1;
      const limit = 100;
      const res = await invoicesApi.getAll(pg, limit, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : [];
      allInvoices = items;
      const totalPages = res?.meta?.totalPages || 1;
      while (pg < totalPages) {
        pg++;
        const nextRes = await invoicesApi.getAll(pg, limit, { useCache: false });
        const nextItems = Array.isArray(nextRes?.data) ? nextRes.data : [];
        allInvoices = [...allInvoices, ...nextItems];
      }
      return allInvoices;
    },
    enabled: showFilters,
    staleTime: 5 * 60 * 1000,
  });

    // ── Handlers ─────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    if (formRef.current?.open) formRef.current.open();
  }, []);

  const handleEdit = useCallback((row) => {
    if (formRef.current?.open) formRef.current.open(row);
  }, []);

  const handleView = async (row) => {
    try {
      const res = await inventoryApi.getById(row._id || row.id);
      setViewItem(res?.data || res || row);
    } catch {
      setViewItem(row);
    }
    setViewOpen(true);
  };

  const handleCreateOrUpdate = async ({ type, id, payload }) => {
    try {
      if (type === 'update') {
        await inventoryApi.update(id, payload);
        toast.success('Inventory updated successfully');
      } else {
        await inventoryApi.create(payload);
        toast.success('Inventory created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err) {
      console.error('Inventory save error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save inventory. Please try again.');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  };

  const openDeleteConfirm = useCallback((item) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  }, []);

  const handleDelete = async (id) => {
    try {
      await inventoryApi.delete(id);
      toast.success('Inventory item deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete inventory item.');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleApplyFilters = () => {
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilterCondition('');
    setFilterStatus('');
    setFilterVechileId('');
    setFilterInvoiceId('');
    setSelectedInvoiceId('');
    setSelectedVehicleLabel('');
    setPage(0);
  };

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setViewItem(null);
  }, []);

  // ── Mark as Damaged ─────────────────────────────────────────
  const handleMarkDamaged = useCallback((row) => {
    setDamagedTarget(row);
    setDamagedModalOpen(true);
  }, []);

  const handleDamageSubmit = async (payload) => {
    setDamagedLoading(true);
    try {
      await damageAdjustmentsApi.create(payload);
      toast.success('Part marked as damaged successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['damage-adjustments'] });
      setDamagedModalOpen(false);
      setDamagedTarget(null);
    } catch (err) {
      console.error('Damage adjustment error:', err);
      toast.error(err?.response?.data?.message || 'Failed to mark part as damaged.');
    } finally {
      setDamagedLoading(false);
    }
  };

  // ── Search Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return inventory;
    const q = query.toLowerCase();
    return inventory.filter((item) =>
      [item.partName, item.partType, item.invoiceId, item.vechileId, item.vehicleId, item.condition, item.status, item._id, item.id, item.itemCode]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, inventory]);

  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  // ── Columns ────────────────────────────────────────────
  const columns = useMemo(
    () => getInventoryColumns({ canPerform, handleView, handleEdit, openDeleteConfirm, handleMarkDamaged }),
    [canPerform, handleView, handleEdit, openDeleteConfirm, handleMarkDamaged],
  );

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <Box>
      <TableToolbar
        searchPlaceholder="Search inventory..."
        searchValue={query}
        onSearchChange={(val) => {
          setQuery(val);
          setPage(0);
        }}
        onCopy={() => {}}
        onPrint={() => window.print()}
        onFilter={() => setShowFilters((p) => !p)}
        onRefresh={refetchInventory}
        onAdd={handleAdd}
        showFilter={true}
        showRefresh={true}
        showExportCsv={true}
        onExportCsv={() => tableRef.current?.exportCsv()}
        showColumnToggle={true}
        onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
      />
      {showFilters && (
        <InventoryFilters
          filterCondition={filterCondition}
          onConditionChange={setFilterCondition}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          invoices={invoicesForFilter}
          invoiceLoading={false}
          selectedInvoiceId={selectedInvoiceId}
          setSelectedInvoiceId={setSelectedInvoiceId}
          selectedVehicleLabel={selectedVehicleLabel}
          setSelectedVehicleLabel={setSelectedVehicleLabel}
          filterVechileId={filterVechileId}
          setFilterVechileId={setFilterVechileId}
          filterInvoiceId={filterInvoiceId}
          setFilterInvoiceId={setFilterInvoiceId}
          vehicleFetching={vehicleFetching}
          setVehicleFetching={setVehicleFetching}
          onClearFilters={handleClearFilters}
        />
      )}
    </Box>
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <NormalTable
        ref={tableRef}
        csvFilename="inventory"
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

      <InventoryForm ref={formRef} onSubmit={handleCreateOrUpdate} />

      {/* Detail View Modal */}
      <NormalModal
        open={viewOpen}
        onClose={handleCloseView}
        title="Inventory Detail"
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
        <InventoryDetailView item={viewItem} />
      </NormalModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Inventory Item"
        description={
          confirmTarget
            ? `Delete "${confirmTarget.partName || 'this item'}"? This cannot be undone.`
            : 'Delete item?'
        }
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        onConfirm={() => handleDelete(confirmTarget?._id || confirmTarget?.id)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Mark as Damaged Modal */}
      <MarkDamagedModal
        open={damagedModalOpen}
        onClose={() => {
          setDamagedModalOpen(false);
          setDamagedTarget(null);
        }}
        item={damagedTarget}
        onSubmit={handleDamageSubmit}
        loading={damagedLoading}
      />
    </>
  );
};

InventoryTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default InventoryTable;
