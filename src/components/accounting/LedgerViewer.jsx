import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  MenuItem,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery } from '@tanstack/react-query';
import { accountingApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import { formatINR } from '../../services/taxEngine';

// ── Reference type colors ──────────────────────────────────────
const REF_COLORS = {
  PURCHASE_INVOICE: { bg: '#e3f2fd', color: '#1565c0', label: 'Purchase Invoice' },
  SALES_INVOICE:    { bg: '#e8f5e9', color: '#2e7d32', label: 'Sales Invoice' },
  PAYMENT:          { bg: '#fff3e0', color: '#e65100', label: 'Payment' },
};

// ── CSV export ────────────────────────────────────────────────
function exportLedgerCsv(entries, filename = 'ledger-entries') {
  if (!entries || !entries.length) return;
  const headers = ['Date', 'Account', 'Debit', 'Credit', 'Reference Type', 'Reference ID'];
  const rows = entries.map((e) => [
    e.createdAt || e.created_at || '',
    e.accountName || e.account?.accountName || e.account?.account_name || e.accountId || '',
    e.debitAmount || e.debit_amount || 0,
    e.creditAmount || e.credit_amount || 0,
    e.referenceType || e.reference_type || '',
    e.referenceId || e.reference_id || '',
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==============================|| LEDGER VIEWER ||============================== //

const LedgerViewer = () => {
  const currentYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${currentYear}-04-01`);
  const [toDate, setToDate] = useState(`${currentYear + 1}-03-31`);
  const [referenceType, setReferenceType] = useState('');
  const [accountId, setAccountId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Fetch chart of accounts for the filter dropdown
  const { data: accountsData } = useQuery({
    queryKey: ['chart-of-accounts-filter'],
    queryFn: async () => {
      const res = await accountingApi.getChartOfAccounts();
      return res?.data || res;
    },
    staleTime: 5 * 60 * 1000,
  });

  const accountsList = useMemo(() => {
    if (!accountsData) return [];
    return Array.isArray(accountsData) ? accountsData : [];
  }, [accountsData]);

  // Fetch ledger entries
  const { data: ledgerData, isLoading, refetch } = useQuery({
    queryKey: ['ledger-entries', fromDate, toDate, referenceType, accountId, page, rowsPerPage],
    queryFn: async () => {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (referenceType) params.referenceType = referenceType;
      if (accountId) params.accountId = accountId;
      const res = await accountingApi.getLedgerEntries(params);
      return res?.data || res;
    },
  });

  const entries = useMemo(() => {
    if (!ledgerData) return [];
    if (Array.isArray(ledgerData)) return ledgerData;
    if (ledgerData.entries) return ledgerData.entries;
    if (ledgerData.data) return ledgerData.data;
    return [];
  }, [ledgerData]);

  const totalCount = useMemo(() => {
    if (!ledgerData) return 0;
    return ledgerData.total || ledgerData.totalCount || entries.length;
  }, [ledgerData, entries]);

  // ── Totals ──────────────────────────────────────────────────
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => ({
        debit: acc.debit + (Number(e.debitAmount || e.debit_amount) || 0),
        credit: acc.credit + (Number(e.creditAmount || e.credit_amount) || 0),
      }),
      { debit: 0, credit: 0 }
    );
  }, [entries]);

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid var(--color-grey-100)',
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <Box
        sx={{
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 1.5,
          borderBottom: '1px solid var(--color-grey-100)',
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        <MenuBookIcon sx={{ color: 'var(--color-secondary-main)', fontSize: 22 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-grey-800)', fontSize: '1rem' }}>
          General Ledger
        </Typography>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ── Filters ───────────────────────────────────── */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
              fullWidth
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(0); }}
              fullWidth
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select
              label="Reference Type"
              value={referenceType}
              onChange={(e) => { setReferenceType(e.target.value); setPage(0); }}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PURCHASE_INVOICE">Purchase Invoice</MenuItem>
              <MenuItem value="SALES_INVOICE">Sales Invoice</MenuItem>
              <MenuItem value="PAYMENT">Payment</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select
              label="Account"
              value={accountId}
              onChange={(e) => { setAccountId(e.target.value); setPage(0); }}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="">All Accounts</MenuItem>
              {accountsList.map((acc) => (
                <MenuItem key={acc.id} value={acc.id}>
                  {acc.accountName || acc.account_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => refetch()}
                sx={{
                  borderColor: 'var(--color-secondary-main)',
                  color: 'var(--color-secondary-main)',
                  textTransform: 'none',
                  flex: 1,
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={() => exportLedgerCsv(entries)}
                disabled={entries.length === 0}
                startIcon={<DownloadIcon />}
                sx={{
                  borderColor: 'var(--color-grey-300)',
                  color: 'var(--color-grey-600)',
                  textTransform: 'none',
                }}
              >
                CSV
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* ── Summary Cards ─────────────────────────────── */}
        <Grid container spacing={2}>
          {[
            { label: 'Total Debit', value: totals.debit, color: '#c62828' },
            { label: 'Total Credit', value: totals.credit, color: '#2e7d32' },
            { label: 'Net Balance', value: totals.debit - totals.credit, color: '#1565c0' },
            { label: 'Entries', value: totalCount, color: '#6a1b9a', raw: true },
          ].map((card) => (
            <Grid item xs={6} sm={3} key={card.label}>
              <Box
                sx={{
                  p: 2, borderRadius: 2,
                  backgroundColor: 'var(--color-grey-50)',
                  border: '1px solid var(--color-grey-100)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {card.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: card.color, fontSize: '1rem', mt: 0.5 }}>
                  {card.raw ? card.value : formatINR(card.value)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider />

        {/* ── Data Table ────────────────────────────────── */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="secondary" size={36} />
          </Box>
        ) : entries.length > 0 ? (
          <>
            <Box sx={{ overflowX: 'auto', borderRadius: 2, border: '1px solid var(--color-grey-200)' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'var(--color-grey-50)' }}>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Account</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Debit (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Credit (₹)</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Reference ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry, idx) => {
                    const refType = entry.referenceType || entry.reference_type || '';
                    const refInfo = REF_COLORS[refType] || { bg: '#f5f5f5', color: '#616161', label: refType };
                    const debit = Number(entry.debitAmount || entry.debit_amount) || 0;
                    const credit = Number(entry.creditAmount || entry.credit_amount) || 0;

                    return (
                      <TableRow key={entry.id || idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                          {(entry.createdAt || entry.created_at)
                            ? new Date(entry.createdAt || entry.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })
                            : '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem' }}>
                          {entry.accountName || entry.account?.accountName || entry.account?.account_name || '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: debit > 0 ? 600 : 400, color: debit > 0 ? '#c62828' : 'var(--color-grey-400)' }}>
                          {debit > 0 ? formatINR(debit) : '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: credit > 0 ? 600 : 400, color: credit > 0 ? '#2e7d32' : 'var(--color-grey-400)' }}>
                          {credit > 0 ? formatINR(credit) : '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={refInfo.label}
                            size="small"
                            sx={{
                              fontSize: '0.68rem', fontWeight: 600,
                              backgroundColor: refInfo.bg,
                              color: refInfo.color,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', color: 'var(--color-grey-500)', fontFamily: 'monospace' }}>
                          {(entry.referenceId || entry.reference_id || '—').toString().slice(0, 12)}…
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 20, 50, 100]}
              sx={{ borderTop: '1px solid var(--color-grey-100)' }}
            />
          </>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontStyle: 'italic' }}>
              No ledger entries found for the selected criteria
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default LedgerViewer;
