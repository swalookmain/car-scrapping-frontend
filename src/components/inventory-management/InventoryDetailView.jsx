import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Divider } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MovieIcon from '@mui/icons-material/Movie';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DocumentPreview from '../../ui/DocumentPreview';

// ── Color maps (duplicated here so InventoryTable doesn't need to import them) ─
const statusColor = {
  AVAILABLE: { bg: '#e8f5e9', color: '#2e7d32', label: 'Available' },
  PARTIAL_SOLD: { bg: '#fff3e0', color: '#e65100', label: 'Partial Sold' },
  SOLD_OUT: { bg: '#ffebee', color: '#c62828', label: 'Sold Out' },
  DAMAGE_ONLY: { bg: '#fce4ec', color: '#ad1457', label: 'Damaged' },
};

const conditionColor = {
  GOOD: { bg: '#e8f5e9', color: '#2e7d32', label: 'Good' },
  DAMAGED: { bg: '#ffebee', color: '#c62828', label: 'Damaged' },
};

const categoryColor = {
  ENGINE: { bg: '#e3f2fd', color: '#1565c0' },
  TRANSMISSION: { bg: '#f3e5f5', color: '#6a1b9a' },
  BODY: { bg: '#fff3e0', color: '#e65100' },
  METAL: { bg: '#e0f2f1', color: '#00695c' },
  PLASTIC: { bg: '#fce4ec', color: '#ad1457' },
  ELECTRICAL: { bg: '#fff9c4', color: '#f57f17' },
  OTHER: { bg: '#f5f5f5', color: '#616161' },
};

const calcAvailable = (item) => {
  const opening = Number(item.openingStock) || 0;
  const received = Number(item.quantityReceived) || 0;
  const issued = Number(item.quantityIssued) || 0;
  return opening + received - issued;
};

