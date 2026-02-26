import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  Box
} from '@mui/material';

const NormalTable = ({
  columns,
  data,
  isLoading,
  onActionClick,
  toolbar,
  showCheckbox = true,
  // Pagination props
  page = 0,
  rowsPerPage = 5,
  totalCount,
  onPageChange,
  onRowsPerPageChange
}) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    const skeletonCount = Math.max(3, Math.min(rowsPerPage || 5, 6));
    return (
      <Paper sx={{ p: 0, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
        {toolbar && <Box sx={{ p: 0 }}>{toolbar}</Box>}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fff' }}>
                {showCheckbox && (
                  <TableCell sx={{ width: '48px', padding: '8px 12px' }} />
                )}
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      fontWeight: 600,
                      color: 'var(--color-grey-700)',
                      padding: '16px',
                      fontSize: '0.875rem',
                      ...(column.width && { width: column.width })
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <TableRow
                  key={`skeleton-${i}`}
                  sx={{
                    '&:hover': { backgroundColor: 'var(--color-grey-50)' },
                    borderBottom: '1px solid var(--color-grey-100)'
                  }}
                >
                  {showCheckbox && (
                    <TableCell sx={{ width: '48px', padding: '8px 12px' }}>
                      <Box sx={{ height: 20, width: 20, bgcolor: 'var(--color-grey-100)', borderRadius: '6px' }} className="animate-pulse" />
                    </TableCell>
                  )}
                  {columns.map((column, idx) => (
                    <TableCell key={idx} sx={{ padding: '16px', borderBottom: 'none' }}>
                      <Box sx={{ height: 16, width: column.width ? '60%' : '80%', bgcolor: 'var(--color-grey-100)', borderRadius: '6px' }} className="animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  const effectiveTotal = totalCount !== undefined ? totalCount : data.length;

  return (
    <Paper sx={{ p: 0, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
      {/* Toolbar */}
      {toolbar && <Box sx={{ p: 0 }}>{toolbar}</Box>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fff' }}>
              {showCheckbox && (
                <TableCell sx={{ width: '48px', padding: '8px 12px' }}>
                  <Checkbox
                    size="small"
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: 'var(--color-grey-400)',
                      '&.Mui-checked': {
                        color: 'var(--color-secondary-main)'
                      },
                      '&.MuiCheckbox-indeterminate': {
                        color: 'var(--color-secondary-main)'
                      }
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column, index) => {
                const headerSx = {
                  fontWeight: 600,
                  color: 'var(--color-grey-700)',
                  padding: '16px',
                  fontSize: '0.875rem',
                  ...(column.width && { width: column.width })
                };
                if (showCheckbox && index === 0) headerSx.paddingLeft = '8px';
                return (
                  <TableCell key={index} sx={headerSx}>
                    {column.headerName}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  '&:hover': { backgroundColor: 'var(--color-grey-50)' },
                  borderBottom: '1px solid var(--color-grey-100)'
                }}
              >
                {showCheckbox && (
                  <TableCell sx={{ width: '48px', padding: '8px 12px' }}>
                    <Checkbox
                      size="small"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      sx={{
                        color: 'var(--color-grey-400)',
                        '&.Mui-checked': {
                          color: 'var(--color-secondary-main)'
                        }
                      }}
                    />
                  </TableCell>
                )}
                {columns.map((column, index) => {
                  const cellSx = { padding: '16px', borderBottom: 'none' };
                  if (showCheckbox && index === 0) cellSx.paddingLeft = '8px';
                  return (
                    <TableCell key={index} sx={cellSx}>
                      {column.render ? column.render(row, onActionClick) : row[column.field]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {onPageChange && (
        <TablePagination
          component="div"
          count={effectiveTotal}
          page={page}
          onPageChange={(e, newPage) => onPageChange(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: '1px solid var(--color-grey-100)',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              color: 'var(--color-grey-600)',
              fontSize: '0.875rem'
            },
            '.MuiTablePagination-select': {
              color: 'var(--color-grey-700)'
            }
          }}
        />
      )}
    </Paper>
  );
};

NormalTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      headerName: PropTypes.string.isRequired,
      width: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onActionClick: PropTypes.func,
  toolbar: PropTypes.node,
  showCheckbox: PropTypes.bool,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func
};

export default NormalTable;