import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Divider, Button, Grid } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DocumentPreview from '../../ui/DocumentPreview';
import NormalModal from '../../ui/NormalModal';

const rtoStatusColor = {
  NOT_APPLIED: { bg: '#f5f5f5', color: '#616161', label: 'Not Applied' },
  APPLIED: { bg: '#fff3e0', color: '#e65100', label: 'Applied' },
  APPROVED: { bg: '#e8f5e9', color: '#2e7d32', label: 'Approved' },
  REJECTED: { bg: '#ffebee', color: '#c62828', label: 'Rejected' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB');
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
};

/**
 * Modal that shows full COD compliance details for a single record.
 */
const ComplianceDetailView = ({ open, onClose, item }) => {
  if (!item) return null;

  const r = item;
  const st = rtoStatusColor[r.rtoStatus] || rtoStatusColor.NOT_APPLIED;

  const rows = [
    { label: 'Vehicle', value: (() => {
      const veh = r.vehicle || r.vehicleData || null;
      const regNo = veh?.registration_number || veh?.registrationNumber || r.registrationNumber || '';
      const make = veh?.make || '';
      const model = veh?.model_name || veh?.model || '';
      return regNo || (make || model ? `${make} ${model}`.trim() : '') || (r.vehicleId ? `${r.vehicleId.slice(0, 8)}...` : '—');
    })() },
    { label: 'Invoice No.', value: (() => {
      const inv = r.invoice || r.invoiceData || null;
      return inv?.invoiceNumber || r.invoiceNumber || (r.invoiceId ? `${r.invoiceId.slice(0, 8)}...` : '—');
    })() },
    { label: 'COD Generated', value: r.codGenerated ? 'Yes' : 'No' },
    { label: 'COD Inward No.', value: r.codInwardNumber || '—' },
    { label: 'COD Issue Date', value: formatDate(r.codIssueDate) },
    { label: 'COD Generated At', value: formatDateTime(r.codGeneratedAt) },
    { label: 'CVS Generated', value: r.cvsGenerated ? 'Yes' : 'No' },
    { label: 'CVS Generated At', value: formatDateTime(r.cvsGeneratedAt) },
    { label: 'RTO Office', value: r.rtoOffice || '—' },
    { label: 'Remarks', value: r.remarks || '—' },
  ];

  const [preview, setPreview] = useState({ open: false, src: null, name: null, mime: null });

  return (
    <NormalModal
      open={open}
      onClose={onClose}
      title="COD Compliance Details"
      maxWidth="lg"
      actions={
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: 'var(--color-secondary-main)',
            '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
          }}
        >
          Close
        </Button>
      }
    >
      {/* Status chip at top */}
      <Box sx={{ mb: 2 }}>
        <Chip
          label={st.label}
          sx={{ fontWeight: 700, backgroundColor: st.bg, color: st.color }}
        />
      </Box>

      {/* Detail grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {rows.map(({ label, value }) => (
          <Box key={label}>
            <Typography
              variant="caption"
              sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {label}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.5 }}>
              {value}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Document links */}
      {(r.codDocumentUrl || r.cvsDocumentUrl) && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-grey-700)', mb: 1 }}>
            Documents
          </Typography>
          <Grid container spacing={2}>
            {r.codDocumentUrl && (
              <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => setPreview({ open: true, src: r.codDocumentUrl, name: 'COD Document', mime: '' })}
                    sx={{
                      borderColor: 'var(--color-secondary-main)',
                      color: 'var(--color-secondary-main)',
                      '&:hover': { borderColor: 'var(--color-secondary-dark)' },
                    }}
                  >
                    View COD Document
                  </Button>
                </Grid>
            )}
            {r.cvsDocumentUrl && (
              <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => setPreview({ open: true, src: r.cvsDocumentUrl, name: 'CVS Document', mime: '' })}
                    sx={{
                      borderColor: 'var(--color-secondary-main)',
                      color: 'var(--color-secondary-main)',
                      '&:hover': { borderColor: 'var(--color-secondary-dark)' },
                    }}
                  >
                    View CVS Document
                  </Button>
                </Grid>
            )}
          </Grid>
        </Box>
      )}
        <DocumentPreview
          open={preview.open}
          onClose={() => setPreview({ open: false, src: null, name: null, mime: null })}
          src={preview.src}
          name={preview.name}
          mime={preview.mime}
        />
    </NormalModal>
  );
};

ComplianceDetailView.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
};

export default ComplianceDetailView;
