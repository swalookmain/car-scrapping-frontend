import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Chip, Grid, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import NormalTable from '../../ui/NormalTable';
import TableToolbar from '../../ui/TableToolbar';
import { liftingApi } from '../../services/api';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdue', label: 'Overdue' },
];

const monthBounds = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const last = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
  return { from, to };
};

const formatDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
};

const staffLabel = (assignedTo) => {
  if (!assignedTo) return 'Unassigned';
  if (typeof assignedTo === 'string') return assignedTo;
  return assignedTo.name || assignedTo.email || 'Unassigned';
};

const KPI_CARDS = [
  { key: 'pending', label: 'Pending', color: '#b45309', bg: '#fff8e1', border: '#fde68a' },
  { key: 'upcoming', label: 'Upcoming', color: '#1565c0', bg: '#e3f2fd', border: '#90caf9' },
  { key: 'overdue', label: 'Overdue', color: '#c62828', bg: '#ffebee', border: '#ef9a9a' },
  { key: 'completed', label: 'Completed', color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7' },
];

export default function LiftingTable() {
  const defaults = monthBounds();
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  const dateParams = { from: from || undefined, to: to || undefined };

  const {
    data: listResult,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['lifting', tab, page, rowsPerPage, from, to],
    queryFn: async () => {
      const res = await liftingApi.getAll({
        tab,
        page: page + 1,
        limit: rowsPerPage,
        ...dateParams,
      });
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return {
        data: items,
        total: res?.meta?.total ?? items.length,
      };
    },
    placeholderData: (prev) => prev,
  });

  const { data: summary } = useQuery({
    queryKey: ['lifting-summary', from, to],
    queryFn: async () => {
      const res = await liftingApi.getSummary(dateParams);
      return res?.data || res || {};
    },
  });

  const rows = listResult?.data ?? [];
  const total = listResult?.total ?? 0;

  const tableData = useMemo(() => {
    const mapped = rows.map((row) => {
      const lead = row.leadId && typeof row.leadId === 'object' ? row.leadId : {};
      const snapshot = row.snapshot || {};
      return {
        ...row,
        id: row._id || row.id,
        leadName: lead.name || snapshot.leadName || '—',
        registrationNumber:
          lead.registrationNumber || snapshot.registrationNumber || '—',
        vehicleName: lead.vehicleName || snapshot.vehicleName || '—',
        staffName: staffLabel(row.assignedTo) || snapshot.assignedStaffName || 'Unassigned',
        expectedArrivalAt: formatDate(row.expectedArrivalAt),
        completedAt: formatDate(row.completedAt),
        jobStatus: row.status,
      };
    });
    if (!query.trim()) return mapped;
    const q = query.toLowerCase();
    return mapped.filter(
      (row) =>
        String(row.leadName).toLowerCase().includes(q) ||
        String(row.registrationNumber).toLowerCase().includes(q) ||
        String(row.vehicleName).toLowerCase().includes(q) ||
        String(row.staffName).toLowerCase().includes(q),
    );
  }, [rows, query]);

  const columns = useMemo(
    () => [
      { field: 'leadName', headerName: 'Lead' },
      { field: 'registrationNumber', headerName: 'Registration' },
      { field: 'vehicleName', headerName: 'Vehicle' },
      { field: 'staffName', headerName: 'Staff' },
      { field: 'expectedArrivalAt', headerName: 'Expected arrival' },
      ...(tab === 'completed'
        ? [{ field: 'completedAt', headerName: 'Completed' }]
        : []),
      {
        field: 'jobStatus',
        headerName: 'Status',
        render: (row) => (
          <Chip
            size="small"
            label={row.jobStatus === 'COMPLETED' ? 'Completed' : 'Pending'}
            sx={{
              bgcolor: row.jobStatus === 'COMPLETED' ? '#e8f5e9' : '#fff8e1',
              color: row.jobStatus === 'COMPLETED' ? '#2e7d32' : '#f57f17',
            }}
          />
        ),
      },
    ],
    [tab],
  );

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {KPI_CARDS.map((card) => (
          <Grid item xs={6} md={3} key={card.key}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                background: card.bg,
                border: `1px solid ${card.border}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: card.color, textTransform: 'uppercase' }}>
                {card.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: card.color }}>
                {summary?.[card.key] ?? 0}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          type="date"
          size="small"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(0);
          }}
        />
        <TextField
          type="date"
          size="small"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(0);
          }}
        />
      </Box>
      <Tabs
        value={tab}
        onChange={(_, next) => {
          setTab(next);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      >
        {TABS.map((item) => (
          <Tab key={item.id} value={item.id} label={item.label} />
        ))}
      </Tabs>
      <NormalTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        toolbar={
          <TableToolbar
            searchValue={query}
            onSearchChange={(v) => {
              setQuery(v);
              setPage(0);
            }}
            searchPlaceholder="Search lead or registration…"
            onRefresh={refetch}
            showRefresh
            showAdd={false}
            showCopy={false}
            showPrint={false}
            showFilter={false}
          />
        }
      />
    </Box>
  );
}
