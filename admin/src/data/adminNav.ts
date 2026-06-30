import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { AdminPermission } from '../lib/adminPermissions'
import {
  faBolt,
  faChartLine,
  faClockRotateLeft,
  faCoins,
  faCreditCard,
  faGaugeHigh,
  faFileInvoice,
  faGear,
  faHeadset,
  faNewspaper,
  faPenToSquare,
  faUserShield,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'

export type AdminNavItem = {
  id: string
  label: string
  path: string
  icon: IconDefinition
  description: string
  permission?: AdminPermission
}

export const adminNavItems: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: faGaugeHigh,
    description: 'Platform overview and key metrics',
    permission: 'stats.view',
  },
  {
    id: 'users',
    label: 'Users',
    path: '/users',
    icon: faUsers,
    description: 'Manage front-end member accounts',
    permission: 'members.view',
  },
  {
    id: 'staff',
    label: 'Staff',
    path: '/staff',
    icon: faUserShield,
    description: 'Admin portal team and roles',
    permission: 'staff.manage',
  },
  {
    id: 'billing',
    label: 'Billing',
    path: '/billing',
    icon: faCreditCard,
    description: 'Revenue, purchases, and payment overview',
    permission: 'credits.view',
  },
  {
    id: 'credits',
    label: 'Credits',
    path: '/credits',
    icon: faCoins,
    description: 'Adjust balances and view transactions',
    permission: 'credits.view',
  },
  {
    id: 'support',
    label: 'Support',
    path: '/support',
    icon: faHeadset,
    description: 'Member support tickets and replies',
    permission: 'support.view',
  },
  {
    id: 'blog-cms',
    label: 'Site blog',
    path: '/blog-cms',
    icon: faNewspaper,
    description: 'Publish SEO articles on the public website',
    permission: 'cms.view',
  },
  {
    id: 'auto-blog',
    label: 'Auto Blog',
    path: '/auto-blog',
    icon: faPenToSquare,
    description: 'Posts and generation logs across users',
    permission: 'autoblog.view',
  },
  {
    id: 'activity',
    label: 'Activity',
    path: '/activity',
    icon: faClockRotateLeft,
    description: 'All member actions across services',
    permission: 'activity.view',
  },
  {
    id: 'services',
    label: 'Services',
    path: '/services',
    icon: faBolt,
    description: 'Service catalog and credit cost settings',
    permission: 'services.view',
  },
  {
    id: 'invoice',
    label: 'Invoices',
    path: '/settings/invoice',
    icon: faFileInvoice,
    description: 'Company info shown on member invoices',
    permission: 'payment.manage',
  },
  {
    id: 'payment',
    label: 'Payment',
    path: '/settings/payment',
    icon: faGear,
    description: 'Stripe and Razorpay test / live keys',
    permission: 'payment.manage',
  },
]

export const appUrl = import.meta.env.VITE_APP_URL ?? 'http://localhost:5173'

export const adminSecondaryNav: AdminNavItem[] = [
  {
    id: 'app',
    label: 'Main app',
    path: appUrl,
    icon: faChartLine,
    description: 'Open the public Content AI app',
  },
]
