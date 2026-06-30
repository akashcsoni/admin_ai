import type { ContentIconName } from '../components/ContentIcon'

export type AboutValue = {
  icon: ContentIconName
  title: string
  description: string
}

export type AboutAudience = {
  title: string
  description: string
  points: string[]
}

export const aboutStats = [
  { value: '2024', label: 'Founded' },
  { value: '6', label: 'Content services' },
  { value: 'BYOK', label: 'Your API keys' },
  { value: 'Global', label: 'Creator-first' },
]

export const aboutValues: AboutValue[] = [
  {
    icon: 'keys',
    title: 'Your keys, your control',
    description:
      'We never resell AI tokens. Connect your OpenAI or Anthropic keys and pay your provider directly — we provide the workflow, not the markup.',
  },
  {
    icon: 'seo',
    title: 'Quality over quantity',
    description:
      'Every tool is designed to produce structured, SEO-aware content — not generic filler. You edit, refine, and publish on your terms.',
  },
  {
    icon: 'platform',
    title: 'One platform, full workflow',
    description:
      'From blog drafts to social, newsletters, and scheduling — Content AI grows with your content needs as new services launch.',
  },
  {
    icon: 'speed',
    title: 'Built for speed',
    description:
      'Creators and teams use Content AI to cut drafting time from hours to minutes, without sacrificing voice or search visibility.',
  },
]

export const aboutAudiences: AboutAudience[] = [
  {
    title: 'Solo creators & bloggers',
    description: 'Publish consistently without hiring a full content team.',
    points: ['Auto blog drafts with your API keys', 'SEO-ready exports', 'Affordable, pay-as-you-go AI usage'],
  },
  {
    title: 'Marketing teams',
    description: 'Scale output across channels while keeping brand voice aligned.',
    points: ['Batch content generation', 'Shared tone and keyword settings', 'Six tools in one roadmap'],
  },
  {
    title: 'Agencies & freelancers',
    description: 'Deliver more client content with repeatable AI workflows.',
    points: ['Client-ready Markdown & HTML', 'Transparent AI costs per project', 'Multi-service content pipeline'],
  },
]

export const aboutMilestones = [
  {
    year: '2024',
    title: 'Content AI founded',
    description: 'Started with a simple idea: AI content tools should use your keys, not ours.',
  },
  {
    year: '2025',
    title: 'Auto blog creation live',
    description: 'Launched our first service — full blog generation with OpenAI and Anthropic support.',
  },
  {
    year: 'Next',
    title: 'Five more services shipping',
    description: 'Social, SEO, repurposing, newsletters, and scheduling are on the roadmap.',
  },
]
