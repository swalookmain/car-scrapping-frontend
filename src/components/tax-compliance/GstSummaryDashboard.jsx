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
  Chip,
  MenuItem,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { useQuery } from '@tanstack/react-query';
import { taxComplianceApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import { formatINR } from '../../services/taxEngine';

// ── CSV export helper ──────────────────────────────────────────
function exportSummaryCsv(data, filename = 'gst-summary') {
  if (!data || !data.length) return;
  const headers = ['Month', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total Tax', 'RCM Amount'];
  const rows = data.map((r) => [
    r.month || '',
    r.totalTaxable ?? r.taxableAmount ?? 0,
    r.cgst ?? r.cgstAmount ?? 0,
    r.sgst ?? r.sgstAmount ?? 0,
    r.igst ?? r.igstAmount ?? 0,
    r.totalTax ?? r.totalTaxAmount ?? 0,
    r.rcmAmount ?? 0,
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

// ==============================|| GST SUMMARY DASHBOARD ||============================== //

const GstSummaryDashboard = () => {
  const currentYear = new Date().getFullYear();
  const [dateFrom, setDateFrom] = useState(`${currentYear}-04-01`);
  const [dateTo, setDateTo] = useState(`${currentYear + 1}-03-31`);
  const [invoiceType, setInvoiceType] = useState('');

  // ── Fetch GST Summary ────────────────────────────────────────
  const { data: summaryData, isLoading, refetch } = useQuery({
    queryKey: ['gst-summary', dateFrom, dateTo, invoiceType],
    queryFn: async () => {
      const filters = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (invoiceType) filters.invoiceType = invoiceType;
      const res = await taxComplianceApi.getGstSummary(filters);
      return res?.data || res;
    },
    enabled: true,
  });

  // Normalize to array (API may return single summary or monthly breakup)
  const summaryRows = useMemo(() => {
    if (!summaryData) return [];
    if (Array.isArray(summaryData)) return summaryData;
    // Single object → wrap in array
    return [summaryData];
  }, [summaryData]);

  // ── Aggregate totals ────────────────────────────────────────
  const totals = useMemo(() => {
    return summaryRows.reduce(
      (acc, r) => ({
        taxable: acc.taxable + (Number(r.totalTaxable ?? r.taxableAmount) || 0),
        cgst: acc.cgst + (Number(r.cgst ?? r.cgstAmount) || 0),
        sgst: acc.sgst + (Number(r.sgst ?? r.sgstAmount) || 0),
        igst: acc.igst + (Number(r.igst ?? r.igstAmount) || 0),
        totalTax: acc.totalTax + (Number(r.totalTax ?? r.totalTaxAmount) || 0),
        rcm: acc.rcm + (Number(r.rcmAmount) || 0),
      }),
      { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0, rcm: 0 }
    );
  }, [summaryRows]);

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid var(--color-grey-100)',
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid var(--color-grey-100)',
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        <SummarizeIcon sx={{ color: 'var(--color-secondary-main)', fontSize: 22 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-grey-800)', fontSize: '1rem' }}>
          GST Summary Report
        </Typography>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ── Filters ───────────────────────────────────────── */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              fullWidth
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              fullWidth
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Invoice Type"
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
              fullWidth
              sx={inputSx}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PURCHASE">Purchase</MenuItem>
              <MenuItem value="SALES">Sales</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
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
                onClick={() => exportSummaryCsv(summaryRows)}
                disabled={summaryRows.length === 0}
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

        {/* ── Summary Cards ─────────────────────────────────── */}
        <Grid container spacing={2}>
          {[
            { label: 'Total Taxable', value: totals.taxable, color: '#1565c0' },
            { label: 'CGST', value: totals.cgst, color: '#2e7d32' },
            { label: 'SGST', value: totals.sgst, color: '#00695c' },
            { label: 'IGST', value: totals.igst, color: '#6a1b9a' },
            { label: 'Total Tax', value: totals.totalTax, color: '#e65100' },
            { label: 'RCM Amount', value: totals.rcm, color: '#c62828' },
          ].map((card) => (
            <Grid item xs={6} sm={4} md={2} key={card.label}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'var(--color-grey-50)',
                  border: '1px solid var(--color-grey-100)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {card.label}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: card.color, fontSize: '1rem', mt: 0.5 }}>
                  {formatINR(card.value)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider />

        {/* ── Data Table ────────────────────────────────────── */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="secondary" size={36} />
          </Box>
        ) : summaryRows.length > 0 ? (
          <Box sx={{ overflowX: 'auto', borderRadius: 2, border: '1px solid var(--color-grey-200)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--color-grey-50)' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Taxable Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">CGST</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">SGST</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">IGST</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Total Tax</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">RCM</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summaryRows.map((row, idx) => (
                  <TableRow key={row.month || idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {row.month || `Period ${idx + 1}`}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                      {formatINR(row.totalTaxable ?? row.taxableAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#2e7d32' }}>
                      {formatINR(row.cgst ?? row.cgstAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#00695c' }}>
                      {formatINR(row.sgst ?? row.sgstAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', color: '#6a1b9a' }}>
                      {formatINR(row.igst ?? row.igstAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {formatINR(row.totalTax ?? row.totalTaxAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem' }}>
                      {(row.rcmAmount ?? 0) > 0 ? (
                        <Chip label={formatINR(row.rcmAmount)} size="small" sx={{ fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#ffebee', color: '#c62828' }} />
                      ) : (
                        formatINR(0)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                {summaryRows.length > 1 && (
                  <TableRow sx={{ backgroundColor: 'var(--color-grey-50)' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{formatINR(totals.taxable)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#2e7d32' }}>{formatINR(totals.cgst)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#00695c' }}>{formatINR(totals.sgst)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#6a1b9a' }}>{formatINR(totals.igst)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{formatINR(totals.totalTax)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{formatINR(totals.rcm)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontStyle: 'italic' }}>
              No GST data found for the selected period
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default GstSummaryDashboard;
