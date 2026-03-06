import React, { useState, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { List } from 'react-window';
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
  Box,
  Popover,
  FormControlLabel,
  Typography,
  Divider,
  Button
} from '@mui/material';
// react-window v2 is installed; use List for non-paginated large tables.
// Triggers when data.length > VIRTUAL_THRESHOLD and no onPageChange prop.
// All current paginated tables always supply onPageChange so they are unaffected.

/** Rows above this count activate react-window virtual scrolling (non-paginated mode) */
const VIRTUAL_THRESHOLD = 100;
/** Fixed height of each virtual row in pixels */
const VIRTUAL_ROW_HEIGHT = 56;
/** Visible height of the virtual list container */
const VIRTUAL_MAX_HEIGHT = 520;

// ── Stable virtual-row component (outside NormalTable to avoid recreation) ──
const VirtualRow = memo(function VirtualRow({ index, style, rows, visibleCols, showCb, selectedRows, onActionClick, onSelectRow }) {
  const row = rows[index];
  if (!row) return null;
  return (
    <Box
      role="row"
      style={{ ...style, display: 'flex', alignItems: 'center', boxSizing: 'border-box', borderBottom: '1px solid var(--color-grey-100)', backgroundColor: '#fff' }}
      sx={{ '&:hover': { backgroundColor: 'var(--color-grey-50) !important' } }}
    >
      {showCb && (
        <Box role="cell" sx={{ width: '48px', padding: '8px 12px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Checkbox
            size="small"
            checked={selectedRows.includes(row.id)}
            onChange={() => onSelectRow(row.id)}
            sx={{ color: 'var(--color-grey-400)', '&.Mui-checked': { color: 'var(--color-secondary-main)' } }}
          />
        </Box>
      )}
      {visibleCols.map((column, colIdx) => (
        <Box
          key={column.field || column.headerName}
          role="cell"
          sx={{
            padding: '8px 16px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            flex: column.width ? `0 0 ${column.width}` : '1 1 auto',
            paddingLeft: showCb && colIdx === 0 ? '8px' : undefined,
          }}
        >
          {column.render ? column.render(row, onActionClick) : row[column.field]}
        </Box>
      ))}
    </Box>
  );
});

// ── CSV Export Utility ─────────────────────────────────────────
export const exportToCsv = (columns, data, filename = 'export') => {
  const exportCols = columns.filter((c) => c.field && c.field !== 'actions');
  const header = exportCols.map((c) => `"${c.headerName}"`).join(',');
  const rows = data.map((row) =>
    exportCols
      .map((c) => {
        const val = row[c.field] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csv = [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Column Visibility Popover ──────────────────────────────────
const ColumnVisibilityPopover = ({ anchorEl, onClose, columns, hiddenColumns, onToggle, onShowAll }) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{ sx: { p: 2, minWidth: 200, borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' } }}
  >
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'var(--color-grey-700)' }}>
      Column Visibility
    </Typography>
    <Divider sx={{ mb: 1 }} />
    {columns
      .filter((c) => c.field && c.field !== 'actions')
      .map((col) => (
        <Box key={col.field} sx={{ display: 'block' }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={!hiddenColumns.has(col.field)}
                onChange={() => onToggle(col.field)}
                sx={{ color: 'var(--color-grey-400)', '&.Mui-checked': { color: 'var(--color-secondary-main)' } }}
              />
            }
            label={<Typography variant="body2">{col.headerName}</Typography>}
          />
        </Box>
      ))}
    <Divider sx={{ mt: 1, mb: 1 }} />
    <Button size="small" onClick={onShowAll} sx={{ color: 'var(--color-secondary-main)', fontSize: '0.75rem', textTransform: 'none' }}>
      Show All
    </Button>
  </Popover>
);

// ── NormalTable ────────────────────────────────────────────────
/**
 * Exposes two imperative methods via ref:
 *   tableRef.current.exportCsv()         — downloads a CSV of current data
 *   tableRef.current.openColumnToggle(e) — opens column visibility popover
 */
const NormalTable = forwardRef(({
  columns,
  data,
  isLoading,
  onActionClick,
  toolbar,
  showCheckbox = true,
  csvFilename = 'table-data',
  page = 0,
  rowsPerPage = 5,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}, ref) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [colAnchorEl, setColAnchorEl] = useState(null);

  const handleToggleColumn = useCallback((field) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field); else next.add(field);
      return next;
    });
  }, []);

  const handleShowAll = useCallback(() => setHiddenColumns(new Set()), []);

  useImperativeHandle(ref, () => ({
    exportCsv: () => exportToCsv(columns, data, csvFilename),
    openColumnToggle: (e) => setColAnchorEl(e.currentTarget),
  }), [columns, data, csvFilename]);

  const visibleColumns = columns.filter((col) => !col.field || !hiddenColumns.has(col.field));

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Stable callback for toggling a single row selection — hoisted so hook order is consistent
  const handleSelectRow = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  // prepare virtual row props before any early return so hooks remain stable between renders
  const virtualRowProps = React.useMemo(() => ({
    rows: data,
    visibleCols: visibleColumns,
    showCb: showCheckbox,
    selectedRows,
    onActionClick,
    onSelectRow: handleSelectRow,
  }), [data, visibleColumns, showCheckbox, selectedRows, onActionClick, handleSelectRow]);

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
                {visibleColumns.map((column) => (
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
                  {visibleColumns.map((column) => (
                    <TableCell key={column.field || column.headerName} sx={{ padding: '16px', borderBottom: 'none' }}>
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
  const shouldVirtualize = !onPageChange && data.length > VIRTUAL_THRESHOLD;


  // ── Standard row renderer (paginated mode) ───────────────────────
  const renderStandardRows = () =>
    data.map((row) => (
      <TableRow
        key={row.id}
        hover
        sx={{ '&:hover': { backgroundColor: 'var(--color-grey-50)' }, borderBottom: '1px solid var(--color-grey-100)' }}
      >
        {showCheckbox && (
          <TableCell sx={{ width: '48px', padding: '8px 12px' }}>
            <Checkbox
              size="small"
              checked={selectedRows.includes(row.id)}
              onChange={() => handleSelectRow(row.id)}
              sx={{ color: 'var(--color-grey-400)', '&.Mui-checked': { color: 'var(--color-secondary-main)' } }}
            />
          </TableCell>
        )}
        {visibleColumns.map((column, colIdx) => {
          const cellSx = { padding: '16px', borderBottom: 'none' };
          if (showCheckbox && colIdx === 0) cellSx.paddingLeft = '8px';
          return (
            <TableCell key={column.field || column.headerName} sx={cellSx}>
              {column.render ? column.render(row, onActionClick) : row[column.field]}
            </TableCell>
          );
        })}
      </TableRow>
    ));

  const tableHeader = (
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
                '&.Mui-checked': { color: 'var(--color-secondary-main)' },
                '&.MuiCheckbox-indeterminate': { color: 'var(--color-secondary-main)' },
              }}
            />
          </TableCell>
        )}
        {visibleColumns.map((column, colIdx) => {
          const headerSx = { fontWeight: 600, color: 'var(--color-grey-700)', padding: '16px', fontSize: '0.875rem', ...(column.width && { width: column.width }) };
          if (showCheckbox && colIdx === 0) headerSx.paddingLeft = '8px';
          return (
            <TableCell key={column.field || column.headerName} sx={headerSx}>
              {column.headerName}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );

  return (
    <Paper sx={{ p: 0, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.08)' }}>
      {/* Toolbar */}
      {toolbar && <Box sx={{ p: 0 }}>{toolbar}</Box>}

      {shouldVirtualize ? (
        /* ── Virtual scrolling for large non-paginated datasets (react-window v2 List) ── */
        <Box>
          <TableContainer>
            <Table stickyHeader>
              {tableHeader}
            </Table>
          </TableContainer>
          <List
            rowCount={data.length}
            rowHeight={VIRTUAL_ROW_HEIGHT}
            rowComponent={VirtualRow}
            rowProps={virtualRowProps}
            style={{ height: Math.min(data.length * VIRTUAL_ROW_HEIGHT, VIRTUAL_MAX_HEIGHT) }}
          />
        </Box>
      ) : (
        /* ── Standard paginated table ── */
        <TableContainer>
          <Table stickyHeader={false}>
            {tableHeader}
            <TableBody>
              {renderStandardRows()}
            </TableBody>
          </Table>
        </TableContainer>
      )}

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

      <ColumnVisibilityPopover
        anchorEl={colAnchorEl}
        onClose={() => setColAnchorEl(null)}
        columns={columns}
        hiddenColumns={hiddenColumns}
        onToggle={handleToggleColumn}
        onShowAll={handleShowAll}
      />
    </Paper>
  );
});

NormalTable.displayName = 'NormalTable';

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
  csvFilename: PropTypes.string,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func
};

export default memo(NormalTable);