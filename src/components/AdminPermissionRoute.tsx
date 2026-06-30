import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  adminHasPermission,
  getDefaultAdminPath,
  type AdminPermission,
} from '../lib/adminPermissions'

type AdminPermissionRouteProps = {
  permission: AdminPermission
  children: React.ReactNode
}

export default function AdminPermissionRoute({ permission, children }: AdminPermissionRouteProps) {
  const { admin } = useAdminAuth()

  if (!admin) return null

  if (!adminHasPermission(admin.role, permission)) {
    return <Navigate to={getDefaultAdminPath(admin.role)} replace />
  }

  return children
}
