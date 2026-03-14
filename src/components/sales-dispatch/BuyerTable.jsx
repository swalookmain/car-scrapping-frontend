import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import ConfirmDialog from '../../ui/ConfirmDialog';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import TableToolbar from '../../ui/TableToolbar';
import BuyerForm from './BuyerForm';
import BuyerDetailView from './BuyerDetailView';
import { getBuyerColumns } from './buyerColumns';
import { buyersApi } from '../../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';

const BuyerTable = ({ isLoading }) => {
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

  // ── Fetch Buyers via React Query ─────────────────────────────
  const { data: buyerResult, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['buyers', page, rowsPerPage],
    queryFn: async () => {
      const res = await buyersApi.getAll(page + 1, rowsPerPage, {}, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return { data: items, total: res?.meta?.total ?? res?.total ?? items.length };
    },
    placeholderData: (prev) => prev,
  });

  const buyers = buyerResult?.data ?? [];
  const total = buyerResult?.total ?? 0;

  // ── Handlers ─────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    if (formRef.current?.open) formRef.current.open();
  }, []);

  const handleEdit = useCallback((row) => {
    if (formRef.current?.open) formRef.current.open(row);
  }, []);

  const handleView = async (row) => {
    try {
      const res = await buyersApi.getById(row._id || row.id);
      setViewItem(res?.data || res || row);
    } catch {
      setViewItem(row);
    }
    setViewOpen(true);
  };

  const handleCreateOrUpdate = async ({ type, id, payload }) => {
    try {
      if (type === 'update') {
        await buyersApi.update(id, payload);
        toast.success('Buyer updated successfully');
      } else {
        await buyersApi.create(payload);
        toast.success('Buyer created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    } catch (err) {
      console.error('Buyer save error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save buyer. Please try again.');
    }
  };

  const openDeleteConfirm = useCallback((item) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  }, []);

  const handleDelete = async (id) => {
    try {
      await buyersApi.delete(id);
      toast.success('Buyer deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete buyer.');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setViewItem(null);
  }, []);

  // ── Search Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return buyers;
    const q = query.toLowerCase();
    return buyers.filter((item) =>
      [item.buyerName, item.buyerType, item.gstin, item.mobile, item.email, item.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, buyers]);

  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  // ── Columns ──────────────────────────────────────────────────
  const columns = useMemo(
    () => getBuyerColumns({ canPerform, handleView, handleEdit, openDeleteConfirm }),
    [canPerform, handleView, handleEdit, openDeleteConfirm],
  );

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search buyers..."
      searchValue={query}
      onSearchChange={(val) => {
        setQuery(val);
        setPage(0);
      }}
      onCopy={() => {}}
      onPrint={() => window.print()}
      onRefresh={refetch}
      onAdd={canPerform('buyer:create') ? handleAdd : undefined}
      showAdd={canPerform('buyer:create')}
      showRefresh={true}
      showExportCsv={true}
      onExportCsv={() => tableRef.current?.exportCsv()}
      showColumnToggle={true}
      onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
    />
  );

  // ── Render ───────────────────────────────────────────────────
  return (
    <>
      <NormalTable
        ref={tableRef}
        csvFilename="buyers"
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

      <BuyerForm ref={formRef} onSubmit={handleCreateOrUpdate} />

      {/* Detail View Modal */}
      <NormalModal
        open={viewOpen}
        onClose={handleCloseView}
        title="Buyer Details"
        maxWidth="sm"
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
        <BuyerDetailView item={viewItem} />
      </NormalModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Buyer"
        description={
          confirmTarget
            ? `Delete "${confirmTarget.buyerName || 'this buyer'}"? This cannot be undone.`
            : 'Delete buyer?'
        }
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
        onConfirm={() => handleDelete(confirmTarget?._id || confirmTarget?.id)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

BuyerTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default BuyerTable;
