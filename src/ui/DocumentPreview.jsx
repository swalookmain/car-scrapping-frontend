import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
// PDF rendered via native browser iframe — no third-party PDF library needed.

const DocumentPreview = ({ open, onClose, src, name, mime }) => {
  const isImage =
    mime?.startsWith('image/') ||
    (src || '').startsWith('data:image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name || '');

  const isPdf =
    mime?.includes('pdf') ||
    (name || '').toLowerCase().endsWith('.pdf');

  const isVideo =
    mime?.startsWith('video/') ||
    /\.(mp4|mov|webm|avi|mkv)$/i.test(name || '');

  const handleOpenNew = () => {
    if (!src) return;
    window.open(src, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = name || 'document';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(18,25,38,0.5)',
          backdropFilter: 'blur(4px)',
        },
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.08)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          pr: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '70%',
          }}
        >
          {name || 'Document'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {src && (
            <IconButton aria-label="Open in new tab" onClick={handleOpenNew} size="small">
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          )}
          {src && (
            <IconButton aria-label="Download" onClick={handleDownload} size="small">
              <DownloadIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton aria-label="Close" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          minHeight: 320,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          pb: 2,
        }}
      >
        {isImage && src && (
          <Box
            component="img"
            src={src}
            alt={name}
            sx={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }}
          />
        )}

        {isPdf && src && (
          <Box sx={{ width: '100%', height: '75vh' }}>
            <iframe
              title={name || 'PDF Document'}
              src={src}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </Box>
        )}

        {isVideo && src && (
          <video controls style={{ maxWidth: '100%', maxHeight: '75vh' }}>
            <source src={src} type={mime || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        )}

        {!src && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', mb: 1 }}>
              No preview available.
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--color-grey-400)' }}>
              Use the open or download buttons above.
            </Typography>
          </Box>
        )}

        {src && !isImage && !isPdf && !isVideo && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', mb: 1 }}>
              Preview not available for this file type.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

DocumentPreview.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  src: PropTypes.string,
  name: PropTypes.string,
  mime: PropTypes.string,
};

export default DocumentPreview;