const SectionLabel = ({ children }) => (
  <Typography
    variant="subtitle2"
    sx={{ fontWeight: 600, color: 'var(--color-grey-700)', textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

const FieldLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
  >
    {children}
  </Typography>
);

/**
 * Renders the detail content for a single inventory item.
 * Used inside NormalModal in InventoryTable.
 */
const InventoryDetailView = ({ item }) => {
  if (!item) return null;

  const avail = calcAvailable(item);
  const st = statusColor[item.status] || statusColor.AVAILABLE;
  const cond = conditionColor[item.condition] || conditionColor.GOOD;
  const cc = categoryColor[item.partType] || categoryColor.OTHER;

  const infoRows = [
    { label: 'Item Code', value: item.itemCode || (item._id || item.id || '—')?.toString()?.slice(-8)?.toUpperCase() },
    { label: 'Part Name', value: item.partName || '—' },
    { label: 'Category', value: item.partType || '—', chip: true, chipBg: cc.bg, chipColor: cc.color },
    { label: 'Condition', value: cond.label, chip: true, chipBg: cond.bg, chipColor: cond.color },
    { label: 'Status', value: st.label, chip: true, chipBg: st.bg, chipColor: st.color },
    {
      label: 'Unit Price',
      value: item.unitPrice != null ? `₹${Number(item.unitPrice).toLocaleString('en-IN')}` : '—',
    },
  ];

  const quantityRows = [
    { label: 'Opening Stock', value: item.openingStock ?? 0 },
    { label: 'Quantity Received', value: item.quantityReceived ?? 0, color: '#2e7d32' },
    { label: 'Quantity Issued', value: item.quantityIssued ?? 0, color: '#c62828' },
    {
      label: 'Remaining Qty',
      value: avail,
      color: avail > 0 ? '#2e7d32' : '#c62828',
      bold: true,
    },
  ];

  const sourceRows = [
    {
      label: 'Vehicle',
      value: (() => {
        const veh = item.vehicle || item.vehicleData || null;
        const regNo = veh?.registration_number || veh?.registrationNumber || item.registrationNumber || '';
        const make = veh?.make || '';
        const model = veh?.model_name || veh?.model || '';
        return regNo || (make || model ? `${make} ${model}`.trim() : '') || (item.vechileId || item.vehicleId || '\u2014')?.toString()?.slice(-8)?.toUpperCase();
      })(),
    },
    {
      label: 'Invoice No.',
      value: (() => {
        const inv = item.invoice || item.invoiceData || null;
        return inv?.invoiceNumber || item.invoiceNumber || (item.invoiceId || '\u2014')?.toString()?.slice(-8)?.toUpperCase();
      })(),
    },
  ];

  const [preview, setPreview] = useState({ open: false, src: null, name: null, mime: null });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Part Information */}
      <SectionLabel>Part Information</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {infoRows.map(({ label, value, chip, chipBg, chipColor }) => (
          <Box key={label}>
            <FieldLabel>{label}</FieldLabel>
            {chip ? (
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={value}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: chipBg, color: chipColor }}
                />
              </Box>
            ) : (
              <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.5 }}>
                {value}
              </Typography>
            )}
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Quantity Breakdown */}
      <SectionLabel>Quantity Breakdown</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {quantityRows.map(({ label, value, color, bold }) => (
          <Box key={label}>
            <FieldLabel>{label}</FieldLabel>
            <Typography
              variant="body1"
              sx={{ color: color || 'var(--color-grey-900)', mt: 0.5, fontWeight: bold ? 700 : 400 }}
            >
              {value}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Source Information */}
      <SectionLabel>Source Information</SectionLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {sourceRows.map(({ label, value }) => (
          <Box key={label}>
            <FieldLabel>{label}</FieldLabel>
            <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.5, fontFamily: 'monospace' }}>
              {value}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>

      {/* Documents */}
      {item.documents && item.documents.length > 0 && (
        <>
          <SectionLabel>Documents</SectionLabel>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {item.documents.map((doc, idx) => {
              const name = typeof doc === 'string' ? doc : doc.name || `Document ${idx + 1}`;
              const mime = typeof doc === 'string' ? '' : doc.type || '';
              const src = typeof doc === 'string' ? null : doc.data || doc.url || doc.dataUrl || null;
              const isImage = mime.startsWith('image/') || (src || '').startsWith('data:image/');
              const isPdf = mime.includes('pdf') || name.toLowerCase().endsWith('.pdf');
              const isVideo =
                mime.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/.test(name.toLowerCase());

              return (
                <Box
                  key={idx}
                  sx={{
                    position: 'relative',
                    border: '1px solid var(--color-grey-200)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    width: isImage ? 80 : 'auto',
                    minWidth: isImage ? 80 : 120,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  }}
                >
                  {isImage && src ? (
                    <>
                      <Box
                        component="img"
                        src={src}
                        alt={name}
                        sx={{ width: 80, height: 72, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                        onClick={() => setPreview({ open: true, src, name, mime })}
                      />
                      <Box sx={{ px: 0.75, py: 0.5, backgroundColor: 'var(--color-grey-50)' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.7rem',
                            color: 'var(--color-grey-500)',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 80,
                          }}
                        >
                          {name}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1.25,
                        cursor: src ? 'pointer' : 'default',
                      }}
                      onClick={() => src && setPreview({ open: true, src, name, mime })}
                    >
                      {isPdf ? (
                        <PictureAsPdfIcon sx={{ color: '#e53935', fontSize: 18, flexShrink: 0 }} />
                      ) : isVideo ? (
                        <MovieIcon sx={{ color: '#7b1fa2', fontSize: 18, flexShrink: 0 }} />
                      ) : (
                        <InsertDriveFileIcon sx={{ color: 'var(--color-grey-400)', fontSize: 18, flexShrink: 0 }} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'var(--color-grey-700)',
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.78rem',
                        }}
                      >
                        {name}
                      </Typography>
                      {src && (
                        <OpenInNewIcon sx={{ fontSize: 12, color: 'var(--color-grey-400)', ml: 'auto', flexShrink: 0 }} />
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </>
      )}
      {/* Document preview modal */}
      <DocumentPreview
        open={preview.open}
        onClose={() => setPreview({ open: false, src: null, name: null, mime: null })}
        src={preview.src}
        name={preview.name}
        mime={preview.mime}
      />
    </Box>
  );
};

InventoryDetailView.propTypes = {
  item: PropTypes.object,
};

export default InventoryDetailView;
