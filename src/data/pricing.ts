import { faqCategories } from './faq'

export type PricingPlan = {
  id: 'free' | 'credits'
  name: string
  price: string
  period: string
  description: string
  credits: string
  highlighted: boolean
  cta: string
  ctaLink: string
  features: string[]
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try Content AI with no payment required. Perfect for testing your first blog draft.',
    credits: '1 content credit',
    highlighted: false,
    cta: 'Start free',
    ctaLink: '/contact',
    features: [
      'Create 1 content piece from your account',
      'Use your own OpenAI or Anthropic API keys',
      'Auto blog creation workflow',
      'Markdown & HTML export',
      'No credit card required',
    ],
  },
  {
    id: 'credits',
    name: 'Pay as you go',
    price: '$1',
    period: 'per credit',
    description:
      'Add credits to your account and create content whenever you need it. Simple, flexible, no monthly subscription.',
    credits: '1 credit = 1 content',
    highlighted: true,
    cta: 'Add credits',
    ctaLink: '/contact',
    features: [
      '1 credit creates 1 content from your account',
      '$1 added = 1 credit ($20 = 20 credits)',
      'Credits never expire on your account',
      'All content services as they launch',
      'Top up any amount, anytime',
    ],
  },
]

export const creditExamples = [
  { amount: 10, credits: 10, label: 'Starter top-up' },
  { amount: 20, credits: 20, label: 'Most popular' },
  { amount: 50, credits: 50, label: 'Power users' },
  { amount: 100, credits: 100, label: 'Teams & agencies' },
]

export const creditSteps = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up free and connect your OpenAI or Anthropic API key to get started.',
  },
  {
    number: '02',
    title: 'Add credits',
    description: 'Top up your wallet — $1 gives you 1 credit. Add $20 and receive 20 credits instantly.',
  },
  {
    number: '03',
    title: 'Create content',
    description: 'Each content you generate uses 1 credit from your account. Free users get 1 content to start.',
  },
]

export const pricingFaqs =
  faqCategories.find((category) => category.id === 'pricing')?.faqs ?? []
