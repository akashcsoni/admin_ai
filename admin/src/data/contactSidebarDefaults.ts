export const contactSidebarDefaults = {
  methods: [
    {
      title: 'Email us',
      description: 'Best for detailed questions, billing, and account help.',
      value: 'hello@contentai.example',
      href: 'mailto:hello@contentai.example',
      icon: 'email',
    },
    {
      title: 'Response time',
      description: 'We reply to every message within 1–2 business days.',
      value: 'Mon – Fri, 9am – 6pm EST',
      icon: 'clock',
    },
    {
      title: 'Help center',
      description: 'Instant answers about credits, API keys, and services.',
      value: 'Browse FAQ',
      href: '/faq',
      icon: 'help',
    },
  ],
  reasons: [
    'Questions about free plan & credits',
    'Help connecting OpenAI or Anthropic keys',
    'Early access to upcoming services',
    'Partnerships & agency inquiries',
  ],
  reasonsHeading: 'What can we help with?',
  accentTitle: 'Need a faster answer?',
  accentDescription: 'Check our FAQ for instant answers about pricing credits, API keys, and blog creation.',
  accentButtonLabel: 'Visit help center',
  accentButtonLink: '/faq',
  officeNote: 'Remote-first team · Serving creators worldwide',
} as const

export function resolveContactSidebarFields(block: Record<string, unknown>) {
  return {
    methods:
      Array.isArray(block.methods) && block.methods.length > 0
        ? block.methods
        : contactSidebarDefaults.methods,
    reasons:
      Array.isArray(block.reasons) && block.reasons.length > 0
        ? (block.reasons as string[])
        : [...contactSidebarDefaults.reasons],
    reasonsHeading: String(block.reasonsHeading ?? contactSidebarDefaults.reasonsHeading),
    accentTitle: String(block.accentTitle ?? contactSidebarDefaults.accentTitle),
    accentDescription: String(block.accentDescription ?? contactSidebarDefaults.accentDescription),
    accentButtonLabel: String(block.accentButtonLabel ?? contactSidebarDefaults.accentButtonLabel),
    accentButtonLink: String(block.accentButtonLink ?? contactSidebarDefaults.accentButtonLink),
    officeNote: String(block.officeNote ?? contactSidebarDefaults.officeNote),
  }
}
