/**
 * Form field-level validation tests for StaffForm and InvoiceForm.
 * Verifies required-field and format errors appear on submit attempt.
 */
import React, { createRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// ── Mocks (hoisted by vitest) ─────────────────────────────────
vi.mock('../services/inputStyles', () => ({ default: {} }));

vi.mock('@mui/icons-material', () => ({
  Visibility: () => 'EyeIcon',
  VisibilityOff: () => 'EyeOffIcon',
  Close: () => 'CloseIcon',
}));
vi.mock('@mui/icons-material/LockReset', () => ({ default: () => 'LockResetIcon' }));
vi.mock('@mui/icons-material/Edit', () => ({ default: () => 'EditIcon' }));
vi.mock('@mui/icons-material/Visibility', () => ({ default: () => 'VisIcon' }));
vi.mock('@mui/icons-material/VisibilityOff', () => ({ default: () => 'VisOffIcon' }));

vi.mock('../ui/UpdatePasswordModal', () => ({ default: () => null }));

// Minimal InvoiceSellerFields mock that forwards validation errors to DOM
vi.mock('../components/invoice-management/InvoiceSellerFields', () => ({
  default: ({ errors }) => (
    <div data-testid="seller-fields">
      {errors?.mobile        && <p role="alert">{errors.mobile}</p>}
      {errors?.email         && <p role="alert">{errors.email}</p>}
      {errors?.aadhaarNumber && <p role="alert">{errors.aadhaarNumber}</p>}
      {errors?.panNumber     && <p role="alert">{errors.panNumber}</p>}
      {errors?.auctionNumber && <p role="alert">{errors.auctionNumber}</p>}
      {errors?.auctionDate   && <p role="alert">{errors.auctionDate}</p>}
      {errors?.source        && <p role="alert">{errors.source}</p>}
      {errors?.lotNumber     && <p role="alert">{errors.lotNumber}</p>}
    </div>
  ),
}));

vi.mock('../components/invoice-management/InvoiceVehicleStep', () => ({
  default: ({ errors }) => (
    <div data-testid="vehicle-step">
      {errors?.ownerName            && <p role="alert">{errors.ownerName}</p>}
      {errors?.make                 && <p role="alert">{errors.make}</p>}
      {errors?.model_name           && <p role="alert">{errors.model_name}</p>}
      {errors?.registration_number   && <p role="alert">{errors.registration_number}</p>}
      {errors?.chassis_number       && <p role="alert">{errors.chassis_number}</p>}
      {errors?.engine_number        && <p role="alert">{errors.engine_number}</p>}
      {errors?.year_of_manufacture  && <p role="alert">{errors.year_of_manufacture}</p>}
      {errors?.vehicle_purchase_date && <p role="alert">{errors.vehicle_purchase_date}</p>}
    </div>
  ),
}));

vi.mock('../services/api', () => ({
  invoicesApi: {
    getVehicleById: vi.fn().mockResolvedValue({ data: [] }),
    getAll: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
  },
}));

// Dynamic imports (after mocks are registered)
const { default: StaffForm }   = await import('../components/staff-management/StaffForm');
const { default: InvoiceForm } = await import('../components/invoice-management/InvoiceForm');

// ── Helpers ───────────────────────────────────────────────────
const wrap = (ui) => render(ui, { wrapper: MemoryRouter });
const openForm = async (ref, item) => {
  await act(async () => { ref.current.open(item); });
};

// ═══════════════════════════════════════════════════════════════
// StaffForm validation
// ═══════════════════════════════════════════════════════════════
describe('StaffForm — field validation', () => {
  it('shows all required-field errors on empty create form submit', async () => {
    const ref = createRef();
    wrap(<StaffForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    await userEvent.click(await screen.findByRole('button', { name: /add staff/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
  });

  it('clears name error after typing a valid name', async () => {
    const ref = createRef();
    wrap(<StaffForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    await userEvent.click(await screen.findByRole('button', { name: /add staff/i }));
    await screen.findByText('Name is required');

    await userEvent.type(screen.getByLabelText(/^name$/i), 'Alice');
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('rejects short password (< 6 chars)', async () => {
    const ref = createRef();
    wrap(<StaffForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    const pwdInput = await screen.findByLabelText(/^password$/i);
    await userEvent.type(pwdInput, '123');
    await userEvent.click(screen.getByRole('button', { name: /add staff/i }));

    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();
  });

  it('accepts exactly 6-char password (no password error)', async () => {
    const ref = createRef();
    wrap(<StaffForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    const pwdInput = await screen.findByLabelText(/^password$/i);
    await userEvent.type(pwdInput, 'abc123');
    await userEvent.click(screen.getByRole('button', { name: /add staff/i }));

    // all other fields invalid, but password error should NOT appear
    await screen.findByText('Name is required');
    expect(screen.queryByText('Password must be at least 6 characters')).not.toBeInTheDocument();
  });

  it('does not show password field when editing existing staff', async () => {
    const ref = createRef();
    wrap(<StaffForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref, {
      _id: 'user-1',
      name: 'Bob',
      phone: '9876543210',
      email: 'bob@example.com',
      isActive: true,
    });

    await screen.findByRole('button', { name: /save/i });
    expect(screen.queryByLabelText(/^password$/i)).not.toBeInTheDocument();
  });

  it('rejects invalid email format', async () => {
    const ref = createRef();
    wrap(<StaffForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    await userEvent.type(await screen.findByLabelText(/email id/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /add staff/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
  });

  it('accepts valid email (no email error when format is correct)', async () => {
    const ref = createRef();
    wrap(<StaffForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    await userEvent.type(await screen.findByLabelText(/email id/i), 'valid@test.com');
    await userEvent.click(screen.getByRole('button', { name: /add staff/i }));

    await screen.findByText('Name is required'); // other errors still present
    expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
// InvoiceForm validation — Step 1 (Invoice Details)
// ═══════════════════════════════════════════════════════════════
describe('InvoiceForm — Step 1 validation', () => {
  it('shows base required-field errors when clicking Next on empty form', async () => {
    const ref = createRef();
    wrap(<InvoiceForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    await userEvent.click(await screen.findByRole('button', { name: /^next$/i }));

    expect(await screen.findByText('Seller name is required')).toBeInTheDocument();
    expect(screen.getByText('Invoice number is required')).toBeInTheDocument();
    expect(screen.getByText('Purchase amount is required')).toBeInTheDocument();
    expect(screen.getByText('Purchase date is required')).toBeInTheDocument();
  });

  it('shows DIRECT seller KYC errors (default sellerType)', async () => {
    const ref = createRef();
    wrap(<InvoiceForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    await userEvent.click(await screen.findByRole('button', { name: /^next$/i }));

    // Errors from mocked InvoiceSellerFields (DIRECT type is default)
    expect(await screen.findByText('Mobile is required')).toBeInTheDocument();
    expect(screen.getByText('Aadhaar number is required')).toBeInTheDocument();
    expect(screen.getByText('PAN number is required')).toBeInTheDocument();
  });

  it('does NOT advance to step 2 when step 1 has errors', async () => {
    const ref = createRef();
    wrap(<InvoiceForm ref={ref} onSubmit={vi.fn()} />);
    await openForm(ref);

    await userEvent.click(await screen.findByRole('button', { name: /^next$/i }));

    // Vehicle step should NOT be visible
    await screen.findByText('Seller name is required');
    expect(screen.queryByTestId('vehicle-step')).not.toBeInTheDocument();
  });
});
