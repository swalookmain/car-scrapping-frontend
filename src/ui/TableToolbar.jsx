import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
  ViewColumn as ColumnIcon
} from '@mui/icons-material';

const TableToolbar = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onCopy,
  onPrint,
  onFilter,
  onRefresh,
  onAdd,
  onExportCsv,
  onToggleColumns,
  showCopy = true,
  showPrint = true,
  showFilter = true,
  showRefresh = false,
  showAdd = true,
  showExportCsv = false,
  showColumnToggle = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 1.5, sm: 2.5 },
        py: { xs: 1.5, sm: 2 },
        background: 'linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(237,231,246,0.3) 100%)',
        backdropFilter: 'blur(8px)',
        borderRadius: '14px',
        mb: 2,
        border: '1px solid rgba(0,0,0,0.03)',
      }}
    >
      {/* Search Input */}
      <TextField
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          width: { xs: '100%', sm: 260, md: 300 },
          minWidth: { xs: 0, sm: 180 },
          flex: { xs: '1 1 100%', sm: '0 0 auto' },
          backgroundColor: '#fff',
          borderRadius: '10px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            '& fieldset': {
              borderColor: 'var(--color-grey-200)'
            },
            '&:hover fieldset': {
              borderColor: 'var(--color-grey-400)'
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--color-secondary-main)',
              boxShadow: '0 0 0 3px rgba(103,58,183,0.06)',
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'var(--color-grey-500)' }} />
            </InputAdornment>
          )
        }}
      />

      {/* Action Icons */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, flex: { xs: '1 1 auto', sm: '0 0 auto' }, justifyContent: { xs: 'flex-end', sm: 'flex-end' } }}>
        {showCopy && (
          <Tooltip title="Copy">
            <IconButton
              onClick={onCopy}
              sx={{
                color: 'var(--color-grey-600)',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-light)',
                  color: 'var(--color-secondary-main)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <CopyIcon />
            </IconButton>
          </Tooltip>
        )}

        {showPrint && (
          <Tooltip title="Print">
            <IconButton
              onClick={onPrint}
              sx={{
                color: 'var(--color-grey-600)',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-light)',
                  color: 'var(--color-secondary-main)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
        )}

        {showFilter && (
          <Tooltip title="Filter">
            <IconButton
              onClick={onFilter}
              sx={{
                color: 'var(--color-grey-600)',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-light)',
                  color: 'var(--color-secondary-main)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        )}

        {showRefresh && (
          <Tooltip title="Refresh">
            <IconButton
              onClick={onRefresh}
              sx={{
                color: 'var(--color-grey-600)',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-light)',
                  color: 'var(--color-secondary-main)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}

        {showExportCsv && (
          <Tooltip title="Export CSV">
            <IconButton
              onClick={onExportCsv}
              sx={{
                color: 'var(--color-grey-600)',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-light)',
                  color: 'var(--color-secondary-main)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <ExportIcon />
            </IconButton>
          </Tooltip>
        )}

        {showColumnToggle && (
          <Tooltip title="Column Visibility">
            <IconButton
              onClick={onToggleColumns}
              sx={{
                color: 'var(--color-grey-600)',
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-light)',
                  color: 'var(--color-secondary-main)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <ColumnIcon />
            </IconButton>
          </Tooltip>
        )}

        {showAdd && (
          <Tooltip title="Add New">
            <Fab
              size="small"
              onClick={onAdd}
              sx={{
                ml: 1,
                backgroundColor: 'var(--color-secondary-main)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(103, 58, 183, 0.35)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-dark)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 20px rgba(103, 58, 183, 0.45)',
                }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

TableToolbar.propTypes = {
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onCopy: PropTypes.func,
  onPrint: PropTypes.func,
  onFilter: PropTypes.func,
  onRefresh: PropTypes.func,
  onAdd: PropTypes.func,
  onExportCsv: PropTypes.func,
  onToggleColumns: PropTypes.func,
  showCopy: PropTypes.bool,
  showPrint: PropTypes.bool,
  showFilter: PropTypes.bool,
  showRefresh: PropTypes.bool,
  showAdd: PropTypes.bool,
  showExportCsv: PropTypes.bool,
  showColumnToggle: PropTypes.bool,
};

export default TableToolbar;
