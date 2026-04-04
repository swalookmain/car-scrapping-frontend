import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import NormalTable from '../../ui/NormalTable';
import TableToolbar from '../../ui/TableToolbar';
import ComplianceForm from './ComplianceForm';
import { vehicleComplianceApi, invoicesApi } from '../../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';
import ComplianceFilters from './ComplianceFilters';
import ComplianceDetailView from './ComplianceDetailView';
import { getComplianceColumns } from './complianceColumns';
import { useLookupMaps, enrichRow } from '../../hooks/useLookupMaps';

const ComplianceTable = ({ isLoading }) => {
  const { canPerform } = usePermissions();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filters
  const [filterCod, setFilterCod] = useState('');
  const [filterCvs, setFilterCvs] = useState('');
  const [filterRto, setFilterRto] = useState('');
  const [filterInvoiceId, setFilterInvoiceId] = useState('');
  const [filterVehicleId, setFilterVehicleId] = useState('');
  const [vehicleFetching, setVehicleFetching] = useState(false);
  const [selectedVehicleLabel, setSelectedVehicleLabel] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const formRef = useRef(null);
  const tableRef = useRef(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // ── Fetch Compliance Records via React Query ──────────────────
  const { data: complianceResult, isLoading: loadingData, refetch: refetchRecords } = useQuery({
    queryKey: ['compliance', page, rowsPerPage, filterCod, filterCvs, filterRto, filterInvoiceId, filterVehicleId],
    queryFn: async () => {
      const params = {};
      if (filterCod !== '') params.codGenerated = filterCod;
      if (filterCvs !== '') params.cvsGenerated = filterCvs;
      if (filterRto !== '') params.rtoStatus = filterRto;
      if (filterInvoiceId) params.invoiceId = filterInvoiceId;
      if (filterVehicleId) params.vehicleId = filterVehicleId;
      const res = await vehicleComplianceApi.getAll(page + 1, rowsPerPage, params, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : [];
      return { data: items, total: res?.meta?.total ?? items.length };
    },
    placeholderData: (prev) => prev,
  });

  const records = complianceResult?.data ?? [];
  const total = complianceResult?.total ?? 0;

  // ── Lookup maps for resolving vehicleId/invoiceId ────────────
  const { invoiceMap, vehicleMap, vehicleByInvoiceMap } = useLookupMaps(true);

  // ── Fetch Invoices for filter dropdown (shared cache) ──────────────
  const { data: invoicesForFilter = [], isLoading: invoiceLoading } = useQuery({
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

  const handleView = useCallback((row) => {
    setViewItem(enrichRow(row, invoiceMap, vehicleMap, vehicleByInvoiceMap));
    setViewOpen(true);
  }, [invoiceMap, vehicleMap, vehicleByInvoiceMap]);

  const handleCreateOrUpdate = async ({ payload, editingId, isUpdate }) => {
    try {
      if (isUpdate) {
        await vehicleComplianceApi.updateRto(editingId, payload);
        toast.success('COD compliance record updated successfully');
      } else {
        await vehicleComplianceApi.create(payload);
        toast.success('COD compliance record created successfully');
      }
      vehicleComplianceApi.invalidateCache();
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    } catch (err) {
      console.error('Compliance save error:', err);
      const msg = err?.response?.data?.message || 'Failed to save compliance record.';
      toast.error(msg);
    }
  };

  // ── Search Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return records;
    const q = query.toLowerCase();
    return records.filter((r) =>
      [r.vehicleId, r.invoiceId, r.rtoOffice, r.rtoStatus, r.codInwardNumber, r.remarks]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, records]);

  const tableData = filtered.map((item) => ({
    ...enrichRow(item, invoiceMap, vehicleMap, vehicleByInvoiceMap),
    id: item._id || item.id,
  }));

  // ── Columns ──────────────────────────────────────────────────
  const columns = useMemo(
    () => getComplianceColumns({ canPerform, handleView, handleEdit }),
    [canPerform, handleView, handleEdit],
  );

  // ── Clear Filters ────────────────────────────────────────────
  const handleClearFilters = () => {
    setFilterCod('');
    setFilterCvs('');
    setFilterRto('');
    setFilterInvoiceId('');
    setFilterVehicleId('');
    setSelectedInvoiceId('');
    setSelectedVehicleLabel('');
    setPage(0);
  };

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <Box>
      <TableToolbar
        searchPlaceholder="Search compliance records..."
        searchValue={query}
        onSearchChange={(val) => {
          setQuery(val);
          setPage(0);
        }}
        onCopy={() => {}}
        onPrint={() => window.print()}
        onFilter={() => setShowFilters((p) => !p)}
        onAdd={handleAdd}
        onRefresh={() => refetchRecords()}
        showFilter={true}
        showRefresh={true}
        showExportCsv={true}
        onExportCsv={() => tableRef.current?.exportCsv()}
        showColumnToggle={true}
        onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
      />
      {showFilters && (
        <ComplianceFilters
          filterCod={filterCod}
          setFilterCod={setFilterCod}
          filterCvs={filterCvs}
          setFilterCvs={setFilterCvs}
          filterRto={filterRto}
          setFilterRto={setFilterRto}
          invoices={invoicesForFilter}
          invoiceLoading={invoiceLoading}
          selectedInvoiceId={selectedInvoiceId}
          setSelectedInvoiceId={setSelectedInvoiceId}
          selectedVehicleLabel={selectedVehicleLabel}
          setSelectedVehicleLabel={setSelectedVehicleLabel}
          filterVehicleId={filterVehicleId}
          setFilterVehicleId={setFilterVehicleId}
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
        csvFilename="compliance"
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

      <ComplianceForm ref={formRef} onSubmit={handleCreateOrUpdate} />

      <ComplianceDetailView
        open={viewOpen}
        onClose={() => { setViewOpen(false); setViewItem(null); }}
        item={viewItem}
      />
    </>
  );
};

ComplianceTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default ComplianceTable;
