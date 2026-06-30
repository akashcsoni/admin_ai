export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

export type StatusService = {
  id: string
  name: string
  description: string
  status: ServiceStatus
}

export type StatusGroup = {
  id: string
  name: string
  services: StatusService[]
}

export type StatusIncident = {
  id: string
  title: string
  status: 'resolved' | 'investigating' | 'monitoring'
  date: string
  summary: string
}

export type StatusMetric = {
  label: string
  value: string
  detail: string
}

export const overallStatus = {
  state: 'operational' as ServiceStatus,
  label: 'All systems operational',
  message: 'Content AI is running normally. No active incidents.',
  lastUpdated: 'Updated every 5 minutes',
}

export const statusMetrics: StatusMetric[] = [
  { label: '30-day uptime', value: '99.98%', detail: 'Platform & API' },
  { label: 'Active incidents', value: '0', detail: 'None reported' },
  { label: 'Avg. response', value: '< 2s', detail: 'Generation API' },
  { label: 'Last incident', value: 'None', detail: 'Past 90 days' },
]

export const statusGroups: StatusGroup[] = [
  {
    id: 'platform',
    name: 'Platform',
    services: [
      {
        id: 'website',
        name: 'Website & marketing pages',
        description: 'Home, blog, pricing, and public content',
        status: 'operational',
      },
      {
        id: 'dashboard',
        name: 'Account dashboard',
        description: 'Account home, settings, and navigation',
        status: 'operational',
      },
      {
        id: 'auth',
        name: 'Authentication',
        description: 'Sign in, sign up, sessions, and password reset',
        status: 'operational',
      },
    ],
  },
  {
    id: 'generation',
    name: 'Content generation',
    services: [
      {
        id: 'auto-blog',
        name: 'Auto Blog',
        description: 'Draft generation, topics, categories, and exports',
        status: 'operational',
      },
      {
        id: 'social',
        name: 'Social Content',
        description: 'Post drafts, platform formats, and image settings',
        status: 'operational',
      },
      {
        id: 'images',
        name: 'Featured & post images',
        description: 'AI image generation when enabled in workspace',
        status: 'operational',
      },
    ],
  },
  {
    id: 'billing',
    name: 'Billing & account',
    services: [
      {
        id: 'payments',
        name: 'Payments & credits',
        description: 'Checkout, credit balance, and invoices',
        status: 'operational',
      },
      {
        id: 'usage',
        name: 'Usage tracking',
        description: 'Activity logs and credit consumption stats',
        status: 'operational',
      },
    ],
  },
  {
    id: 'support',
    name: 'Support',
    services: [
      {
        id: 'tickets',
        name: 'Support tickets',
        description: 'Ticket creation, replies, and notifications',
        status: 'operational',
      },
      {
        id: 'email',
        name: 'Email delivery',
        description: 'Verification codes and account notifications',
        status: 'operational',
      },
    ],
  },
]

export const resolvedIncidents: StatusIncident[] = []

export const statusHelpLinks = [
  {
    title: 'Help center',
    description: 'Browse FAQs on credits, API keys, and services.',
    to: '/faq',
  },
  {
    title: 'Contact support',
    description: 'Reach our team for billing or technical issues.',
    to: '/contact',
  },
  {
    title: 'Open a ticket',
    description: 'Signed-in users can track issues from their account.',
    to: '/signin',
  },
]

export const statusLabels: Record<ServiceStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  maintenance: 'Maintenance',
}

export function getOverallStatusFromGroups(groups: StatusGroup[]): ServiceStatus {
  const statuses = groups.flatMap((group) => group.services.map((service) => service.status))
  if (statuses.includes('outage')) return 'outage'
  if (statuses.includes('degraded')) return 'degraded'
  if (statuses.includes('maintenance')) return 'maintenance'
  return 'operational'
}
