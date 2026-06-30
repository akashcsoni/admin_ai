export const siteConfig = {
  name: 'Content AI',
  tagline: 'Smart Content Creation',
  description:
    'Generate blogs and marketing content with your own AI API keys. Content AI helps creators and teams scale content while staying in control of cost and data.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://contentai.example',
  locale: 'en_US',
  twitterHandle: '@contentai',
  contactEmail: 'hello@contentai.example',
  themeColor: '#0d0d0d',
} as const

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url.replace(/\/$/, '')}${normalizedPath}`
}
