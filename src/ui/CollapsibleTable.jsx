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
  IconButton,
  Collapse,
  Box,
  Typography,
  Checkbox,
  TablePagination
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const CollapsibleTableRow = ({ row, columns, renderCollapsedContent, onActionClick, showCheckbox, selected, onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow 
        hover 
        sx={{ 
          '&:hover': { backgroundColor: 'var(--color-grey-50)' },
          borderBottom: '1px solid var(--color-grey-100)'
        }}
      >
        {showCheckbox && (
          <TableCell sx={{ width: '50px', padding: '8px 16px' }}>
            <Checkbox
              checked={selected}
              onChange={() => onSelect(row.id)}
              sx={{
                color: 'var(--color-grey-400)',
                '&.Mui-checked': {
                  color: 'var(--color-secondary-main)'
                }
              }}
            />
          </TableCell>
        )}
        <TableCell sx={{ width: '50px', padding: '8px 16px' }}>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ 
              color: 'var(--color-secondary-main)',
              '&:hover': {
                backgroundColor: 'var(--color-secondary-light)'
              }
            }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        {columns.map((column) => (
          <TableCell key={column.field || column.headerName} sx={{ padding: '16px', borderBottom: 'none' }}>
            {column.render ? column.render(row, onActionClick) : row[column.field]}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell 
          style={{ paddingBottom: 0, paddingTop: 0 }} 
          colSpan={columns.length + (showCheckbox ? 2 : 1)}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 3, backgroundColor: 'var(--color-grey-50)', borderRadius: '8px' }}>
              {renderCollapsedContent(row)}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const CollapsibleTable = ({
  columns,
  data,
  renderCollapsedContent,
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
    return (
      <Paper sx={{ p: 0, borderRadius: '12px', overflow: 'hidden' }}>
        <div className="h-96 bg-grey-100 rounded-xl animate-pulse"></div>
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
                <TableCell sx={{ width: '50px', padding: '8px 16px' }}>
                  <Checkbox
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
              <TableCell sx={{ width: '50px', padding: '8px 16px' }} />
              {columns.map((column) => (
                <TableCell
                  key={column.field || column.headerName}
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
            {data.map((row) => (
              <CollapsibleTableRow
                key={row.id}
                row={row}
                columns={columns}
                renderCollapsedContent={renderCollapsedContent}
                onActionClick={onActionClick}
                showCheckbox={showCheckbox}
                selected={selectedRows.includes(row.id)}
                onSelect={handleSelectRow}
              />
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

CollapsibleTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      headerName: PropTypes.string.isRequired,
      width: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  renderCollapsedContent: PropTypes.func.isRequired,
  onActionClick: PropTypes.func,
  showCheckbox: PropTypes.bool,
  selected: PropTypes.bool,
  onSelect: PropTypes.func
};

CollapsibleTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      headerName: PropTypes.string.isRequired,
      width: PropTypes.string,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  renderCollapsedContent: PropTypes.func.isRequired,
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

export default CollapsibleTable;
