import React, { useState, useCallback, memo, forwardRef, useImperativeHandle, useRef } from 'react';
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
  Switch,
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
const VIRTUAL_ROW_HEIGHT = 48;
/** Standard cell padding for table cells (reduces vertical gaps) */
const STANDARD_CELL_PADDING = '8px 14px';
/** Visible height of the virtual list container */
const VIRTUAL_MAX_HEIGHT = 440;

// ── Stable virtual-row component (outside NormalTable to avoid recreation) ──
const VirtualRow = memo(function VirtualRow({ index, style, rows, visibleCols, showCb, selectedRows, onActionClick, onSelectRow }) {
  const row = rows[index];
  if (!row) return null;
  return (
    <Box
      role="row"
      style={{ ...style, display: 'flex', alignItems: 'center', boxSizing: 'border-box', borderBottom: '1px solid var(--color-grey-100)', backgroundColor: '#fff' }}
      sx={{ '&:hover': { backgroundColor: 'rgba(103,58,183,0.03) !important' } }}
    >
      {showCb && (
        <Box role="cell" sx={{ width: '40px', padding: '6px 10px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Switch
            size="small"
            checked={selectedRows.includes(row.id)}
            onChange={() => onSelectRow(row.id)}
            sx={{ transform: 'translateY(2px)', color: 'var(--color-grey-400)', '&.Mui-checked': { color: 'var(--color-secondary-main)' } }}
          />
        </Box>
      )}
      {visibleCols.map((column, colIdx) => (
        <Box
          key={column.field || column.headerName}
          role="cell"
          sx={{
            padding: '6px 12px',
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
    PaperProps={{ sx: { p: 2, minWidth: 180, borderRadius: '14px', boxShadow: '0 16px 48px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' } }}
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
            sx={{ alignItems: 'center' }}
            control={
              <Switch
                size="small"
                checked={!hiddenColumns.has(col.field)}
                onChange={() => onToggle(col.field)}
                sx={{ transform: 'translateY(2px)', color: 'var(--color-grey-400)', '&.Mui-checked': { color: 'var(--color-secondary-main)' } }}
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
  showCheckbox = false,
  csvFilename = 'table-data',
  page = 0,
  rowsPerPage = 5,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}, ref) => {
  const rootRef = useRef(null);
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

  // Filter out hidden columns but keep columns without a `field` (e.g. grouping or custom columns).
  // Then ensure any action column (field === 'actions' or headerName includes 'action') is moved to the end.
  const visibleColumnsRaw = columns.filter((col) => !col.field || !hiddenColumns.has(col.field));
  const isActionCol = (c) => (c.field && c.field.toString().toLowerCase() === 'actions') || (c.headerName && c.headerName.toLowerCase().includes('action'));
  const visibleColumns = [
    ...visibleColumnsRaw.filter((c) => !isActionCol(c)),
    ...visibleColumnsRaw.filter((c) => isActionCol(c)),
  ];

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

  const handlePageChangeLocal = useCallback((e, newPage) => {
    try {
      if (rootRef.current && rootRef.current.scrollIntoView) {
        rootRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    } catch (err) {
      // ignore
    }
    onPageChange?.(newPage);
  }, [onPageChange]);

  const handleRowsPerPageChangeLocal = useCallback((e) => {
    try {
      if (rootRef.current && rootRef.current.scrollIntoView) {
        rootRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    } catch (err) {
      // ignore
    }
    onRowsPerPageChange?.(parseInt(e.target.value, 10));
  }, [onRowsPerPageChange]);

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
      <Paper sx={{ p: 0, borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)' }}>
          {toolbar && <Box sx={{ p: 0 }}>{toolbar}</Box>} 
        <TableContainer>
          <Table sx={{ borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(103,58,183,0.04)' }}>
                  {showCheckbox && ( 
                    <TableCell sx={{ width: '40px', padding: '8px 10px', borderBottom: '1px solid var(--color-grey-200)', backgroundColor: 'rgba(103,58,183,0.04)' }} />
                  )} 
                  {visibleColumns.map((column) => (
                  <TableCell
                    key={column.field || column.headerName}
                      sx={{ 
                        fontWeight: 600, 
                        color: 'var(--color-secondary-dark)', 
                        padding: '10px 14px', 
                        fontSize: '0.72rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.06em', 
                        borderBottom: '2px solid var(--color-grey-100)', 
                        backgroundColor: 'rgba(237,231,246,0.25)', 
                        whiteSpace: 'nowrap', 
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
                    backgroundColor: i % 2 === 1 ? 'rgba(103,58,183,0.018)' : '#fff',
                  }}
                >
                  {showCheckbox && (
                    <TableCell sx={{ width: '40px', padding: '8px 10px', borderBottom: '1px solid var(--color-grey-100)' }}>
                      <Box sx={{ height: 14, width: 14, bgcolor: 'var(--color-grey-100)', borderRadius: '4px' }} className="animate-pulse" />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.field || column.headerName} sx={{ padding: STANDARD_CELL_PADDING, borderBottom: '1px solid var(--color-grey-100)' }}>
                      <Box sx={{ height: 13, width: column.width ? '60%' : '75%', bgcolor: 'var(--color-grey-100)', borderRadius: '5px' }} className="animate-pulse" />
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


  // ── Standard row renderer (paginated mode) ────────────────────
  const renderStandardRows = () =>
    data.map((row, rowIdx) => (
      <TableRow
        key={row.id}
        hover
        sx={{
          backgroundColor: rowIdx % 2 === 1 ? 'rgba(237,231,246,0.08)' : '#fff',
          '&:hover': { backgroundColor: 'rgba(103,58,183,0.04) !important' },
          '&:last-child td': { borderBottom: 'none' },
          transition: 'background-color 0.15s ease',
        }}
      >
        {showCheckbox && (
          <TableCell sx={{ width: '40px', padding: '6px 10px' }}>
            <Switch
              size="small"
              checked={selectedRows.includes(row.id)}
              onChange={() => handleSelectRow(row.id)}
              sx={{ transform: 'translateY(2px)', color: 'var(--color-grey-400)', '&.Mui-checked': { color: 'var(--color-secondary-main)' } }}
            />
          </TableCell>
        )}
          {visibleColumns.map((column, colIdx) => {
          const isAction = (column.field && column.field.toString().toLowerCase() === 'actions') || (column.headerName && column.headerName.toLowerCase().includes('action'));
          const cellSx = {
            padding: STANDARD_CELL_PADDING,
            borderBottom: '1px solid var(--color-grey-100)',
            fontSize: '0.8125rem',
            color: 'var(--color-grey-800)',
          };
          if (isAction) {
            Object.assign(cellSx, {
              whiteSpace: 'nowrap',
              textAlign: 'right',
              verticalAlign: 'middle',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '8px',
              paddingRight: '12px',
            });
          }
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
      <TableRow sx={{ backgroundColor: 'rgba(237,231,246,0.25)' }}>
        {showCheckbox && (
          <TableCell sx={{ width: '40px', padding: '10px 10px', borderBottom: '2px solid var(--color-grey-100)', backgroundColor: 'rgba(237,231,246,0.25)' }}>
            <Switch
              size="small"
              checked={data.length > 0 && selectedRows.length === data.length}
              onChange={handleSelectAll}
              sx={{
                transform: 'translateY(2px)',
                color: 'var(--color-grey-400)',
                '&.Mui-checked': { color: 'var(--color-secondary-main)' },
              }}
            />
          </TableCell>
        )}
        {visibleColumns.map((column, colIdx) => {
          const headerSx = {
            fontWeight: 600,
            color: 'var(--color-secondary-dark)',
            padding: '10px 14px',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '2px solid var(--color-grey-100)',
            backgroundColor: 'rgba(237,231,246,0.25)',
            whiteSpace: 'nowrap',
            ...(column.width && { width: column.width }),
          };
          // Right-align action header so it sits closer to action buttons
          const isActionHeader = (column.field && column.field.toString().toLowerCase() === 'actions') || (column.headerName && column.headerName.toLowerCase().includes('action'));
          if (isActionHeader) {
            headerSx.textAlign = 'right';
            headerSx.paddingRight = '12px';
          }
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
    <Paper ref={rootRef} sx={{ p: 0, borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Toolbar */}
      {toolbar && <Box sx={{ p: 0 }}>{toolbar}</Box>}

      {shouldVirtualize ? (
        /* ── Virtual scrolling for large non-paginated datasets (react-window v2 List) ── */
        <Box>
          <TableContainer>
            <Table stickyHeader sx={{ borderCollapse: 'collapse' }}>
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
          <Table stickyHeader={false} sx={{ borderCollapse: 'collapse' }}>
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
          onPageChange={handlePageChangeLocal}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChangeLocal}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: '1px solid var(--color-grey-100)',
            backgroundColor: 'rgba(237,231,246,0.08)',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              color: 'var(--color-grey-500)',
              fontSize: '0.8rem',
            },
            '.MuiTablePagination-select': {
              color: 'var(--color-grey-700)',
              fontSize: '0.8rem',
              borderRadius: '8px',
            },
            '.MuiTablePagination-actions button': {
              color: 'var(--color-secondary-main)',
              borderRadius: '8px',
              '&:disabled': { color: 'var(--color-grey-300)' },
              '&:hover': { backgroundColor: 'rgba(103,58,183,0.08)' },
            },
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