/**
 * Tests for NormalTable UI component:
 *  - Loading skeleton state
 *  - Rendering rows and columns
 *  - Empty state handling
 *  - Pagination controls
 *  - Checkbox selection
 *  - CSV export utility (already tested separately in exportToCsv.test.js)
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NormalTable, { exportToCsv } from '../ui/NormalTable';

// ── Sample data ────────────────────────────────────────────────
const columns = [
  { field: 'name', headerName: 'Name' },
  { field: 'status', headerName: 'Status' },
  { field: 'amount', headerName: 'Amount' },
];

const rows = [
  { id: '1', name: 'Alice', status: 'Active', amount: 1000 },
  { id: '2', name: 'Bob', status: 'Inactive', amount: 500 },
  { id: '3', name: 'Carol', status: 'Active', amount: 2500 },
];

const defaultProps = {
  columns,
  data: rows,
  isLoading: false,
};

describe('NormalTable — loading state', () => {
  it('renders skeleton rows when isLoading=true', () => {
    render(<NormalTable {...defaultProps} isLoading={true} />);
    // Table should render but actual data should not appear
    expect(screen.queryByText('Alice')).toBeNull();
    expect(screen.queryByText('Bob')).toBeNull();
  });

  it('renders header columns in loading state', () => {
    render(<NormalTable {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
  });
});

describe('NormalTable — data rendering', () => {
  it('renders all column headers', () => {
    render(<NormalTable {...defaultProps} />);
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Amount')).toBeDefined();
  });

  it('renders all row data', () => {
    render(<NormalTable {...defaultProps} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
    expect(screen.getByText('Carol')).toBeDefined();
  });

  it('renders all status values in the table', () => {
    render(<NormalTable {...defaultProps} />);
    // Two rows have 'Active' - use getAllByText
    const activeCells = screen.getAllByText('Active');
    expect(activeCells.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Inactive')).toBeDefined();
  });

  it('renders custom cell via render function', () => {
    const cols = [
      { field: 'name', headerName: 'Name' },
      {
        field: 'status',
        headerName: 'Status',
        render: (row) => <span data-testid={`chip-${row.id}`}>{row.status}</span>,
      },
    ];
    render(<NormalTable columns={cols} data={rows} isLoading={false} />);
    expect(screen.getByTestId('chip-1').textContent).toBe('Active');
    expect(screen.getByTestId('chip-2').textContent).toBe('Inactive');
  });
});

describe('NormalTable — empty state', () => {
  it('renders table with no rows when data is empty', () => {
    render(<NormalTable columns={columns} data={[]} isLoading={false} />);
    expect(screen.queryByText('Alice')).toBeNull();
    // Headers still visible
    expect(screen.getByText('Name')).toBeDefined();
  });
});

describe('NormalTable — toolbar', () => {
  it('renders toolbar when provided', () => {
    render(
      <NormalTable
        {...defaultProps}
        toolbar={<div data-testid="custom-toolbar">Toolbar</div>}
      />
    );
    expect(screen.getByTestId('custom-toolbar')).toBeDefined();
  });

  it('does not render toolbar section when not provided', () => {
    render(<NormalTable {...defaultProps} />);
    expect(screen.queryByTestId('custom-toolbar')).toBeNull();
  });
});

describe('NormalTable — pagination', () => {
  it('renders pagination when onPageChange is provided', () => {
    render(
      <NormalTable
        {...defaultProps}
        page={0}
        rowsPerPage={10}
        totalCount={100}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
      />
    );
    // MUI TablePagination shows "1-10 of 100" or similar text
    expect(
      screen.getByText(/of 100/i) ?? screen.getByText(/100/)
    ).toBeDefined();
  });

  it('calls onPageChange when next page is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <NormalTable
        {...defaultProps}
        page={0}
        rowsPerPage={2}
        totalCount={rows.length}
        onPageChange={onPageChange}
        onRowsPerPageChange={vi.fn()}
      />
    );
    const nextBtn = screen.getByRole('button', { name: /next page|Go to next/i });
    await userEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('does not render pagination when onPageChange is not provided', () => {
    render(<NormalTable {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /next page/i })).toBeNull();
  });
});

describe('NormalTable — checkbox selection', () => {
  it('renders checkboxes when showCheckbox=true', () => {
    render(<NormalTable {...defaultProps} showCheckbox={true} />);
    const checkboxes = screen.getAllByRole('checkbox');
    // header checkbox + one per row
    expect(checkboxes.length).toBe(rows.length + 1);
  });

  it('does not render checkboxes when showCheckbox=false', () => {
    render(<NormalTable {...defaultProps} showCheckbox={false} />);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('selects a row when its checkbox is clicked', async () => {
    render(<NormalTable {...defaultProps} showCheckbox={true} />);
    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] = header, checkboxes[1] = first row
    const firstRowCheckbox = checkboxes[1];
    expect(firstRowCheckbox.checked).toBe(false);
    await userEvent.click(firstRowCheckbox);
    expect(firstRowCheckbox.checked).toBe(true);
  });

  it('selects all rows when header checkbox is clicked', async () => {
    render(<NormalTable {...defaultProps} showCheckbox={true} />);
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]); // header checkbox
    await waitFor(() => {
      const allChecked = Array.from(screen.getAllByRole('checkbox'))
        .slice(1)
        .every((cb) => cb.checked);
      expect(allChecked).toBe(true);
    });
  });
});

describe('NormalTable — imperative handle (ref)', () => {
  it('exposes exportCsv and openColumnToggle via ref', () => {
    const ref = React.createRef();
    render(<NormalTable {...defaultProps} ref={ref} csvFilename="test" />);
    expect(typeof ref.current?.exportCsv).toBe('function');
    expect(typeof ref.current?.openColumnToggle).toBe('function');
  });
});
