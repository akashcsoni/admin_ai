import { siteConfig } from '../config/site'

export const contactSubjects = [
  { value: 'general', label: 'General inquiry' },
  { value: 'sales', label: 'Sales & pricing' },
  { value: 'support', label: 'Technical support' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'waitlist', label: 'Waitlist for new services' },
] as const

export type ContactSubject = (typeof contactSubjects)[number]['value']

export const contactMethods = [
  {
    title: 'Email us',
    description: 'Best for detailed questions, billing, and account help.',
    value: siteConfig.contactEmail,
    href: `mailto:${siteConfig.contactEmail}`,
    icon: 'email' as const,
  },
  {
    title: 'Response time',
    description: 'We reply to every message within 1–2 business days.',
    value: 'Mon – Fri, 9am – 6pm EST',
    icon: 'clock' as const,
  },
  {
    title: 'Help center',
    description: 'Instant answers about credits, API keys, and services.',
    value: 'Browse FAQ',
    href: '/faq',
    icon: 'help' as const,
  },
]

export const contactReasons = [
  'Questions about free plan & credits',
  'Help connecting OpenAI or Anthropic keys',
  'Early access to upcoming services',
  'Partnerships & agency inquiries',
]
