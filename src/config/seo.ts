import { absoluteUrl, siteConfig } from './site'

export type PageSeo = {
  title: string
  description: string
  path: string
  keywords: string[]
}

export const pageSeo = {
  home: {
    title: `${siteConfig.name} — AI Blog & Content Creation with Your API Keys`,
    description:
      'Create SEO-friendly blogs and content using your own OpenAI or Anthropic API keys. Content AI automates drafting while you control cost, privacy, and quality.',
    path: '/',
    keywords: [
      'AI blog generator',
      'auto blog creation',
      'bring your own API key',
      'OpenAI blog writer',
      'AI content platform',
      'SEO blog generator',
    ],
  },
  services: {
    title: 'AI Content Services — Blog, Social, SEO & More',
    description:
      'Explore six AI-powered content services: auto blog creation, social posts, SEO optimization, repurposing, newsletters, and scheduling — all with your own API keys.',
    path: '/services',
    keywords: [
      'AI content services',
      'automated blog writing',
      'AI social media content',
      'content repurposing tool',
      'AI newsletter generator',
    ],
  },
  about: {
    title: 'About Content AI — Your Keys, Your Content',
    description:
      'Learn how Content AI helps creators and teams generate content with their preferred AI providers without giving up control of API keys, budget, or brand voice.',
    path: '/about',
    keywords: [
      'about Content AI',
      'AI writing platform',
      'BYOK AI content',
      'content automation company',
    ],
  },
  pricing: {
    title: 'Pricing — Free Content + Pay-as-you-go Credits',
    description:
      'Start with 1 free content on signup. Add credits at $1 each — 1 credit creates 1 content piece. Add $20, get 20 credits. Use your own AI API keys.',
    path: '/pricing',
    keywords: [
      'Content AI pricing',
      'AI content credits',
      'pay as you go blog generator',
      'free AI blog trial',
      'content creation credits',
    ],
  },
  contact: {
    title: 'Contact Content AI — Support, Sales & Partnerships',
    description:
      'Contact Content AI for help with credits, API keys, pricing, partnerships, or technical support. We respond within 1–2 business days.',
    path: '/contact',
    keywords: [
      'contact Content AI',
      'Content AI support',
      'AI content help',
      'blog generator contact',
      'Content AI sales',
    ],
  },
  faq: {
    title: 'FAQ & Help Center — Content AI Credits, API Keys & Services',
    description:
      'Find answers about Content AI pricing credits, free plan, API keys, auto blog creation, exports, and support. Search our help center or browse by topic.',
    path: '/faq',
    keywords: [
      'Content AI FAQ',
      'AI content credits help',
      'API keys blog generator',
      'free content credit',
      'Content AI help center',
    ],
  },
  signUp: {
    title: 'Sign Up — Create Your Content AI Account',
    description:
      'Create a Content AI account with email verification code and password. Get 1 free content credit and use your own AI API keys.',
    path: '/signup',
    keywords: ['Content AI sign up', 'create Content AI account', 'AI content registration'],
  },
  signIn: {
    title: 'Sign In — Content AI Account Login',
    description:
      'Sign in to Content AI with your email and password or one-time verification code.',
    path: '/signin',
    keywords: ['Content AI sign in', 'Content AI login', 'AI content account'],
  },
  account: {
    title: 'My Account — Content AI Dashboard',
    description: 'Manage your Content AI account, content credits, and profile.',
    path: '/account',
    keywords: ['Content AI account', 'content credits dashboard'],
  },
  billing: {
    title: 'Billing — Buy Content Credits',
    description:
      'Top up your Content AI account with credits. $1 per credit, 1 credit creates 1 content piece.',
    path: '/account/billing',
    keywords: ['buy content credits', 'Content AI billing', 'top up credits'],
  },
  usage: {
    title: 'Usage — Content Credits & Activity',
    description:
      'Track content credits used, AI tokens, and generation activity across your Content AI account.',
    path: '/account/usage',
    keywords: ['Content AI usage', 'content credits used', 'AI content activity'],
  },
  settings: {
    title: 'Account Settings — Profile & Security',
    description: 'Update your Content AI profile, change your password, and manage account security.',
    path: '/account/settings',
    keywords: ['Content AI account settings', 'change password', 'profile settings'],
  },
  blog: {
    title: 'Blog — AI Content Tips & Guides',
    description:
      'Read SEO-friendly articles on AI content creation, blog automation, and marketing workflows from the Content AI team.',
    path: '/blog',
    keywords: [
      'Content AI blog',
      'AI content tips',
      'SEO blog guides',
      'AI writing articles',
      'content marketing blog',
    ],
  },
  support: {
    title: 'Support — Help & Tickets',
    description: 'Create and track support tickets for billing, credits, technical issues, and account help.',
    path: '/account/support',
    keywords: ['Content AI support', 'help ticket', 'billing support', 'account help'],
  },
  careers: {
    title: 'Careers — Join the Content AI Team',
    description:
      'Explore careers at Content AI. We are building AI content tools that put creators in control of their API keys, budget, and brand.',
    path: '/careers',
    keywords: ['Content AI careers', 'AI startup jobs', 'remote content AI jobs'],
  },
  partnerships: {
    title: 'Partnerships — Agencies, Integrations & Affiliates',
    description:
      'Partner with Content AI for agency workflows, technology integrations, affiliate programs, and education.',
    path: '/partnerships',
    keywords: ['Content AI partnerships', 'AI content reseller', 'agency AI integration'],
  },
  guides: {
    title: 'Content Guides — AI Writing & Auto Blog Resources',
    description:
      'Learn how to use Content AI with guides on API keys, auto blog creation, SEO exports, credits, and publishing workflows.',
    path: '/guides',
    keywords: ['AI content guides', 'auto blog tutorial', 'Content AI help resources'],
  },
  status: {
    title: 'Status — Content AI Platform Health',
    description:
      'Check operational status for Content AI website, authentication, content generation, billing, and support.',
    path: '/status',
    keywords: ['Content AI status', 'platform uptime', 'service health'],
  },
  privacy: {
    title: 'Privacy Policy — Content AI',
    description:
      'Read how Content AI collects, uses, and protects your account data, API keys, and generated content.',
    path: '/privacy',
    keywords: ['Content AI privacy policy', 'data protection', 'API key privacy'],
  },
  terms: {
    title: 'Terms of Service — Content AI',
    description:
      'Terms governing your use of Content AI, including credits, acceptable use, content ownership, and billing.',
    path: '/terms',
    keywords: ['Content AI terms of service', 'user agreement', 'content AI legal'],
  },
  cookies: {
    title: 'Cookie Policy — Content AI',
    description:
      'How Content AI uses essential, preference, and analytics cookies on our website and application.',
    path: '/cookies',
    keywords: ['Content AI cookie policy', 'website cookies', 'tracking preferences'],
  },
  security: {
    title: 'Security — How Content AI Protects Your Data',
    description:
      'Learn about encryption, API key handling, access controls, and how to report security issues at Content AI.',
    path: '/security',
    keywords: ['Content AI security', 'API key encryption', 'data security'],
  },
} satisfies Record<string, PageSeo>

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: absoluteUrl('/'),
  description: siteConfig.description,
  email: siteConfig.contactEmail,
  sameAs: [],
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: absoluteUrl('/'),
  description: siteConfig.description,
  inLanguage: 'en-US',
}

export function blogPostingJsonLd(post: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified: string
  authorName?: string | null
  image?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: absoluteUrl(post.path),
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    ...(post.image?.trim()
      ? { image: [post.image.trim()] }
      : {}),
    author: {
      '@type': 'Person',
      name: post.authorName?.trim() || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: absoluteUrl('/'),
    },
    mainEntityOfPage: absoluteUrl(post.path),
  }
}

export function blogListJsonLd(posts: { title: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${siteConfig.name} Blog`,
    url: absoluteUrl('/blog'),
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: absoluteUrl(post.path),
    })),
  }
}
