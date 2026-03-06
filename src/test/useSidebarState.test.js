/**
 * Tests for useSidebarState hook.
 * Mocks MUI useMediaQuery and useTheme to control responsive breakpoints.
 */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

// ── Mock MUI hooks ─────────────────────────────────────────────
const mockUseMediaQuery = vi.fn();
vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMediaQuery: () => mockUseMediaQuery(),
    useTheme: () => ({ breakpoints: { down: () => '(max-width:1200px)' } }),
  };
});

const { default: useSidebarState } = await import('../hooks/useSidebarState');

beforeEach(() => {
  localStorage.clear();
  mockUseMediaQuery.mockReturnValue(false); // desktop by default
});

describe('useSidebarState — initial state', () => {
  it('defaults to open (true) when no localStorage value', () => {
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.leftDrawerOpened).toBe(true);
  });

  it('restores true from localStorage', () => {
    localStorage.setItem('sidebarOpen', 'true');
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.leftDrawerOpened).toBe(true);
  });

  it('restores false from localStorage', () => {
    localStorage.setItem('sidebarOpen', 'false');
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.leftDrawerOpened).toBe(false);
  });
});

describe('useSidebarState — handleDrawerToggle', () => {
  it('toggles from open to closed', () => {
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.leftDrawerOpened).toBe(true);
    act(() => {
      result.current.handleDrawerToggle();
    });
    expect(result.current.leftDrawerOpened).toBe(false);
  });

  it('toggles from closed to open', () => {
    localStorage.setItem('sidebarOpen', 'false');
    const { result } = renderHook(() => useSidebarState());
    act(() => {
      result.current.handleDrawerToggle();
    });
    expect(result.current.leftDrawerOpened).toBe(true);
  });

  it('persists new state to localStorage', () => {
    const { result } = renderHook(() => useSidebarState());
    act(() => {
      result.current.handleDrawerToggle();
    });
    expect(localStorage.getItem('sidebarOpen')).toBe('false');
  });
});

describe('useSidebarState — handleMobileItemClick', () => {
  it('closes sidebar on mobile when item is clicked', () => {
    mockUseMediaQuery.mockReturnValue(true); // simulate mobile
    const { result } = renderHook(() => useSidebarState());
    act(() => {
      result.current.handleMobileItemClick();
    });
    expect(result.current.leftDrawerOpened).toBe(false);
  });

  it('does not close sidebar on desktop when item is clicked', () => {
    mockUseMediaQuery.mockReturnValue(false); // desktop
    localStorage.setItem('sidebarOpen', 'true');
    const { result } = renderHook(() => useSidebarState());
    act(() => {
      result.current.handleMobileItemClick();
    });
    // Should stay open on desktop
    expect(result.current.leftDrawerOpened).toBe(true);
  });
});

describe('useSidebarState — responsive behaviour', () => {
  it('auto-closes on mobile breakpoint', () => {
    mockUseMediaQuery.mockReturnValue(true);
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.leftDrawerOpened).toBe(false);
  });

  it('exposes all required properties', () => {
    const { result } = renderHook(() => useSidebarState());
    expect(typeof result.current.leftDrawerOpened).toBe('boolean');
    expect(typeof result.current.handleDrawerToggle).toBe('function');
    expect(typeof result.current.handleMobileItemClick).toBe('function');
  });
});
