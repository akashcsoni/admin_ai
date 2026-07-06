export type SitePageBlockType =
  | 'hero'
  | 'section'
  | 'statusList'
  | 'guideLinks'
  | 'cta'
  | 'stats'
  | 'featureGrid'
  | 'steps'
  | 'faqList'
  | 'pricingPlans'
  | 'serviceCards'
  | 'blogListing'
  | 'trustBand'
  | 'featuredSpotlight'
  | 'contactForm'
  | 'contactSidebar'
  | 'serviceOverview'
  | 'serviceDetails'
  | 'creditExamples'
  | 'heroPanel'
  | 'storyQuote'
  | 'audienceGrid'
  | 'timeline'
  | 'statusBanner'
  | 'statusMetrics'
  | 'statusGroups'
  | 'statusIncidents'

export type SitePageBlock = {
  id: string
  type: SitePageBlockType
  [key: string]: unknown
}

export const SITE_PAGE_BLOCK_TYPES: { value: SitePageBlockType; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'section', label: 'Section' },
  { value: 'stats', label: 'Stats row' },
  { value: 'trustBand', label: 'Trust band' },
  { value: 'featureGrid', label: 'Feature grid' },
  { value: 'steps', label: 'Steps' },
  { value: 'serviceCards', label: 'Service cards' },
  { value: 'serviceOverview', label: 'Service overview' },
  { value: 'serviceDetails', label: 'Service details' },
  { value: 'featuredSpotlight', label: 'Featured spotlight' },
  { value: 'pricingPlans', label: 'Pricing plans' },
  { value: 'creditExamples', label: 'Credit examples' },
  { value: 'faqList', label: 'FAQ list' },
  { value: 'contactForm', label: 'Contact form' },
  { value: 'contactSidebar', label: 'Contact sidebar' },
  { value: 'heroPanel', label: 'Hero side panel' },
  { value: 'storyQuote', label: 'Story + quote' },
  { value: 'audienceGrid', label: 'Audience grid' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'statusBanner', label: 'Status banner' },
  { value: 'statusMetrics', label: 'Status metrics' },
  { value: 'statusGroups', label: 'Status groups' },
  { value: 'statusIncidents', label: 'Status incidents' },
  { value: 'guideLinks', label: 'Guide links' },
  { value: 'statusList', label: 'Status list' },
  { value: 'blogListing', label: 'Blog listing' },
  { value: 'cta', label: 'Call to action' },
]

export function createEmptyBlock(type: SitePageBlockType, pageKey: string, index: number): SitePageBlock {
  const id = `${pageKey}-${type}-${Date.now()}-${index}`

  switch (type) {
    case 'hero':
      return { id, type, layout: 'marketing', eyebrow: 'Eyebrow', title: 'Page title', lead: 'Introduction text.', primaryButton: { label: 'Get started', to: '/contact' } }
    case 'section':
      return { id, type, heading: 'Section heading', paragraphs: ['Paragraph text.'] }
    case 'stats':
      return { id, type, items: [{ value: '100%', label: 'Your API keys' }] }
    case 'trustBand':
      return { id, type, label: 'Trusted by teams worldwide', items: ['OpenAI', 'Anthropic'] }
    case 'featureGrid':
      return { id, type, heading: 'Features', items: [{ icon: 'seo', title: 'Feature', description: 'Description' }] }
    case 'steps':
      return { id, type, heading: 'How it works', items: [{ number: '01', title: 'Step one', description: 'Details' }] }
    case 'serviceCards':
      return { id, type, items: [{ id: 'service', title: 'Service', shortDescription: 'Short', description: 'Long', features: [], icon: 'blog', available: true }] }
    case 'serviceOverview':
      return { id, type, heading: 'Browse services', description: 'Live services available now.' }
    case 'serviceDetails':
      return { id, type, items: [{ id: 'auto-blog', title: 'Auto Blog', shortDescription: 'Short', description: 'Long', features: [], icon: 'blog', available: true }] }
    case 'featuredSpotlight':
      return { id, type, eyebrow: 'Featured', title: 'Spotlight', description: 'Description.', features: ['Feature'], cta: { label: 'Learn more', to: '/services' } }
    case 'pricingPlans':
      return { id, type, plans: [{ id: 'free', name: 'Free', price: '$0', period: 'forever', description: 'Try Content AI', credits: '1 credit', highlighted: false, cta: 'Start free', ctaLink: '/contact', features: ['One free content piece'] }] }
    case 'creditExamples':
      return { id, type, heading: '$1 = 1 credit', items: [{ amount: 10, credits: 10, label: 'Starter' }] }
    case 'faqList':
      return { id, type, categories: [{ id: 'general', title: 'General', faqs: [{ question: 'Question?', answer: 'Answer.' }] }] }
    case 'contactForm':
      return { id, type, heading: 'Send us a message', description: 'Fill out the form.', submitLabel: 'Send message' }
    case 'contactSidebar':
      return {
        id,
        type,
        methods: [
          { title: 'Email us', description: 'Best for detailed questions, billing, and account help.', value: 'hello@webbywrites.com', href: 'mailto:hello@webbywrites.com', icon: 'email' },
          { title: 'Response time', description: 'We reply to every message within 1–2 business days.', value: 'Mon – Fri, 9am – 6pm EST', icon: 'clock' },
          { title: 'Help center', description: 'Instant answers about credits, API keys, and services.', value: 'Browse FAQ', href: '/faq', icon: 'help' },
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
      }
    case 'heroPanel':
      return { id, type, label: 'At a glance', facts: ['Fact one'], stats: [{ value: '100%', label: 'Your keys' }] }
    case 'storyQuote':
      return { id, type, heading: 'Our story', paragraphs: ['Paragraph.'], quote: 'Quote text.', quoteAttribution: '— Team' }
    case 'audienceGrid':
      return { id, type, heading: 'Who we serve', items: [{ title: 'Creators', description: 'Desc', points: ['Point'] }] }
    case 'timeline':
      return { id, type, heading: 'Timeline', items: [{ year: '2024', title: 'Founded', description: 'Started.' }] }
    case 'statusBanner':
      return { id, type, label: 'All systems operational', message: 'Running normally.', state: 'operational' }
    case 'statusMetrics':
      return { id, type, items: [{ label: 'Uptime', value: '99.9%', detail: '30 days' }] }
    case 'statusGroups':
      return { id, type, groups: [{ id: 'platform', name: 'Platform', services: [{ id: 'web', name: 'Website', description: 'Public site', status: 'operational' }] }] }
    case 'statusIncidents':
      return { id, type, heading: 'Recent incidents', items: [] }
    case 'guideLinks':
      return { id, type, items: [{ title: 'Guide', description: 'Description', to: '/faq' }] }
    case 'statusList':
      return { id, type, items: [{ name: 'Website', status: 'operational' }] }
    case 'blogListing':
      return { id, type, heading: 'Latest articles', description: 'Fresh guides and product updates.' }
    case 'cta':
      return { id, type, title: 'Call to action', description: 'Supporting text.', primary: { label: 'Get started', to: '/contact' } }
  }
}
