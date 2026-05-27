import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Box, Chip, IconButton, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NormalTable from '../../ui/NormalTable';
import TableToolbar from '../../ui/TableToolbar';
import { yardApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import YardDashboardCards from './YardDashboardCards';
import YardVehicleModal from './YardVehicleModal';
import { YARD_STATUS_COLORS, YARD_STATUS_LABELS } from './yardConstants';

const STATUS_FILTER_OPTIONS = [
  '',
  'AWAITING_ARRIVAL',
  'PARKED',
  'DISMANTLING_IN_PROGRESS',
  'DISMANTLED',
  'EXITED',
];

const YardTable = ({ isLoading: pageLoading }) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { data: dashboard } = useQuery({
    queryKey: ['yard-dashboard'],
    queryFn: () => yardApi.getDashboard(),
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['yard-zones'],
    queryFn: async () => {
      const res = await yardApi.getZones();
      return Array.isArray(res) ? res : res?.data ?? [];
    },
  });

  const {
    data: listResult,
    isLoading: loadingData,
    refetch,
  } = useQuery({
    queryKey: ['yard-vehicles', page, rowsPerPage, statusFilter, query],
    queryFn: async () => {
      const params = { page: page + 1, limit: rowsPerPage };
      if (statusFilter) params.status = statusFilter;
      if (query.trim()) params.registrationNumber = query.trim();
      const res = await yardApi.getVehicles(params);
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return {
        data: items,
        total: res?.meta?.total ?? items.length,
      };
    },
    placeholderData: (prev) => prev,
  });

  const rows = listResult?.data ?? [];
  const total = listResult?.total ?? 0;

  const handleRowClick = useCallback((row) => {
    setSelected(row);
    setDetailOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    setDetailOpen(false);
    setSelected(null);
    refetch();
  }, [refetch]);

  const columns = useMemo(
    () => [
      {
        field: 'registrationNumber',
        headerName: 'Reg. no.',
        width: '14%',
        render: (row) => (
          <Typography variant="body2" fontWeight={600}>
            {row.registrationNumber || '—'}
          </Typography>
        ),
      },
      {
        field: 'vehicle',
        headerName: 'Vehicle',
        width: '18%',
        render: (row) => (
          <Typography variant="body2">
            {[row.make, row.modelName].filter(Boolean).join(' ') || '—'}
          </Typography>
        ),
      },
      {
        field: 'currentStatus',
        headerName: 'Status',
        width: '16%',
        render: (row) => {
          const s = row.currentStatus;
          const c = YARD_STATUS_COLORS[s] || { bg: '#eee', color: '#333' };
          return (
            <Chip
              size="small"
              label={YARD_STATUS_LABELS[s] || s}
              sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }}
            />
          );
        },
      },
      {
        field: 'zone',
        headerName: 'Zone / slot',
        width: '16%',
        render: (row) => (
          <Typography variant="body2">
            {row.currentZoneId?.name || '—'}
            {row.currentSlot ? ` · ${row.currentSlot}` : ''}
          </Typography>
        ),
      },
      {
        field: 'sourceType',
        headerName: 'Source',
        width: '10%',
        render: (row) => row.sourceType || '—',
      },
      {
        field: 'invoice',
        headerName: 'Invoice',
        width: '14%',
        render: (row) =>
          row.invoiceId?.invoiceNumber || row.invoiceId?.sellerName || '—',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: '8%',
        render: (row, onAction) => (
          <Tooltip title="View / manage">
            <IconButton size="small" onClick={() => onAction?.('view', row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  const handleAction = useCallback(
    (action, row) => {
      if (action === 'view') handleRowClick(row);
    },
    [handleRowClick],
  );

  const tableData = rows.map((row) => ({
    ...row,
    id: row._id || row.id,
  }));

  return (
    <Box>
      <YardDashboardCards summary={dashboard} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ ...inputSx, minWidth: 200 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {STATUS_FILTER_OPTIONS.filter(Boolean).map((s) => (
            <MenuItem key={s} value={s}>
              {YARD_STATUS_LABELS[s]}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <NormalTable
        columns={columns}
        data={tableData}
        isLoading={pageLoading || loadingData}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onActionClick={handleAction}
        toolbar={
          <TableToolbar
            searchValue={query}
            onSearchChange={(v) => {
              setQuery(v);
              setPage(0);
            }}
            searchPlaceholder="Search registration number…"
            onRefresh={refetch}
            showRefresh
          />
        }
      />

      <YardVehicleModal
        open={detailOpen}
        item={selected}
        zones={zones}
        onClose={() => {
          setDetailOpen(false);
          setSelected(null);
        }}
        onSaved={handleSaved}
      />
    </Box>
  );
};

YardTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default YardTable;
