import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { accountingApi } from '../../services/api';
import NormalModal from '../../ui/NormalModal';
import inputSx from '../../services/inputStyles';
import { formatINR } from '../../services/taxEngine';

// ── Payment mode colors ────────────────────────────────────────
const MODE_COLORS = {
  CASH:           { bg: '#e8f5e9', color: '#2e7d32' },
  BANK_TRANSFER:  { bg: '#e3f2fd', color: '#1565c0' },
  UPI:            { bg: '#ede7f6', color: '#6a1b9a' },
  CHEQUE:         { bg: '#fff3e0', color: '#e65100' },
};

// ==============================|| RECORD PAYMENT MODAL ||============================== //

const RecordPaymentModal = ({ open, onClose, invoiceType, invoiceId, outstanding }) => {
  const queryClient = useQueryClient();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState('CASH');

  const mutation = useMutation({
    mutationFn: (payload) => accountingApi.recordPayment(payload),
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['invoice-payments'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
      queryClient.invalidateQueries({ queryKey: ['pnl-report'] });
      queryClient.invalidateQueries({ queryKey: ['accounting-dashboard'] });
      resetForm();
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to record payment');
    },
  });

  const resetForm = () => {
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMode('CASH');
  };

  const handleSubmit = () => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    if (outstanding != null && amount > outstanding) {
      toast.error(`Payment cannot exceed outstanding amount of ${formatINR(outstanding)}`);
      return;
    }
    mutation.mutate({
      invoiceType,
      invoiceId,
      paymentAmount: amount,
      paymentDate,
      paymentMode,
    });
  };

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title="Record Payment"
      maxWidth="sm"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => { resetForm(); onClose(); }}
            sx={{ textTransform: 'none', borderColor: 'var(--color-grey-300)', color: 'var(--color-grey-600)' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={mutation.isPending || !paymentAmount}
            startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PaymentIcon />}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
            }}
          >
            {mutation.isPending ? 'Recording...' : 'Record Payment'}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
        {outstanding != null && (
          <Box
            sx={{
              p: 2, borderRadius: 2,
              backgroundColor: '#fff3e0',
              border: '1px solid #ffe0b2',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 600 }}>
              Outstanding Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#bf360c' }}>
              {formatINR(outstanding)}
            </Typography>
          </Box>
        )}

        <TextField
          label="Payment Amount (₹)"
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          fullWidth
          sx={inputSx}
          inputProps={{
            min: 0,
            max: outstanding || undefined,
            step: '0.01',
          }}
          helperText={outstanding != null ? `Max: ${formatINR(outstanding)}` : ''}
        />

        <TextField
          label="Payment Date"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          fullWidth
          sx={inputSx}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          select
          label="Payment Mode"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          fullWidth
          sx={inputSx}
        >
          <MenuItem value="CASH">Cash</MenuItem>
          <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
          <MenuItem value="UPI">UPI</MenuItem>
          <MenuItem value="CHEQUE">Cheque</MenuItem>
        </TextField>
      </Box>
    </NormalModal>
  );
};

// ==============================|| INVOICE PAYMENTS PANEL ||============================== //

const InvoicePayments = ({ invoiceType, invoiceId, totalAmount }) => {
  const [showModal, setShowModal] = useState(false);

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['invoice-payments', invoiceType, invoiceId],
    queryFn: async () => {
      const res = await accountingApi.getPayments(invoiceType, invoiceId);
      return res?.data || res;
    },
    enabled: !!invoiceType && !!invoiceId,
  });

  const payments = useMemo(() => {
    if (!paymentsData) return [];
    return Array.isArray(paymentsData) ? paymentsData : [];
  }, [paymentsData]);

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) =>
      sum + (Number(p.paymentAmount || p.payment_amount) || 0), 0
    );
  }, [payments]);

  const outstanding = useMemo(() => {
    const total = Number(totalAmount) || 0;
    return Math.max(0, total - totalPaid);
  }, [totalAmount, totalPaid]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ── Summary Row ─────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ px: 2, py: 1, borderRadius: 2, backgroundColor: '#e3f2fd', border: '1px solid #bbdefb' }}>
            <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 600 }}>Total</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0d47a1' }}>{formatINR(totalAmount)}</Typography>
          </Box>
          <Box sx={{ px: 2, py: 1, borderRadius: 2, backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
            <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>Paid</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1b5e20' }}>{formatINR(totalPaid)}</Typography>
          </Box>
          <Box sx={{ px: 2, py: 1, borderRadius: 2, backgroundColor: outstanding > 0 ? '#fff3e0' : '#e8f5e9', border: `1px solid ${outstanding > 0 ? '#ffe0b2' : '#c8e6c9'}` }}>
            <Typography variant="caption" sx={{ color: outstanding > 0 ? '#e65100' : '#2e7d32', fontWeight: 600 }}>Outstanding</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: outstanding > 0 ? '#bf360c' : '#1b5e20' }}>{formatINR(outstanding)}</Typography>
          </Box>
        </Box>
        {outstanding > 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowModal(true)}
            size="small"
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-secondary-main)',
              '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
            }}
          >
            Record Payment
          </Button>
        )}
      </Box>

      <Divider />

      {/* ── Payments Table ──────────────────────────────── */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress color="secondary" size={28} />
        </Box>
      ) : payments.length > 0 ? (
        <Box sx={{ overflowX: 'auto', borderRadius: 2, border: '1px solid var(--color-grey-200)' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'var(--color-grey-50)' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }} align="right">Amount (₹)</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Mode</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p, idx) => {
                const mode = p.paymentMode || p.payment_mode || '';
                const modeColors = MODE_COLORS[mode] || { bg: '#f5f5f5', color: '#616161' };
                return (
                  <TableRow key={p.id || idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: '0.8rem', color: 'var(--color-grey-500)' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {(p.paymentDate || p.payment_date || p.createdAt || p.created_at)
                        ? new Date(p.paymentDate || p.payment_date || p.createdAt || p.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })
                        : '—'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#2e7d32' }}>
                      {formatINR(p.paymentAmount || p.payment_amount)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={mode.replace(/_/g, ' ')}
                        size="small"
                        sx={{
                          fontSize: '0.68rem', fontWeight: 600,
                          backgroundColor: modeColors.bg,
                          color: modeColors.color,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontStyle: 'italic' }}>
            No payments recorded yet
          </Typography>
        </Box>
      )}

      {/* ── Payment Modal ───────────────────────────────── */}
      <RecordPaymentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        invoiceType={invoiceType}
        invoiceId={invoiceId}
        outstanding={outstanding}
      />
    </Box>
  );
};

export { RecordPaymentModal };
export default InvoicePayments;
