import type { ContentIconName } from '../components/ContentIcon'

export type FaqItem = {
  question: string
  answer: string
}

export type FaqCategory = {
  id: string
  title: string
  description: string
  icon: ContentIconName
  faqs: FaqItem[]
}

export const faqCategories: FaqCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'Basics about Content AI and how to begin.',
    icon: 'platform',
    faqs: [
      {
        question: 'What is Content AI?',
        answer:
          'Content AI is a platform that helps you generate blogs and marketing content using your own AI API keys. You stay in control of cost, models, and data while we handle prompts, structure, and export.',
      },
      {
        question: 'How do I get started?',
        answer:
          'Create a free account, connect your OpenAI or Anthropic API key, and use your 1 free content credit to generate your first draft. Add more credits anytime from the pricing page.',
      },
      {
        question: 'Who is Content AI for?',
        answer:
          'Solo bloggers, marketing teams, freelancers, and agencies who want AI-powered content workflows without being locked into expensive all-in-one subscriptions.',
      },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & credits',
    description: 'Free plan, credits, and how billing works.',
    icon: 'keys',
    faqs: [
      {
        question: 'How does the free plan work?',
        answer:
          'Every new account includes 1 free content credit. You can create one piece of content at no charge — no credit card required.',
      },
      {
        question: 'What counts as 1 content?',
        answer:
          'One content credit is used each time you generate a complete piece of content — such as a full blog draft — from your account.',
      },
      {
        question: 'How do credits work when I pay?',
        answer:
          'Credits are added to your account at $1 per credit. If you add $20, you receive 20 credits and can create 20 content pieces. Credits do not expire.',
      },
      {
        question: 'Is there a monthly subscription?',
        answer:
          'No. Content AI uses a pay-as-you-go credit model. Top up your account whenever you need more content — no recurring fees required.',
      },
      {
        question: 'Do credits cover AI API costs?',
        answer:
          'No. Credits cover platform usage for content generation on Content AI. AI token costs are billed separately by your provider (OpenAI, Anthropic, etc.) through your own API keys.',
      },
    ],
  },
  {
    id: 'api-keys',
    title: 'API keys & security',
    description: 'Using your own keys safely and securely.',
    icon: 'keys',
    faqs: [
      {
        question: 'Do I need my own AI API keys?',
        answer:
          'Yes. Content AI is designed to work with your own OpenAI, Anthropic, or compatible API keys. This keeps you in full control of costs and data privacy.',
      },
      {
        question: 'Are my API keys stored securely?',
        answer:
          'Keys are encrypted at rest and used only to make requests on your behalf. You can revoke access at any time from your account dashboard.',
      },
      {
        question: 'Which AI providers are supported?',
        answer:
          'We support OpenAI and Anthropic out of the box. Any OpenAI-compatible API endpoint can also be configured for custom providers.',
      },
      {
        question: 'Why use my own keys instead of a subscription?',
        answer:
          'You choose the model, control spend directly with your provider, and avoid hidden token markups. Content AI charges only for platform credits — not inflated AI usage fees.',
      },
    ],
  },
  {
    id: 'services',
    title: 'Services & content',
    description: 'Blog creation, exports, and upcoming tools.',
    icon: 'blog',
    faqs: [
      {
        question: 'How does auto blog creation work?',
        answer:
          'You provide a topic, keywords, and tone preferences. We generate optimized prompts and return a structured blog draft — outline, sections, and conclusion — ready to edit or publish.',
      },
      {
        question: 'Can I export content to my CMS?',
        answer:
          'Yes. Blog drafts can be exported as Markdown or HTML and pasted into WordPress, Ghost, Notion, or any CMS you use.',
      },
      {
        question: 'Is the content SEO-friendly?',
        answer:
          'Yes. Auto blog creation includes structured headings, keyword targeting, and readable outlines designed for search visibility. You can always edit before publishing.',
      },
      {
        question: 'When will other services launch?',
        answer:
          'Social media content, SEO optimization, repurposing, newsletters, and scheduling are on our roadmap. Join the waitlist via the contact page for launch updates.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Account & support',
    description: 'Help, contact, and account questions.',
    icon: 'newsletter',
    faqs: [
      {
        question: 'How do I contact support?',
        answer:
          'Email us at hello@contentai.example or use the contact form. We respond within 1–2 business days. Priority support is available for paid credit users.',
      },
      {
        question: 'Can I get a refund on unused credits?',
        answer:
          'Unused credits may be refunded within 14 days of purchase if no content has been generated with those credits. Contact support to request a refund.',
      },
      {
        question: 'Can teams share one account?',
        answer:
          'Team workspaces are coming soon. For now, each account is individual. Contact us if you need a multi-seat setup for your organization.',
      },
    ],
  },
]

export const allFaqs = faqCategories.flatMap((category) =>
  category.faqs.map((faq) => ({ ...faq, categoryId: category.id, categoryTitle: category.title })),
)

/** @deprecated Use faqCategories — kept for backward compatibility */
export const faqs = allFaqs.map(({ question, answer }) => ({ question, answer }))

export function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
