import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useQuery } from '@tanstack/react-query';
import { accountingApi } from '../../services/api';

// ── Account type color map ──────────────────────────────────────
const TYPE_COLORS = {
  ASSET:     { bg: '#e3f2fd', color: '#1565c0' },
  LIABILITY: { bg: '#fce4ec', color: '#c62828' },
  INCOME:    { bg: '#e8f5e9', color: '#2e7d32' },
  EXPENSE:   { bg: '#fff3e0', color: '#e65100' },
};

// ==============================|| CHART OF ACCOUNTS ||============================== //

const ChartOfAccounts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['chart-of-accounts'],
    queryFn: async () => {
      const res = await accountingApi.getChartOfAccounts();
      return res?.data || res;
    },
  });

  const accounts = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Group accounts by type
  const grouped = useMemo(() => {
    const map = { ASSET: [], LIABILITY: [], INCOME: [], EXPENSE: [] };
    accounts.forEach((acc) => {
      const type = acc.accountType || acc.account_type;
      if (map[type]) map[type].push(acc);
      else map[type] = [acc];
    });
    return map;
  }, [accounts]);

  const typeCounts = useMemo(() => {
    return Object.entries(grouped).map(([type, list]) => ({
      type,
      count: list.length,
      ...TYPE_COLORS[type],
    }));
  }, [grouped]);

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
        <AccountBalanceWalletIcon sx={{ color: 'var(--color-secondary-main)', fontSize: 22 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-grey-800)', fontSize: '1rem' }}>
          Chart of Accounts
        </Typography>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* ── Summary Cards ─────────────────────────────── */}
        <Grid container spacing={2}>
          {typeCounts.map((item) => (
            <Grid item xs={6} sm={3} key={item.type}>
              <Box
                sx={{
                  p: 2, borderRadius: 2,
                  backgroundColor: item.bg,
                  border: `1px solid ${item.color}22`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: item.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {item.type}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: item.color, mt: 0.5 }}>
                  {item.count}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ── Accounts Table ────────────────────────────── */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="secondary" size={36} />
          </Box>
        ) : accounts.length > 0 ? (
          <Box sx={{ overflowX: 'auto', borderRadius: 2, border: '1px solid var(--color-grey-200)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'var(--color-grey-50)' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Account Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="center">System Generated</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((acc) => {
                  const type = acc.accountType || acc.account_type || '';
                  const colors = TYPE_COLORS[type] || { bg: '#f5f5f5', color: '#616161' };
                  return (
                    <TableRow key={acc.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {acc.accountName || acc.account_name || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={type}
                          size="small"
                          sx={{
                            fontSize: '0.7rem', fontWeight: 600,
                            backgroundColor: colors.bg,
                            color: colors.color,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={(acc.systemGenerated || acc.system_generated) ? 'Yes' : 'No'}
                          size="small"
                          sx={{
                            fontSize: '0.7rem', fontWeight: 600,
                            backgroundColor: (acc.systemGenerated || acc.system_generated) ? '#e8f5e9' : '#fff3e0',
                            color: (acc.systemGenerated || acc.system_generated) ? '#2e7d32' : '#e65100',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: 'var(--color-grey-600)' }}>
                        {acc.createdAt || acc.created_at
                          ? new Date(acc.createdAt || acc.created_at).toLocaleDateString('en-IN')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontStyle: 'italic' }}>
              No accounts found. Accounts are auto-created when the organization is set up.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ChartOfAccounts;
