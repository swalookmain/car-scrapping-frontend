import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, MenuItem, IconButton, Tooltip, Chip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableToolbar from '../../ui/TableToolbar';
import { ACTION_OPTIONS, STATUS_OPTIONS } from './auditLogsHelpers';

const AuditLogsToolbar = ({
  query, onQueryChange,
  showFilters, onToggleFilters,
  actionFilter, onActionChange,
  statusFilter, onStatusChange,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  onRefresh, onClearFilters,
  onExportCsv, onToggleColumns,
}) => {
  const hasActiveFilters = actionFilter || statusFilter || startDate || endDate;

  const handleToggleFilters = useCallback(() => onToggleFilters(), [onToggleFilters]);
  const handleRefresh = useCallback(() => onRefresh(), [onRefresh]);
  const handleClearFilters = useCallback(() => onClearFilters(), [onClearFilters]);
  const handleActionChange = useCallback((e) => onActionChange(e.target.value), [onActionChange]);
  const handleStatusChange = useCallback((e) => onStatusChange(e.target.value), [onStatusChange]);
  const handleStartDateChange = useCallback((e) => onStartDateChange(e.target.value), [onStartDateChange]);
  const handleEndDateChange = useCallback((e) => onEndDateChange(e.target.value), [onEndDateChange]);

  return (
    <Box>
      <TableToolbar
        searchPlaceholder="Search by action, actor, resource, IP…"
        searchValue={query}
        onSearchChange={onQueryChange}
        showCopy={false}
        showPrint={false}
        showFilter={false}
        showAdd={false}
        showExportCsv={true}
        onExportCsv={onExportCsv}
        showColumnToggle={true}
        onToggleColumns={onToggleColumns}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, pb: 2, flexWrap: 'wrap' }}>
        <Tooltip title={showFilters ? 'Hide Filters' : 'Show Filters'}>
          <IconButton
            onClick={handleToggleFilters}
            size="small"
            sx={{
              color: showFilters ? 'var(--color-secondary-main)' : 'var(--color-grey-600)',
              backgroundColor: showFilters ? 'var(--color-secondary-light)' : 'transparent',
              '&:hover': { backgroundColor: 'var(--color-secondary-light)' },
            }}
          >
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} size="small" sx={{ color: 'var(--color-grey-600)' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {hasActiveFilters && (
          <Chip
            label="Clear Filters"
            size="small"
            onDelete={handleClearFilters}
            sx={{ ml: 1, backgroundColor: '#fff3e0', color: '#e65100' }}
          />
        )}
      </Box>

      {showFilters && (
        <Box sx={{ display: 'flex', gap: 2, px: 3, pb: 2.5, flexWrap: 'wrap' }}>
          <TextField
            select label="Action" value={actionFilter}
            onChange={handleActionChange}
            size="small" sx={{ minWidth: 190 }}
          >
            <MenuItem value="">All Actions</MenuItem>
            {ACTION_OPTIONS.map((a) => (
              <MenuItem key={a} value={a}>{a.replace(/_/g, ' ')}</MenuItem>
            ))}
          </TextField>

          <TextField
            select label="Status" value={statusFilter}
            onChange={handleStatusChange}
            size="small" sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Status</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Start Date" type="datetime-local" value={startDate}
            onChange={handleStartDateChange}
            size="small" sx={{ minWidth: 200 }} InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="End Date" type="datetime-local" value={endDate}
            onChange={handleEndDateChange}
            size="small" sx={{ minWidth: 200 }} InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}
    </Box>
  );
};

AuditLogsToolbar.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  showFilters: PropTypes.bool.isRequired,
  onToggleFilters: PropTypes.func.isRequired,
  actionFilter: PropTypes.string.isRequired,
  onActionChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  startDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  endDate: PropTypes.string.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  onExportCsv: PropTypes.func.isRequired,
  onToggleColumns: PropTypes.func.isRequired,
};

export const MemoizedAuditLogsToolbar = memo(AuditLogsToolbar);
export default MemoizedAuditLogsToolbar;
