import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login'; 
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/adminPanel/Dashboard';
import Staff from './pages/adminPanel/Staff';

import { DropdownProvider } from './context/DropdownContext';
import { ModalLockProvider } from './context/ModalLockContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import OrganizationManagement from './pages/superAdmin/OrganizationManagement';
import AdminManagement from './pages/superAdmin/AdminManagement';

function App() {
  return (
    <AuthProvider>
      <DropdownProvider>
        <ModalLockProvider>
          <Router>
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
                path="/super-admin"
                element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>}
              />
            </Routes>
          </Router>
        </ModalLockProvider>
      </DropdownProvider>
    </AuthProvider>
  );
}

export default App;