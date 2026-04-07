import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import TableToolbar from '../../ui/TableToolbar';
import { damageAdjustmentsApi } from '../../services/api';
import { getDamageAdjustmentColumns } from './damageAdjustmentColumns';
import DamageAdjustmentDetailView from './DamageAdjustmentDetailView';
import { useLookupMaps, enrichRow } from '../../hooks/useLookupMaps';

const DamageAdjustmentsTable = ({ isLoading }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const tableRef = useRef(null);

  // Detail view
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // ── Fetch Damage Adjustments ──────────────────────────────────
  const { data: adjustmentsResult, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['damage-adjustments', page, rowsPerPage],
    queryFn: async () => {
      const res = await damageAdjustmentsApi.getAll(page + 1, rowsPerPage, {}, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return { data: items, total: res?.meta?.total ?? res?.total ?? items.length };
    },
    placeholderData: (prev) => prev,
  });

  const adjustments = adjustmentsResult?.data ?? [];
  const total = adjustmentsResult?.total ?? 0;

  // ── Lookup maps for resolving vehicleId/invoiceId ────────────
  const { invoiceMap, vehicleMap, vehicleByInvoiceMap, partMap } = useLookupMaps(true);

  // ── Handlers ──────────────────────────────────────────────────
  const handleView = useCallback((row) => {
    // Enrich both the row and its nested part data
    const enrichedPart = row.part ? enrichRow(row.part, invoiceMap, vehicleMap, vehicleByInvoiceMap, partMap) : row.part;
    const enriched = { ...enrichRow(row, invoiceMap, vehicleMap, vehicleByInvoiceMap, partMap), part: enrichedPart };
    setViewItem(enriched);
    setViewOpen(true);
  }, [invoiceMap, vehicleMap, vehicleByInvoiceMap, partMap]);

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setViewItem(null);
  }, []);

  // ── Search Filter ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return adjustments;
    const q = query.toLowerCase();
    return adjustments.filter((item) =>
      [
        item.part?.partName, item.partName, item.reason,
        item.previousCondition, item.newCondition,
        item._id, item.id, item.partId,
        item.part?.vechileId, item.part?.vehicleId,
        item.part?.invoiceId,
        item.recordedBy?.name, item.recordedByName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, adjustments]);

  const tableData = filtered.map((item) => {
    // Enrich both the row and its nested part data
    const enrichedPart = item.part ? enrichRow(item.part, invoiceMap, vehicleMap, vehicleByInvoiceMap, partMap) : item.part;
    return {
      ...enrichRow(item, invoiceMap, vehicleMap, vehicleByInvoiceMap, partMap),
      part: enrichedPart,
      id: item._id || item.id,
    };
  });

  // ── Columns ───────────────────────────────────────────────────
  const columns = useMemo(
    () => getDamageAdjustmentColumns({ handleView }),
    [handleView],
  );

  // ── Toolbar ───────────────────────────────────────────────────
  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search damage adjustments..."
      searchValue={query}
      onSearchChange={(val) => {
        setQuery(val);
        setPage(0);
      }}
      onCopy={() => {}}
      onPrint={() => window.print()}
      onRefresh={refetch}
      showFilter={false}
      showRefresh={true}
      showAdd={false}
      showExportCsv={true}
      onExportCsv={() => tableRef.current?.exportCsv()}
      showColumnToggle={true}
      onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
    />
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <NormalTable
        ref={tableRef}
        csvFilename="damage-adjustments"
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

      {/* Detail View Modal */}
      <NormalModal
        open={viewOpen}
        onClose={handleCloseView}
        title="Damage Adjustment Detail"
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
        <DamageAdjustmentDetailView item={viewItem} />
      </NormalModal>
    </>
  );
};

DamageAdjustmentsTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default DamageAdjustmentsTable;
