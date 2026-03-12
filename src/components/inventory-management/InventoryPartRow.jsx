import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MovieIcon from '@mui/icons-material/Movie';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DocumentPreview from '../../ui/DocumentPreview';
import inputSx from '../../services/inputStyles';

const PART_TYPES = ['ENGINE', 'TRANSMISSION', 'BODY', 'METAL', 'PLASTIC', 'ELECTRICAL', 'OTHER'];
const CONDITIONS = ['GOOD', 'DAMAGED'];
const STATUSES = ['AVAILABLE', 'PARTIAL_SOLD', 'SOLD_OUT', 'DAMAGE_ONLY'];

const InventoryPartRow = ({
  part,
  index,
  errors,
  readOnly,
  showRemove,
  onPartChange,
  onRemovePart,
  onFileSelect,
  onRemoveDocument,
  onClickFileInput,
  fileInputRefCallback,
}) => {
  const [preview, setPreview] = useState({ open: false, src: null, name: null, mime: null });

  return (
    <Box
    sx={{
      border: '1px solid var(--color-grey-200)',
      borderRadius: '8px',
      p: 2,
      position: 'relative',
      backgroundColor: 'var(--color-grey-50)',
    }}
  >
    {/* Part header & remove button */}
    {showRemove && !readOnly && (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--color-grey-500)' }}>
          Part #{index + 1}
        </Typography>
        <Tooltip title="Remove Part">
          <IconButton size="small" onClick={() => onRemovePart(index)} sx={{ color: '#e53935' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )}

    <Grid container spacing={2}>
      {/* Part Name */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Part Name"
          value={part.partName}
          onChange={(e) => onPartChange(index, 'partName', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
          error={Boolean(errors[`part_${index}_partName`])}
          helperText={errors[`part_${index}_partName`]}
        />
      </Grid>

      {/* Category / Part Type */}
      <Grid item xs={12} sm={6}>
        <TextField
          select
          label="Category"
          value={part.partType}
          onChange={(e) => onPartChange(index, 'partType', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
        >
          {PART_TYPES.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Condition */}
      <Grid item xs={12} sm={4}>
        <TextField
          select
          label="Condition"
          value={part.condition}
          onChange={(e) => onPartChange(index, 'condition', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
        >
          {CONDITIONS.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Opening Stock */}
      <Grid item xs={12} sm={4}>
        <TextField
          label="Opening Stock"
          type="number"
          value={part.openingStock}
          onChange={(e) => onPartChange(index, 'openingStock', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
          inputProps={{ min: 0 }}
        />
      </Grid>

      {/* Unit Price */}
      <Grid item xs={12} sm={4}>
        <TextField
          label="Unit Price (₹)"
          type="number"
          value={part.unitPrice}
          onChange={(e) => onPartChange(index, 'unitPrice', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
          error={Boolean(errors[`part_${index}_unitPrice`])}
          helperText={errors[`part_${index}_unitPrice`]}
          inputProps={{ min: 0 }}
        />
      </Grid>

      {/* Qty Received */}
      <Grid item xs={12} sm={4}>
        <TextField
          label="Qty Received"
          type="number"
          value={part.quantityReceived}
          onChange={(e) => onPartChange(index, 'quantityReceived', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
          inputProps={{ min: 0 }}
        />
      </Grid>

      {/* Qty Issued */}
      <Grid item xs={12} sm={4}>
        <TextField
          label="Qty Issued"
          type="number"
          value={part.quantityIssued}
          onChange={(e) => onPartChange(index, 'quantityIssued', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
          inputProps={{ min: 0 }}
        />
      </Grid>

      {/* Status */}
      <Grid item xs={12} sm={4}>
        <TextField
          select
          label="Status"
          value={part.status}
          onChange={(e) => onPartChange(index, 'status', e.target.value)}
          fullWidth
          disabled={readOnly}
          sx={inputSx}
        >
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Documents upload */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--color-grey-600)', letterSpacing: 0.3 }}>
              Documents
            </Typography>
            {!readOnly && (
              <>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,video/*"
                  style={{ display: 'none' }}
                  ref={fileInputRefCallback}
                  onChange={(e) => onFileSelect(index, e)}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadIcon />}
                  onClick={onClickFileInput}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    borderColor: 'var(--color-grey-300)',
                    color: 'var(--color-grey-600)',
                    '&:hover': { borderColor: 'var(--color-secondary-main)', color: 'var(--color-secondary-main)' },
                  }}
                >
                  Upload
                </Button>
                <Typography variant="caption" sx={{ color: 'var(--color-grey-400)' }}>
                  Images, PDF, Video supported
                </Typography>
              </>
            )}
          </Box>

          {/* Preview grid */}
          {(part.documents || []).length > 0 && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {(part.documents || []).map((doc, dIdx) => {
                const name = typeof doc === 'string' ? doc : doc.name || `File ${dIdx + 1}`;
                const mime = typeof doc === 'string' ? '' : (doc.type || '');
                const src  = typeof doc === 'string' ? null : (doc.dataUrl || doc.url || null);
                const isImage = mime.startsWith('image/') || (src || '').startsWith('data:image/');
                const isPdf   = mime.includes('pdf') || name.toLowerCase().endsWith('.pdf');
                const isVideo = mime.startsWith('video/') || name.toLowerCase().match(/\.(mp4|mov|avi|mkv|webm)$/);

                return (
                  <Box
                    key={dIdx}
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
                          sx={{ width: 80, height: 64, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                          onClick={() => setPreview({ open: true, src, name, mime })}
                        />
                        <Box sx={{ px: 0.75, py: 0.5, backgroundColor: 'var(--color-grey-50)' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.7rem', color: 'var(--color-grey-500)', display: 'block',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 76,
                            }}
                          >
                            {name}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1.25, cursor: src ? 'pointer' : 'default' }}
                        onClick={() => src && setPreview({ open: true, src, name, mime })}
                      >
                        {isPdf
                          ? <PictureAsPdfIcon sx={{ color: '#e53935', fontSize: 18, flexShrink: 0 }} />
                          : isVideo
                              ? <MovieIcon sx={{ color: '#7b1fa2', fontSize: 18, flexShrink: 0 }} />
                              : <InsertDriveFileIcon sx={{ color: 'var(--color-grey-400)', fontSize: 18, flexShrink: 0 }} />}
                        <Typography variant="caption" sx={{ color: 'var(--color-grey-700)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                          {name}
                        </Typography>
                          {src && <OpenInNewIcon sx={{ fontSize: 12, color: 'var(--color-grey-400)', ml: 'auto', flexShrink: 0 }} />}
                      </Box>
                    )}

                    {/* Delete button */}
                    {!readOnly && (
                      <IconButton
                        size="small"
                        onClick={() => onRemoveDocument(index, dIdx)}
                        sx={{
                          position: 'absolute', top: 3, right: 3,
                          backgroundColor: 'rgba(0,0,0,0.45)',
                          color: '#fff',
                          width: 18, height: 18,
                          '& svg': { fontSize: 12 },
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.72)' },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
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

InventoryPartRow.propTypes = {
  part:                PropTypes.object.isRequired,
  index:               PropTypes.number.isRequired,
  errors:              PropTypes.object.isRequired,
  readOnly:            PropTypes.bool,
  showRemove:          PropTypes.bool,
  onPartChange:        PropTypes.func.isRequired,
  onRemovePart:        PropTypes.func.isRequired,
  onFileSelect:        PropTypes.func.isRequired,
  onRemoveDocument:    PropTypes.func.isRequired,
  onClickFileInput:    PropTypes.func.isRequired,
  fileInputRefCallback: PropTypes.any,
};

export default InventoryPartRow;
