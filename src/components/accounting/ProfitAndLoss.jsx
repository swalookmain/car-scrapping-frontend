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
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';
import { useQuery } from '@tanstack/react-query';
import { accountingApi } from '../../services/api';
import inputSx from '../../services/inputStyles';
import { formatINR } from '../../services/taxEngine';

// ── CSV export ────────────────────────────────────────────────
function exportPnlCsv(pnl, filename = 'profit-and-loss') {
  if (!pnl) return;
  const rows = [
    ['Metric', 'Amount (₹)'],
    ['Total Sales Revenue', pnl.totalSales || pnl.totalIncome || pnl.income || 0],
    ['Total Purchase Cost', pnl.totalPurchases || pnl.totalExpense || pnl.expense || 0],
    ['Gross Profit', pnl.grossProfit || pnl.profitLoss || pnl.profit || 0],
    ['GST Liability', pnl.gstLiability || pnl.gstPayable || 0],
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==============================|| P&L REPORT ||============================== //

const ProfitAndLoss = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed
  // Financial year: Apr-Mar
  const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
  const [fromDate, setFromDate] = useState(`${fyStart}-04-01`);
  const [toDate, setToDate] = useState(`${fyStart + 1}-03-31`);

  const { data: pnlData, isLoading, refetch } = useQuery({
    queryKey: ['pnl-report', fromDate, toDate],
    queryFn: async () => {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const res = await accountingApi.getPnl(params);
      return res?.data || res;
    },
  });

  const pnl = useMemo(() => {
    if (!pnlData) return { sales: 0, purchases: 0, grossProfit: 0, gstLiability: 0 };

    const sales = Number(pnlData.totalSales || pnlData.totalIncome || pnlData.income) || 0;
    const purchases = Number(pnlData.totalPurchases || pnlData.totalExpense || pnlData.expense) || 0;
    const grossProfit = Number(pnlData.grossProfit || pnlData.profitLoss || pnlData.profit) || (sales - purchases);
    const gstLiability = Number(pnlData.gstLiability || pnlData.gstPayable) || 0;

    return { sales, purchases, grossProfit, gstLiability };
  }, [pnlData]);

  const profitMargin = pnl.sales > 0 ? ((pnl.grossProfit / pnl.sales) * 100).toFixed(1) : '0.0';
  const isProfitable = pnl.grossProfit >= 0;

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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-grey-100)',
          backgroundColor: 'var(--color-grey-50)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssessmentIcon sx={{ color: 'var(--color-secondary-main)', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-grey-800)', fontSize: '1rem' }}>
            Profit & Loss Statement
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => exportPnlCsv(pnlData)}
          disabled={!pnlData}
          startIcon={<DownloadIcon />}
          size="small"
          sx={{
            borderColor: 'var(--color-grey-300)',
            color: 'var(--color-grey-600)',
            textTransform: 'none',
          }}
        >
          Export
        </Button>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ── Filters ───────────────────────────────────── */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              fullWidth
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              fullWidth
              sx={inputSx}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              onClick={() => refetch()}
              fullWidth
              sx={{
                borderColor: 'var(--color-secondary-main)',
                color: 'var(--color-secondary-main)',
                textTransform: 'none',
                height: 40,
              }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="secondary" size={40} />
          </Box>
        ) : (
          <>
            {/* ── Profit Indicator ──────────────────────── */}
            <Box
              sx={{
                p: 3, borderRadius: 3,
                background: isProfitable
                  ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                  : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                border: `1px solid ${isProfitable ? '#a5d6a7' : '#ef9a9a'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
                flexDirection: 'column',
              }}
            >
              {isProfitable ? (
                <TrendingUpIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 40, color: '#c62828' }} />
              )}
              <Typography variant="h4" sx={{ fontWeight: 700, color: isProfitable ? '#2e7d32' : '#c62828' }}>
                {formatINR(pnl.grossProfit)}
              </Typography>
              <Typography variant="body2" sx={{ color: isProfitable ? '#388e3c' : '#d32f2f', fontWeight: 500 }}>
                {isProfitable ? 'Net Profit' : 'Net Loss'} · {profitMargin}% margin
              </Typography>
            </Box>

            {/* ── Breakdown Cards ───────────────────────── */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #c8e6c9',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Revenue (Sales)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1b5e20', mt: 1 }}>
                    {formatINR(pnl.sales)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ffe0b2',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Purchase Cost
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#bf360c', mt: 1 }}>
                    {formatINR(pnl.purchases)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    backgroundColor: isProfitable ? '#e8f5e9' : '#ffebee',
                    border: `1px solid ${isProfitable ? '#c8e6c9' : '#ffcdd2'}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: isProfitable ? '#2e7d32' : '#c62828', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Gross Profit
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: isProfitable ? '#1b5e20' : '#b71c1c', mt: 1 }}>
                    {formatINR(pnl.grossProfit)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 2.5, borderRadius: 2,
                    backgroundColor: '#fce4ec',
                    border: '1px solid #f8bbd0',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#c62828', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    GST Liability
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#b71c1c', mt: 1 }}>
                    {formatINR(pnl.gstLiability)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider />

            {/* ── Detailed Breakdown ────────────────────── */}
            <Box sx={{ borderRadius: 2, border: '1px solid var(--color-grey-200)', overflow: 'hidden' }}>
              {[
                { label: 'Sales Revenue', value: pnl.sales, color: '#2e7d32', section: 'income' },
                { label: 'Less: Purchase Costs', value: pnl.purchases, color: '#e65100', section: 'expense', prefix: '−' },
                { label: 'Gross Profit / (Loss)', value: pnl.grossProfit, color: isProfitable ? '#2e7d32' : '#c62828', section: 'result', bold: true },
                { label: 'GST Liability (Payable)', value: pnl.gstLiability, color: '#c62828', section: 'tax' },
              ].map((row, idx) => (
                <Box
                  key={row.label}
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    px: 3, py: 2,
                    borderBottom: idx < 3 ? '1px solid var(--color-grey-100)' : 'none',
                    backgroundColor: row.bold ? 'var(--color-grey-50)' : 'transparent',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: row.bold ? 700 : 500,
                      color: 'var(--color-grey-700)',
                      fontSize: row.bold ? '0.9rem' : '0.85rem',
                    }}
                  >
                    {row.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: row.bold ? 700 : 600,
                      color: row.color,
                      fontSize: row.bold ? '1rem' : '0.9rem',
                    }}
                  >
                    {row.prefix || ''}{formatINR(Math.abs(row.value))}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ProfitAndLoss;
