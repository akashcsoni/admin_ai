export type FooterLink = {
  label: string
  to: string
  external?: boolean
}

export type FooterColumn = {
  title: string
  links: FooterLink[]
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'All Services', to: '/services' },
      { label: 'Auto Blog Creation', to: '/services#auto-blog' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Partnerships', to: '/partnerships' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'Help Center', to: '/faq' },
      { label: 'Content Guides', to: '/guides' },
      { label: 'Status Page', to: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '/cookies' },
      { label: 'Security', to: '/security' },
    ],
  },
]

export const footerSocialLinks = [
  { label: 'Twitter / X', href: 'https://x.com/contentai', icon: 'x-twitter' as const },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/contentai', icon: 'linkedin' as const },
  { label: 'GitHub', href: 'https://github.com/contentai', icon: 'github' as const },
  { label: 'YouTube', href: 'https://youtube.com/@contentai', icon: 'youtube' as const },
]

export const footerContactInfo = [
  { label: 'Email', value: 'hello@contentai.example', href: 'mailto:hello@contentai.example' },
  { label: 'Support hours', value: 'Mon – Fri, 9am – 6pm EST' },
  { label: 'Response time', value: 'Within 1–2 business days' },
]

export const footerHighlights = [
  'Bring your own AI API keys',
  'OpenAI & Anthropic supported',
  'SEO-ready blog exports',
  'No hidden token markup',
]
