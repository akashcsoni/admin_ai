export const ADMIN_ROLES = ['administrator', 'manager', 'staff', 'support', 'editor'] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export type AdminPermission =
  | 'stats.view'
  | 'members.view'
  | 'members.edit'
  | 'credits.view'
  | 'credits.adjust'
  | 'activity.view'
  | 'autoblog.view'
  | 'services.view'
  | 'payment.manage'
  | 'staff.manage'
  | 'cms.view'
  | 'cms.manage'
  | 'support.view'
  | 'support.manage'

export const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  administrator: [
    'stats.view',
    'members.view',
    'members.edit',
    'credits.view',
    'credits.adjust',
    'activity.view',
    'autoblog.view',
    'services.view',
    'payment.manage',
    'staff.manage',
    'cms.view',
    'cms.manage',
    'support.view',
    'support.manage',
  ],
  manager: [
    'stats.view',
    'members.view',
    'members.edit',
    'credits.view',
    'credits.adjust',
    'activity.view',
    'autoblog.view',
    'services.view',
    'cms.view',
    'cms.manage',
    'support.view',
    'support.manage',
  ],
  staff: ['stats.view', 'members.view', 'activity.view', 'autoblog.view', 'services.view'],
  support: ['support.view', 'support.manage', 'members.view', 'credits.view'],
  editor: ['cms.view', 'cms.manage'],
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  administrator: 'Administrator',
  manager: 'Manager',
  staff: 'Staff',
  support: 'Support',
  editor: 'Editor',
}

export function adminHasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function getDefaultAdminPath(role: AdminRole): string {
  if (role === 'support' && adminHasPermission(role, 'support.view')) return '/support'
  if (adminHasPermission(role, 'stats.view')) return '/'
  if (adminHasPermission(role, 'cms.manage')) return '/blog-cms'
  if (adminHasPermission(role, 'members.view')) return '/users'
  if (adminHasPermission(role, 'activity.view')) return '/activity'
  if (adminHasPermission(role, 'autoblog.view')) return '/auto-blog'
  if (adminHasPermission(role, 'credits.view')) return '/credits'
  return '/'
}
