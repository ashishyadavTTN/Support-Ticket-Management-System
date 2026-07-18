import { Routes, Route } from 'react-router-dom';
import {
  PermissionRoute,
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRedirect,
} from './components/auth/RouteGuards';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RepresentativeDashboard from './pages/dashboards/RepresentativeDashboard';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import RepresentativesPage from './pages/admin/RepresentativesPage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import TicketListPage from './pages/TicketListPage';
import TicketDetailPage from './pages/TicketDetailPage';
import CreateTicketPage from './pages/CreateTicketPage';
import { ROLES } from './constants/roles';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <UnauthorizedPage />
          </ProtectedRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<RoleRedirect />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <RepresentativesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rep/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.REPRESENTATIVE]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rep/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.REPRESENTATIVE]}>
                <RepresentativeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route
            path="/tickets/new"
            element={
              <PermissionRoute permission="canCreateTickets">
                <CreateTicketPage />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
