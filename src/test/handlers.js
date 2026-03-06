import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// ── Mock data ──────────────────────────────────────────────────
const mockUser = {
  _id: 'usr_001',
  name: 'Test Admin',
  email: 'admin@test.com',
  role: 'ADMIN',
};

const mockTokens = {
  accessToken: 'mock_access_token_xyz',
  refreshToken: 'mock_refresh_token_xyz',
};

// ── API Handlers ───────────────────────────────────────────────
export const handlers = [
  // Auth - Login
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'admin@test.com' && body.password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: { user: mockUser, ...mockTokens },
        message: 'Login successful',
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Auth - Logout
  http.post(`${BASE_URL}/auth/logout`, () =>
    HttpResponse.json({ success: true, message: 'Logged out' })
  ),

  // Auth - Refresh Token
  http.post(`${BASE_URL}/auth/refresh`, () =>
    HttpResponse.json({
      success: true,
      data: { accessToken: 'new_mock_access_token' },
    })
  ),

  // Users - List
  http.get(`${BASE_URL}/users`, () =>
    HttpResponse.json({
      success: true,
      data: [mockUser],
      totalCount: 1,
    })
  ),

  // Inventory - List
  http.get(`${BASE_URL}/inventory`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      totalCount: 0,
    })
  ),

  // Invoices - List
  http.get(`${BASE_URL}/invoices`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      totalCount: 0,
    })
  ),

  // Vehicle Compliance - List
  http.get(`${BASE_URL}/vehicle-compliance`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      totalCount: 0,
    })
  ),

  // Audit Logs - List
  http.get(`${BASE_URL}/audit-logs`, () =>
    HttpResponse.json({
      success: true,
      data: [],
      totalCount: 0,
    })
  ),
];

// Create and export the MSW server instance
export const server = setupServer(...handlers);
