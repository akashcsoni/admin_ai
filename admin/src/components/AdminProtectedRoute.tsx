import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export function AdminProtectedRoute() {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading admin portal...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}

export function AdminGuestRoute() {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
