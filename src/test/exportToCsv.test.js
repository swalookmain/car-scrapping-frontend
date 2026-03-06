import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCsv } from '../ui/NormalTable';

// NormalTable columns use MUI DataGrid format: { field, headerName }
const columns = [
  { field: 'name', headerName: 'Name' },
  { field: 'age', headerName: 'Age' },
];
const data = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

describe('exportToCsv', () => {
  let clickSpy;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    URL.revokeObjectURL = vi.fn();

    clickSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
      remove: vi.fn(),
      style: {},
    });
    vi.spyOn(document.body, 'appendChild').mockReturnValue(undefined);
  });

  it('is a function exported from NormalTable', () => {
    expect(typeof exportToCsv).toBe('function');
  });

  it('triggers a download click for valid data', () => {
    exportToCsv(columns, data, 'test-export');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('does not crash when called with empty data', () => {
    expect(() => exportToCsv(columns, [], 'empty-export')).not.toThrow();
  });

  it('handles special characters in values without throwing', () => {
    const cols = [{ field: 'note', headerName: 'Note' }];
    const rows = [{ note: 'Hello, "World"\nNewline' }];
    expect(() => exportToCsv(cols, rows, 'special-chars')).not.toThrow();
  });
});

