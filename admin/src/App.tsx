import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminGuestRoute, AdminProtectedRoute } from './components/AdminProtectedRoute'
import AdminActivityPage from './pages/AdminActivityPage'
import AdminAutoBlogPage from './pages/AdminAutoBlogPage'
import AdminSupportPage from './pages/AdminSupportPage'
import AdminSupportTicketPage from './pages/AdminSupportTicketPage'
import AdminBlogEditPage from './pages/AdminBlogEditPage'
import AdminBlogPage from './pages/AdminBlogPage'
import AdminBillingPage from './pages/AdminBillingPage'
import AdminCreditsPage from './pages/AdminCreditsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminInvoiceSettingsPage from './pages/AdminInvoiceSettingsPage'
import AdminLayout from './pages/AdminLayout'
import AdminPaymentSettingsPage from './pages/AdminPaymentSettingsPage'
import AdminServicesPage from './pages/AdminServicesPage'
import AdminStaffPage from './pages/AdminStaffPage'
import AdminSignInPage from './pages/AdminSignInPage'
import AdminPermissionRoute from './components/AdminPermissionRoute'
import AdminUserDetailPage from './pages/AdminUserDetailPage'
import AdminUsersPage from './pages/AdminUsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminGuestRoute />}>
          <Route path="signin" element={<AdminSignInPage />} />
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              index
              element={
                <AdminPermissionRoute permission="stats.view">
                  <AdminDashboardPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="users"
              element={
                <AdminPermissionRoute permission="members.view">
                  <AdminUsersPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="users/:userId"
              element={
                <AdminPermissionRoute permission="members.view">
                  <AdminUserDetailPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="staff"
              element={
                <AdminPermissionRoute permission="staff.manage">
                  <AdminStaffPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="support"
              element={
                <AdminPermissionRoute permission="support.view">
                  <AdminSupportPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="support/:ticketId"
              element={
                <AdminPermissionRoute permission="support.view">
                  <AdminSupportTicketPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="blog-cms"
              element={
                <AdminPermissionRoute permission="cms.view">
                  <AdminBlogPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="blog-cms/:postId"
              element={
                <AdminPermissionRoute permission="cms.manage">
                  <AdminBlogEditPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="billing"
              element={
                <AdminPermissionRoute permission="credits.view">
                  <AdminBillingPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="credits"
              element={
                <AdminPermissionRoute permission="credits.view">
                  <AdminCreditsPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="auto-blog"
              element={
                <AdminPermissionRoute permission="autoblog.view">
                  <AdminAutoBlogPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="activity"
              element={
                <AdminPermissionRoute permission="activity.view">
                  <AdminActivityPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="services"
              element={
                <AdminPermissionRoute permission="services.view">
                  <AdminServicesPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="settings/invoice"
              element={
                <AdminPermissionRoute permission="payment.manage">
                  <AdminInvoiceSettingsPage />
                </AdminPermissionRoute>
              }
            />
            <Route
              path="settings/payment"
              element={
                <AdminPermissionRoute permission="payment.manage">
                  <AdminPaymentSettingsPage />
                </AdminPermissionRoute>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
