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
  Add as AddIcon
} from '@mui/icons-material';

const TableToolbar = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onCopy,
  onPrint,
  onFilter,
  onAdd,
  showCopy = true,
  showPrint = true,
  showFilter = true,
  showAdd = true
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        backgroundColor: 'var(--color-grey-50)',
        borderRadius: '12px',
        mb: 2
      }}
    >
      {/* Search Input */}
      <TextField
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          width: 280,
          backgroundColor: '#fff',
          borderRadius: '8px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'var(--color-grey-200)'
            },
            '&:hover fieldset': {
              borderColor: 'var(--color-grey-400)'
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--color-secondary-main)'
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showCopy && (
          <Tooltip title="Copy">
            <IconButton
              onClick={onCopy}
              sx={{
                color: 'var(--color-grey-600)',
                '&:hover': {
                  backgroundColor: 'var(--color-grey-200)'
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
                '&:hover': {
                  backgroundColor: 'var(--color-grey-200)'
                }
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* {showFilter && (
          <Tooltip title="Filter">
            <IconButton
              onClick={onFilter}
              sx={{
                color: 'var(--color-grey-600)',
                '&:hover': {
                  backgroundColor: 'var(--color-grey-200)'
                }
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        )} */}

        {showAdd && (
          <Tooltip title="Add New">
            <Fab
              size="small"
              onClick={onAdd}
              sx={{
                ml: 1,
                backgroundColor: 'var(--color-secondary-main)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(33, 150, 243, 0.4)',
                '&:hover': {
                  backgroundColor: 'var(--color-secondary-dark)'
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
  onAdd: PropTypes.func,
  showCopy: PropTypes.bool,
  showPrint: PropTypes.bool,
  showFilter: PropTypes.bool,
  showAdd: PropTypes.bool
};

export default TableToolbar;
