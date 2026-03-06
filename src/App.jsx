import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Box, CircularProgress } from '@mui/material';
import { DropdownProvider } from './context/DropdownContext';
import { ModalLockProvider } from './context/ModalLockContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// ── Lazy-loaded pages (code splitting) ────────────────────────
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/adminPanel/Dashboard'));
const Staff = lazy(() => import('./pages/adminPanel/Staff'));
const Invoice = lazy(() => import('./pages/adminPanel/Invoice'));
const Inventory = lazy(() => import('./pages/adminPanel/Inventory'));
const AuditLogs = lazy(() => import('./pages/adminPanel/AuditLogs'));
const VehicleCompliance = lazy(() => import('./pages/adminPanel/VehicleCompliance'));
const SuperAdminDashboard = lazy(() => import('./pages/superAdmin/SuperAdminDashboard'));
const OrganizationManagement = lazy(() => import('./pages/superAdmin/OrganizationManagement'));
const AdminManagement = lazy(() => import('./pages/superAdmin/AdminManagement'));
const SuperAdminAuditLogs = lazy(() => import('./pages/superAdmin/SuperAdminAuditLogs'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ── Suspense fallback ──────────────────────────────────────────
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <CircularProgress color="secondary" />
  </Box>
);

function App() {
  return (
    <ErrorBoundary fullScreen>
      <AuthProvider>
        <DropdownProvider>
          <ModalLockProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: { fontFamily: 'inherit', fontSize: '14px' },
                success: { iconTheme: { primary: 'var(--color-secondary-main)', secondary: '#fff' } },
              }}
            />
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute>
                        <Staff />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/invoices"
                    element={
                      <ProtectedRoute>
                        <Invoice />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit-logs"
                    element={
                      <ProtectedRoute>
                        <AuditLogs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vehicle-compliance"
                    element={
                      <ProtectedRoute>
                        <VehicleCompliance />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/super-admin/organizations"
                    element={
                      <ProtectedRoute>
                        <OrganizationManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/super-admin/admins"
                    element={
                      <ProtectedRoute>
                        <AdminManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/super-admin/audit-logs"
                    element={
                      <ProtectedRoute>
                        <SuperAdminAuditLogs />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/super-admin"
                    element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>}
                  />
                  {/* Catch-all 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
          </ModalLockProvider>
        </DropdownProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;