import type {
  EmailNewsletterCategory,
  EmailNewsletterFormat,
  EmailNewsletterProvider,
  EmailNewsletterSettings,
  EmailNewsletterTopic,
  EmailNewsletterTone,
  EmailTemplateStyle,
} from '../../../../lib/api'

export type {
  EmailNewsletterCategory,
  EmailNewsletterFormat,
  EmailNewsletterProvider,
  EmailNewsletterSettings,
  EmailNewsletterTopic,
  EmailNewsletterTone,
  EmailTemplateStyle,
}

export const providerModels: Record<EmailNewsletterProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
  google: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

export const toneLabels: Record<EmailNewsletterTone, string> = {
  professional: 'Professional',
  casual: 'Casual',
  friendly: 'Friendly',
  promotional: 'Promotional',
}

export const templateStyleLabels: Record<EmailTemplateStyle, string> = {
  classic: 'Magazine / digest',
  minimal: 'Minimal tech',
  promotional: 'Bold editorial',
}

export const templateStyleDescriptions: Record<EmailTemplateStyle, string> = {
  classic:
    'Professional digest — hero intro, article list, 2×2 grid, featured dark card (like industry newsletters).',
  minimal:
    'Clean product update — simple header, hero image, 2-column “Also helpful” links, blue pill CTAs.',
  promotional:
    'Campaign-style — bold color blocks, numbered 3-column sections, side-by-side features, black pill buttons.',
}

export const newsletterFormatLabels: Record<EmailNewsletterFormat, string> = {
  content_email: 'Content email',
  blog_sections: 'Blog-wise newsletter',
}

export const newsletterFormatDescriptions: Record<EmailNewsletterFormat, string> = {
  content_email:
    'One focused message per email — hero headline, short body copy, and a single primary CTA.',
  blog_sections:
    'Digest-style email with multiple blog-like sections — each with a title, excerpt, and read-more link.',
}

export function defaultBrandVoiceForFormat(format: EmailNewsletterFormat): string {
  if (format === 'blog_sections') {
    return 'Write a digest-style newsletter with multiple blog-like sections. Each section needs a clear headline, a short excerpt, and a read-more link. Keep the intro editorial and scannable.'
  }

  return 'Write a focused content email around one main message. Use a strong opening, short supporting paragraphs, and one primary call to action.'
}

export const DEFAULT_BRAND_VOICE = defaultBrandVoiceForFormat('content_email')

export const DEFAULT_TOPIC_BRIEF =
  'Weekly product update: 3 new features, one customer win, and a tip for getting more from your account'

export const DEFAULT_FOOTER_TEXT =
  'You are receiving this email because you subscribed to updates. Unsubscribe link placeholder.'

export const DEFAULT_EMAIL_NEWSLETTER_CATEGORY_PROMPT = `Write an HTML email newsletter for the "{category_name}" category.

Brand voice context: {topic_niche}
Use an engaging tone for {content_language} subscribers in {current_year}.
Category focus: {category_description}
Design like a polished ESP newsletter: hero section, scannable blocks, optional 2- or 3-column grids, styled CTA buttons, and image placeholders with alt text.
Include a compelling subject line angle and one clear call to action.`

export const emailImageProviderLabels: Record<'openai' | 'google', string> = {
  openai: 'OpenAI (DALL·E)',
  google: 'Google (Imagen / Gemini)',
}

export const emailImageProviderModels: Record<'openai' | 'google', string[]> = {
  openai: ['dall-e-3', 'dall-e-2'],
  google: ['imagen-3.0-generate-002', 'gemini-2.0-flash-preview-image-generation'],
}

export function formatNewsletterTopicStatus(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'used':
      return 'Used'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}

export function getDefaultTopicBrief(settings: EmailNewsletterSettings | null): string {
  return settings?.default_topic_brief?.trim() || DEFAULT_TOPIC_BRIEF
}

export function formatNewsletterDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNewsletterStatus(status: string): string {
  if (status === 'draft') return 'Ready'
  if (status === 'failed') return 'Failed'
  if (status === 'generating') return 'Generating'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
