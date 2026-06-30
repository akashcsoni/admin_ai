export type StaticPageSection = {
  heading: string
  paragraphs?: string[]
  list?: string[]
}

export type StaticPageStatusItem = {
  name: string
  status: 'operational' | 'degraded' | 'outage'
  detail?: string
}

export type StaticPageGuideLink = {
  title: string
  description: string
  to: string
}

export type StaticPageConfig = {
  path: string
  breadcrumb: string
  eyebrow: string
  title: string
  lead: string
  updated?: string
  sections: StaticPageSection[]
  statusItems?: StaticPageStatusItem[]
  guideLinks?: StaticPageGuideLink[]
  cta?: {
    title: string
    description: string
    primary: { label: string; to: string }
    secondary?: { label: string; to: string }
  }
}

export const staticPages = {
  careers: {
    path: '/careers',
    breadcrumb: 'Careers',
    eyebrow: 'Careers',
    title: 'Build the future of AI content with us',
    lead:
      'We are a small, product-focused team helping creators and marketers use AI on their own terms. If you care about transparency, great UX, and empowering users, we would love to hear from you.',
    sections: [
      {
        heading: 'How we work',
        paragraphs: [
          'Content AI is remote-friendly and async by default. We value clear writing, thoughtful product decisions, and shipping improvements that matter to real users — not vanity metrics.',
          'Everyone on the team uses the product we build. That keeps us honest about what works and what still needs polish.',
        ],
      },
      {
        heading: 'What we look for',
        list: [
          'Product-minded engineers who enjoy full-stack work',
          'Designers who can simplify complex AI workflows',
          'Content strategists who understand SEO and publishing',
          'Support-minded people who enjoy helping customers succeed',
        ],
      },
      {
        heading: 'Open roles',
        paragraphs: [
          'We do not have public openings listed right now, but we are always interested in meeting talented people for future roles.',
          'Send a short note about what you would like to work on, links to your work, and why Content AI resonates with you.',
        ],
      },
    ],
    cta: {
      title: 'Interested in joining?',
      description: 'Email us with your background and the kind of role you are looking for.',
      primary: { label: 'Get in touch', to: '/contact' },
    },
  },
  partnerships: {
    path: '/partnerships',
    breadcrumb: 'Partnerships',
    eyebrow: 'Partnerships',
    title: 'Partner with Content AI',
    lead:
      'We collaborate with agencies, SaaS platforms, hosting providers, and education teams who want to offer AI content workflows without locking customers into proprietary models.',
    sections: [
      {
        heading: 'Partnership types',
        list: [
          'Agency & reseller — white-label workflows for client content programs',
          'Technology — integrations with CMS, CRM, and publishing tools',
          'Affiliate — earn when you refer teams who need scalable content',
          'Education — workshops and curriculum for AI-assisted marketing',
        ],
      },
      {
        heading: 'Why partner with us',
        paragraphs: [
          'Content AI is built around bring-your-own-key architecture. That means your customers keep control of API spend, model choice, and data — a strong fit for agencies and platforms that already serve technical audiences.',
          'We focus on reliable blog and social content workflows today, with more services on the roadmap. Partners get early access to new features and co-marketing where it makes sense.',
        ],
      },
      {
        heading: 'Getting started',
        paragraphs: [
          'Tell us about your audience, integration goals, and timeline. We will respond within two business days with next steps.',
        ],
      },
    ],
    cta: {
      title: 'Explore a partnership',
      description: 'Share your use case and we will follow up with options that fit.',
      primary: { label: 'Contact partnerships', to: '/contact' },
      secondary: { label: 'View pricing', to: '/pricing' },
    },
  },
  guides: {
    path: '/guides',
    breadcrumb: 'Content Guides',
    eyebrow: 'Resources',
    title: 'Content guides & learning paths',
    lead:
      'Practical guides for getting started with AI content, auto blog workflows, API keys, and publishing — whether you are solo or running a team.',
    sections: [
      {
        heading: 'Start here',
        paragraphs: [
          'New to Content AI? Begin with account setup and your first generated post, then explore SEO exports and workspace settings.',
        ],
      },
    ],
    guideLinks: [
      {
        title: 'Getting started with API keys',
        description: 'Connect OpenAI or Anthropic keys and understand how credits work.',
        to: '/faq',
      },
      {
        title: 'Auto blog creation walkthrough',
        description: 'Categories, prompts, drafts, and publishing workflows explained.',
        to: '/services#auto-blog',
      },
      {
        title: 'Blog articles & deep dives',
        description: 'Long-form tips on SEO, automation, and content strategy.',
        to: '/blog',
      },
      {
        title: 'Pricing & credits FAQ',
        description: 'How billing, free credits, and pay-as-you-go usage fit together.',
        to: '/pricing',
      },
    ],
    cta: {
      title: 'Need hands-on help?',
      description: 'Our help center and support team can answer account-specific questions.',
      primary: { label: 'Visit help center', to: '/faq' },
      secondary: { label: 'Contact support', to: '/contact' },
    },
  },
  status: {
    path: '/status',
    breadcrumb: 'Status',
    eyebrow: 'System status',
    title: 'Platform status',
    lead:
      'Current operational status for Content AI services. We update this page when incidents affect generation, billing, or account access.',
    updated: 'Last checked: all systems operational',
    sections: [
      {
        heading: 'Service health',
        paragraphs: [
          'If you experience issues not reflected here, contact support with your account email and a short description of what happened.',
        ],
      },
    ],
    statusItems: [
      { name: 'Website & dashboard', status: 'operational', detail: 'App, account, and billing pages' },
      { name: 'Authentication', status: 'operational', detail: 'Sign in, sign up, and sessions' },
      { name: 'Auto blog generation', status: 'operational', detail: 'Draft creation and exports' },
      { name: 'Social content generation', status: 'operational', detail: 'Post drafts and image settings' },
      { name: 'Payments & credits', status: 'operational', detail: 'Checkout and credit balance' },
      { name: 'Support tickets', status: 'operational', detail: 'Ticket creation and replies' },
    ],
    cta: {
      title: 'Report an issue',
      description: 'Open a support ticket from your account or email us if you cannot sign in.',
      primary: { label: 'Contact support', to: '/contact' },
    },
  },
  privacy: {
    path: '/privacy',
    breadcrumb: 'Privacy Policy',
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    lead:
      'This policy explains what information Content AI collects, how we use it, and the choices you have. We designed our product so you control your AI provider keys and generated content.',
    updated: 'Effective date: June 1, 2026',
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: [
          'Account information such as your name, email address, and password (stored securely). Usage data including credits consumed, generation activity, and support tickets. Payment information processed by our payment provider — we do not store full card numbers on our servers.',
          'When you connect AI API keys, they are stored encrypted and used only to run generations you request. Generated content is stored in your workspace so you can export and manage it.',
        ],
      },
      {
        heading: 'How we use information',
        list: [
          'Provide, maintain, and improve Content AI services',
          'Process billing and credit purchases',
          'Respond to support requests and security incidents',
          'Send product updates and account notices you opt into',
          'Comply with legal obligations and enforce our terms',
        ],
      },
      {
        heading: 'Sharing & retention',
        paragraphs: [
          'We do not sell your personal information. We share data with service providers who help us operate the platform (hosting, email, payments) under contractual safeguards. AI providers receive only what is necessary to fulfill your generation requests when you use your own keys.',
          'We retain account data while your account is active and for a reasonable period afterward unless deletion is requested or required by law.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You may update profile details in account settings, unsubscribe from marketing emails, and request account deletion by contacting us. You can revoke API keys at any time from your workspace or directly with your AI provider.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'Questions about this policy? Email us at hello@contentai.example and we will respond within a reasonable timeframe.',
        ],
      },
    ],
  },
  terms: {
    path: '/terms',
    breadcrumb: 'Terms of Service',
    eyebrow: 'Legal',
    title: 'Terms of Service',
    lead:
      'These terms govern your use of Content AI. By creating an account or using our services, you agree to the conditions below.',
    updated: 'Effective date: June 1, 2026',
    sections: [
      {
        heading: 'Using Content AI',
        paragraphs: [
          'You must provide accurate account information and keep your credentials secure. You are responsible for activity under your account and for complying with the terms of your AI provider when using your API keys.',
          'Content AI provides workflow tools for generating and exporting content. We do not guarantee specific SEO rankings, traffic, or business outcomes from generated material.',
        ],
      },
      {
        heading: 'Credits & billing',
        paragraphs: [
          'Credits are consumed when you create content through the platform according to the pricing shown at purchase. Free credits and promotions may have additional limits described at signup. Refunds are handled according to our support policy and applicable law.',
        ],
      },
      {
        heading: 'Acceptable use',
        list: [
          'Do not use the service for unlawful, harmful, or abusive content',
          'Do not attempt to bypass security, quotas, or billing',
          'Do not resell access in ways that violate these terms',
          'Respect intellectual property and third-party rights',
        ],
      },
      {
        heading: 'Content ownership',
        paragraphs: [
          'You retain rights to content you generate subject to your agreements with AI providers and applicable law. We claim no ownership over your outputs. You grant us a limited license to host and process content solely to operate the service.',
        ],
      },
      {
        heading: 'Disclaimers & liability',
        paragraphs: [
          'The service is provided as is to the extent permitted by law. Our liability is limited to the amount you paid us in the twelve months before a claim, except where prohibited by law.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: [
          'We may update these terms from time to time. Material changes will be communicated via email or in-product notice. Continued use after changes take effect constitutes acceptance.',
        ],
      },
    ],
  },
  cookies: {
    path: '/cookies',
    breadcrumb: 'Cookie Policy',
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    lead:
      'This page describes how Content AI uses cookies and similar technologies on our website and application.',
    updated: 'Effective date: June 1, 2026',
    sections: [
      {
        heading: 'What are cookies?',
        paragraphs: [
          'Cookies are small text files stored on your device when you visit a site. They help remember preferences, keep you signed in, and understand how the product is used.',
        ],
      },
      {
        heading: 'Cookies we use',
        list: [
          'Essential — session and authentication cookies required to sign in and use your account',
          'Preferences — settings such as theme or dismissed notices',
          'Analytics — aggregated usage to improve performance and UX (where enabled)',
        ],
      },
      {
        heading: 'Managing cookies',
        paragraphs: [
          'You can control cookies through your browser settings. Blocking essential cookies may prevent you from signing in or using core features. Where required by law, we will request consent before non-essential cookies are set.',
        ],
      },
      {
        heading: 'Updates',
        paragraphs: [
          'We may revise this policy when our practices change. Check this page periodically for the latest information.',
        ],
      },
    ],
  },
  security: {
    path: '/security',
    breadcrumb: 'Security',
    eyebrow: 'Trust & safety',
    title: 'Security at Content AI',
    lead:
      'We take a practical approach to security: encrypt sensitive data, minimize what we store, and design around bring-your-own-key so your AI usage stays under your control.',
    sections: [
      {
        heading: 'Data protection',
        paragraphs: [
          'API keys are encrypted at rest. Passwords are hashed using industry-standard algorithms. Connections to our application use HTTPS in production environments.',
        ],
      },
      {
        heading: 'Access controls',
        paragraphs: [
          'Production access is limited to authorized personnel with a business need. We use role-based permissions internally and audit significant configuration changes.',
        ],
      },
      {
        heading: 'Your responsibilities',
        list: [
          'Use a strong, unique password and enable account recovery options',
          'Rotate API keys if you suspect compromise',
          'Do not share workspace credentials with untrusted parties',
          'Report suspected vulnerabilities or incidents promptly',
        ],
      },
      {
        heading: 'Reporting issues',
        paragraphs: [
          'If you discover a security concern, contact us at hello@contentai.example with details and reproduction steps. We investigate good-faith reports and will not retaliate against responsible disclosure.',
        ],
      },
    ],
    cta: {
      title: 'Questions about security?',
      description: 'Reach out if you need a security questionnaire or vendor review for your organization.',
      primary: { label: 'Contact us', to: '/contact' },
    },
  },
} satisfies Record<string, StaticPageConfig>

export type StaticPageKey = keyof typeof staticPages
