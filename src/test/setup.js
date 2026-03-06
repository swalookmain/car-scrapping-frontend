import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { server } from './handlers';

// Start the MSW server before all tests, reset between each, and close after all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  sessionStorage.clear();
});
afterAll(() => server.close());

// Silence React act() warnings in test output
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Stub window.matchMedia (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Stub window.print
window.print = vi.fn();
