import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

// ── File helper ────────────────────────────────────────────────
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * DocUploadField — single document upload + preview widget.
 * docState: null | string (existing URL) | { name, type, dataUrl } (new local file)
 */
const DocUploadField = ({ label, docState, onChange, readOnly }) => {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToBase64(file);
      onChange({ name: file.name, type: file.type, size: file.size, dataUrl });
    } catch {
      // ignore
    }
    e.target.value = '';
  };

  const src =
    docState && typeof docState === 'object'
      ? docState.dataUrl
      : typeof docState === 'string'
      ? docState
      : null;
  const name =
    docState && typeof docState === 'object'
      ? docState.name
      : typeof docState === 'string'
      ? 'Document'
      : null;
  const mime = docState && typeof docState === 'object' ? docState.type || '' : '';
  const isImage = mime.startsWith('image/') || (src || '').startsWith('data:image/');
  const isPdf = mime.includes('pdf') || (name || '').toLowerCase().endsWith('.pdf');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'var(--color-grey-600)', letterSpacing: 0.3 }}
        >
          {label}
        </Typography>

        {!readOnly && (
          <>
            <input
              type="file"
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              ref={inputRef}
              onChange={handleFile}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<CloudUploadIcon />}
              onClick={() => inputRef.current?.click()}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: 'var(--color-grey-300)',
                color: 'var(--color-grey-600)',
                '&:hover': {
                  borderColor: 'var(--color-secondary-main)',
                  color: 'var(--color-secondary-main)',
                },
              }}
            >
              {docState ? 'Replace' : 'Upload'}
            </Button>
            <Typography variant="caption" sx={{ color: 'var(--color-grey-400)' }}>
              Image or PDF
            </Typography>
          </>
        )}
      </Box>

      {/* Preview */}
      {docState && (
        <Box
          sx={{
            position: 'relative',
            border: '1px solid var(--color-grey-200)',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            maxWidth: isImage ? 110 : 280,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}
        >
          {isImage && src ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                component="img"
                src={src}
                alt={name}
                sx={{ width: 100, height: 80, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                onClick={() => window.open(src, '_blank')}
              />
              <Box sx={{ px: 0.75, py: 0.5, backgroundColor: 'var(--color-grey-50)' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'var(--color-grey-500)',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 92,
                  }}
                >
                  {name}
                </Typography>
              </Box>
            </Box>
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
              onClick={() => src && window.open(src, '_blank')}
            >
              {isPdf ? (
                <PictureAsPdfIcon sx={{ color: '#e53935', fontSize: 22, flexShrink: 0 }} />
              ) : (
                <InsertDriveFileIcon sx={{ color: 'var(--color-grey-400)', fontSize: 22, flexShrink: 0 }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: 'var(--color-grey-700)',
                  maxWidth: 130,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.78rem',
                }}
              >
                {name}
              </Typography>
              {src && (
                <OpenInNewIcon sx={{ fontSize: 13, color: 'var(--color-grey-400)', ml: 'auto', flexShrink: 0 }} />
              )}
            </Box>
          )}

          {!readOnly && (
            <Tooltip title="Remove">
              <IconButton
                size="small"
                onClick={() => onChange(null)}
                sx={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                  width: 20,
                  height: 20,
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

DocUploadField.propTypes = {
  label: PropTypes.string.isRequired,
  docState: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ name: PropTypes.string, type: PropTypes.string, dataUrl: PropTypes.string }),
  ]),
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default DocUploadField;
