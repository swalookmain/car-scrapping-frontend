import React, { useMemo, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box, MenuItem, TextField, Button } from '@mui/material';
import NormalTable from '../../ui/NormalTable';
import TableToolbar from '../../ui/TableToolbar';
import { getGstAuditColumns } from './gstAuditColumns';
import { taxComplianceApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import { useLookupMaps, enrichRow } from '../../hooks/useLookupMaps';

const GST_EVENT_TYPES = ['', 'GST_CALCULATED', 'RCM_APPLIED', 'EWAY_ADDED'];
const INVOICE_TYPES = ['', 'PURCHASE', 'SALES'];

const GstAuditTable = ({ isLoading }) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterEvent, setFilterEvent] = useState('');
  const [filterInvoiceType, setFilterInvoiceType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const tableRef = useRef(null);

  // ── Fetch GST Audit Logs via React Query ─────────────────────
  const { data: auditResult, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['gst-audit-logs', page, rowsPerPage, filterEvent, filterInvoiceType],
    queryFn: async () => {
      const filters = {};
      if (filterEvent) filters.eventType = filterEvent;
      if (filterInvoiceType) filters.invoiceType = filterInvoiceType;
      const res = await taxComplianceApi.getGstAuditLogs(page + 1, rowsPerPage, filters);
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return { data: items, total: res?.meta?.total ?? res?.total ?? items.length };
    },
    placeholderData: (prev) => prev,
  });

  const auditLogs = auditResult?.data ?? [];
  const total = auditResult?.total ?? 0;

  // ── Lookup maps for resolving invoiceId ─────────────────────
  const { invoiceMap, vehicleMap, vehicleByInvoiceMap } = useLookupMaps(true);

  // ── Search Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return auditLogs;
    const q = query.toLowerCase();
    return auditLogs.filter((item) =>
      [item.eventType, item.invoiceType, item.invoiceId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, auditLogs]);

  const tableData = filtered.map((item) => ({
    ...enrichRow(item, invoiceMap, vehicleMap, vehicleByInvoiceMap),
    id: item._id || item.id,
  }));

  // ── Columns ──────────────────────────────────────────────────
  const columns = useMemo(() => getGstAuditColumns(), []);

  // ── Toolbar ──────────────────────────────────────────────────
  const toolbar = (
    <Box>
      <TableToolbar
        searchPlaceholder="Search audit logs..."
        searchValue={query}
        onSearchChange={(val) => {
          setQuery(val);
          setPage(0);
        }}
        onRefresh={refetch}
        showAdd={false}
        onFilter={() => setShowFilters((p) => !p)}
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
            label="Event Type"
            value={filterEvent}
            onChange={(e) => {
              setFilterEvent(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ ...inputSx, minWidth: 180 }}
          >
            <MenuItem value="">All Events</MenuItem>
            {GST_EVENT_TYPES.filter(Boolean).map((s) => (
              <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Invoice Type"
            value={filterInvoiceType}
            onChange={(e) => {
              setFilterInvoiceType(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ ...inputSx, minWidth: 160 }}
          >
            <MenuItem value="">All Types</MenuItem>
            {INVOICE_TYPES.filter(Boolean).map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Button
            size="small"
            onClick={() => {
              setFilterEvent('');
              setFilterInvoiceType('');
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

  return (
    <NormalTable
      ref={tableRef}
      csvFilename="gst-audit-logs"
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
  );
};

GstAuditTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default GstAuditTable;
