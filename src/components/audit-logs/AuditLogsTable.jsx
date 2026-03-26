import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import NormalTable from '../../ui/NormalTable';
import AuditLogDetailDialog from './AuditLogDetailDialog';
import AuditLogsToolbar from './AuditLogsToolbar';
import { auditLogsApi } from '../../services/api';
import { mapLog } from './auditLogsHelpers';
import { getAuditLogsColumns } from './auditLogsColumns';

const AuditLogsTable = ({ isLoading: parentLoading, variant = 'admin' }) => {
  const [query,        setQuery]        = useState('');
  const [page,         setPage]         = useState(0);
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [showFilters,  setShowFilters]  = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate,    setStartDate]    = useState('');
  const [endDate,      setEndDate]      = useState('');

  const tableRef = useRef(null);

  const [detailOpen,    setDetailOpen]    = useState(false);
  const [detailLog,     setDetailLog]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────
  const { data: logsResult, isLoading: loadingData, refetch: refetchLogs } = useQuery({
    queryKey: ['audit-logs', page, rowsPerPage, actionFilter, statusFilter, startDate, endDate, variant],
    queryFn: async () => {
      const params = {
        page:      page + 1,
        limit:     rowsPerPage,
        action:    actionFilter || undefined,
        status:    statusFilter || undefined,
        startDate: startDate    || undefined,
        endDate:   endDate      || undefined,
      };
      const apiFn = variant === 'superadmin' ? auditLogsApi.getAll : auditLogsApi.getStaffLogs;
      const res   = await apiFn(params);
      const items = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return {
        data:  items.map(mapLog),
        total: res?.meta?.total ?? res?.total ?? res?.pagination?.total ?? items.length,
      };
    },
    placeholderData: (prev) => prev,
  });

  const logs       = logsResult?.data  ?? [];
  const totalCount = logsResult?.total ?? 0;

  useEffect(() => {
    setPage(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, statusFilter, startDate, endDate, variant]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleViewDetail = async (row) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailLog(null);
    try {
      const res = await auditLogsApi.getById(row.id);
      setDetailLog(res?.data || res);
    } catch {
      setDetailLog(row.raw);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleResetFilters = useCallback(() => {
    setActionFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  }, []);

  const toggleFilters = useCallback(() => setShowFilters((p) => !p), []);
  const closeDetail   = useCallback(() => setDetailOpen(false), []);

// ── Local search ───────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    if (!query.trim()) return logs;
    const q = query.toLowerCase();
    return logs.filter((l) =>
      [l.action, l.actorRole, l.actorId, l.actorName, l.resource, l.resourceId, l.ip, l.browser, l.os, l.status]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query, logs]);

  // ── Columns (from extracted module) ───────────────────────────
  const columns = getAuditLogsColumns({ handleViewDetail });

  const toolbar = (
    <AuditLogsToolbar
      query={query}             onQueryChange={setQuery}
      showFilters={showFilters} onToggleFilters={toggleFilters}
      actionFilter={actionFilter} onActionChange={setActionFilter}
      statusFilter={statusFilter} onStatusChange={setStatusFilter}
      startDate={startDate}     onStartDateChange={setStartDate}
      endDate={endDate}         onEndDateChange={setEndDate}
      onRefresh={refetchLogs}
      onClearFilters={handleResetFilters}
      onExportCsv={() => tableRef.current?.exportCsv()}
      onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
    />
  );

  return (
    <>
      <NormalTable
        ref={tableRef}
        csvFilename="audit-logs"
        columns={columns}
        data={filteredLogs}
        isLoading={parentLoading || loadingData}
        toolbar={toolbar}
        showCheckbox={false}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newSize) => { setRowsPerPage(newSize); setPage(0); }}
      />

      <AuditLogDetailDialog
        open={detailOpen}
        onClose={closeDetail}
        log={detailLog}
        loading={detailLoading}
      />
    </>
  );
};

AuditLogsTable.propTypes = {
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(['admin', 'superadmin']),
};

export default AuditLogsTable;