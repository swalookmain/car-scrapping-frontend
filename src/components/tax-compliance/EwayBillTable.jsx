import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import TableToolbar from '../../ui/TableToolbar';
import EwayBillForm from './EWayBillForm';
import EwayBillDetailView from './EwayBillDetailView';
import { getEwayBillColumns } from './ewayBillColumns';
import { taxComplianceApi } from '../../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';

const EwayBillTable = ({ isLoading }) => {
  const { canPerform } = usePermissions();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formRef = useRef(null);
  const tableRef = useRef(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // ── Fetch E-Way Bills via React Query ────────────────────────
  const { data: ewayResult, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['eway-bills', page, rowsPerPage],
    queryFn: async () => {
      const res = await taxComplianceApi.getEwayBills(page + 1, rowsPerPage);
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return { data: items, total: res?.meta?.total ?? res?.total ?? items.length };
    },
    placeholderData: (prev) => prev,
  });

  const ewayBills = ewayResult?.data ?? [];
  const total = ewayResult?.total ?? 0;

  // ── Handlers ─────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    if (formRef.current?.open) formRef.current.open();
  }, []);

  const handleView = (row) => {
    setViewItem(row);
    setViewOpen(true);
  };

  const handleCreateEwayBill = async (payload) => {
    try {
      await taxComplianceApi.createEwayBill(payload);
      toast.success('E-Way bill record added successfully');
      queryClient.invalidateQueries({ queryKey: ['eway-bills'] });
    } catch (err) {
      console.error('E-Way bill save error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save E-Way bill record');
    }
  };

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setViewItem(null);
  }, []);

  // ── Search Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return ewayBills;
    const q = query.toLowerCase();
    return ewayBills.filter((item) =>
      [item.ewayBillNumber, item.vehicleNumber, item.transportMode, item.salesInvoice?.invoiceNumber]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, ewayBills]);

  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  // ── Columns ──────────────────────────────────────────────────
  const columns = useMemo(
    () => getEwayBillColumns({ handleView }),
    [],
  );

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search E-Way bills..."
      searchValue={query}
      onSearchChange={(val) => {
        setQuery(val);
        setPage(0);
      }}
      onRefresh={refetch}
      onAdd={canPerform('taxCompliance:create') ? handleAdd : undefined}
      showAdd={canPerform('taxCompliance:create')}
      showFilter={false}
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
        csvFilename="eway-bills"
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

      <EwayBillForm ref={formRef} onSubmit={handleCreateEwayBill} />

      {/* Detail View Modal */}
      <NormalModal
        open={viewOpen}
        onClose={handleCloseView}
        title="E-Way Bill Details"
        maxWidth="md"
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
        <EwayBillDetailView item={viewItem} />
      </NormalModal>
    </>
  );
};

EwayBillTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default EwayBillTable;
