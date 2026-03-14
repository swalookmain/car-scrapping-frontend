import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GavelIcon from '@mui/icons-material/Gavel';
import { useQuery } from '@tanstack/react-query';
import { accountingApi } from '../../services/api';
import { formatINR } from '../../services/taxEngine';

// ==============================|| ACCOUNTS DASHBOARD ||============================== //

const AccountsDashboard = () => {
  // Fetch chart of accounts for balances
  const { data: accountsData, isLoading: loadingAccounts } = useQuery({
    queryKey: ['accounting-dashboard', 'accounts'],
    queryFn: async () => {
      const res = await accountingApi.getChartOfAccounts();
      return res?.data || res;
    },
  });

  // Fetch P&L for summary
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;

  const { data: pnlData, isLoading: loadingPnl } = useQuery({
    queryKey: ['accounting-dashboard', 'pnl'],
    queryFn: async () => {
      const res = await accountingApi.getPnl({
        fromDate: `${fyStart}-04-01`,
        toDate: `${fyStart + 1}-03-31`,
      });
      return res?.data || res;
    },
  });

  // Fetch recent ledger entries
  const { data: recentLedger, isLoading: loadingLedger } = useQuery({
    queryKey: ['accounting-dashboard', 'recent-ledger'],
    queryFn: async () => {
      const res = await accountingApi.getLedgerEntries({ page: 1, limit: 5 });
      return res?.data || res;
    },
  });

  const isLoading = loadingAccounts || loadingPnl;

  // Extract summary values from accounts
  const summaryCards = useMemo(() => {
    const accounts = Array.isArray(accountsData) ? accountsData : [];
    const pnl = pnlData || {};

    // Try to find specific accounts by name
    const findAccount = (name) => accounts.find((a) =>
      (a.accountName || a.account_name || '').toLowerCase().includes(name.toLowerCase())
    );

    const receivable = findAccount('receivable');
    const payable = findAccount('payable');
    const gstPayable = findAccount('gst payable');
    const cash = findAccount('cash');

    // Get totals from P&L
    const totalIncome = Number(pnl.totalSales || pnl.totalIncome || pnl.income) || 0;
    const totalExpense = Number(pnl.totalPurchases || pnl.totalExpense || pnl.expense) || 0;
    const grossProfit = Number(pnl.grossProfit || pnl.profitLoss || pnl.profit) || (totalIncome - totalExpense);
    const gstLiability = Number(pnl.gstLiability || pnl.gstPayable) || 0;

    return [
      {
        label: 'Total Receivables',
        value: receivable?.balance || totalIncome,
        icon: ReceiptLongIcon,
        color: '#1565c0',
        bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        border: '#90caf9',
      },
      {
        label: 'Total Payables',
        value: payable?.balance || totalExpense,
        icon: PaymentsIcon,
        color: '#e65100',
        bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
        border: '#ffcc80',
      },
      {
        label: 'GST Payable',
        value: gstPayable?.balance || gstLiability,
        icon: GavelIcon,
        color: '#c62828',
        bg: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
        border: '#ef9a9a',
      },
      {
        label: 'Gross Profit',
        value: grossProfit,
        icon: TrendingUpIcon,
        color: grossProfit >= 0 ? '#2e7d32' : '#c62828',
        bg: grossProfit >= 0
          ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
          : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
        border: grossProfit >= 0 ? '#a5d6a7' : '#ef9a9a',
      },
    ];
  }, [accountsData, pnlData]);

  // Recent entries
  const recentEntries = useMemo(() => {
    if (!recentLedger) return [];
    if (Array.isArray(recentLedger)) return recentLedger.slice(0, 5);
    if (recentLedger.entries) return recentLedger.entries.slice(0, 5);
    if (recentLedger.data) return recentLedger.data.slice(0, 5);
    return [];
  }, [recentLedger]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Summary Cards ──────────────────────────────── */}
      <Grid container spacing={2.5}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <Paper
                sx={{
                  p: 3, borderRadius: 3,
                  background: card.bg,
                  border: `1px solid ${card.border}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column', gap: 1,
                  position: 'relative', overflow: 'hidden',
                  minHeight: 130,
                }}
              >
                {/* Decorative circle */}
                <Box sx={{
                  position: 'absolute', top: -20, right: -20,
                  width: 80, height: 80, borderRadius: '50%',
                  backgroundColor: `${card.color}10`,
                }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: `${card.color}18`,
                  }}>
                    <Icon sx={{ color: card.color, fontSize: 22 }} />
                  </Box>
                  <Typography variant="caption" sx={{
                    color: card.color, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: 0.5,
                    fontSize: '0.7rem',
                  }}>
                    {card.label}
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{
                  fontWeight: 700, color: card.color,
                  mt: 'auto', position: 'relative',
                }}>
                  {isLoading ? (
                    <CircularProgress size={20} sx={{ color: card.color }} />
                  ) : (
                    formatINR(card.value)
                  )}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Recent Ledger Activity ─────────────────────── */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid var(--color-grey-100)',
        }}
      >
        <Box
          sx={{
            px: 3, py: 2.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
            borderBottom: '1px solid var(--color-grey-100)',
            backgroundColor: 'var(--color-grey-50)',
          }}
        >
          <AccountBalanceIcon sx={{ color: 'var(--color-secondary-main)', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-grey-800)', fontSize: '1rem' }}>
            Recent Ledger Activity
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {loadingLedger ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress color="secondary" size={28} />
            </Box>
          ) : recentEntries.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recentEntries.map((entry, idx) => {
                const debit = Number(entry.debitAmount || entry.debit_amount) || 0;
                const credit = Number(entry.creditAmount || entry.credit_amount) || 0;
                const refType = entry.referenceType || entry.reference_type || '';

                return (
                  <React.Fragment key={entry.id || idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--color-grey-800)' }}>
                          {entry.accountName || entry.account?.accountName || entry.account?.account_name || 'Account'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-grey-500)' }}>
                          {refType.replace(/_/g, ' ')} · {
                            (entry.createdAt || entry.created_at)
                              ? new Date(entry.createdAt || entry.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                              : ''
                          }
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {debit > 0 && (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#c62828' }}>
                            DR {formatINR(debit)}
                          </Typography>
                        )}
                        {credit > 0 && (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                            CR {formatINR(credit)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {idx < recentEntries.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontStyle: 'italic' }}>
                No recent ledger activity
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AccountsDashboard;
