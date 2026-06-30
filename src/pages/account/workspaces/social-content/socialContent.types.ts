import type {
  SocialContentSettings,
  SocialContentTone,
  SocialPlatform,
  SocialContentProvider,
  SocialContentCategory,
  SocialContentTopic,
} from '../../../../lib/api'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'

export type {
  SocialContentSettings,
  SocialContentTone,
  SocialPlatform,
  SocialContentProvider,
  SocialContentCategory,
  SocialContentTopic,
}

export const platformLabels: Record<SocialPlatform, string> = {
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  instagram: 'Instagram',
  facebook: 'Facebook',
}

export const platformIcons: Record<SocialPlatform, IconDefinition> = {
  linkedin: faLinkedin,
  x: faXTwitter,
  instagram: faInstagram,
  facebook: faFacebook,
}

export const platformDescriptions: Record<SocialPlatform, string> = {
  linkedin: 'Professional posts with strong hooks and clear takeaways.',
  x: 'Short, punchy posts optimized for engagement.',
  instagram: 'Caption-style posts with line breaks and hashtags.',
  facebook: 'Conversational posts that encourage comments and shares.',
}

export const providerModels: Record<SocialContentProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
  google: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

export type PostImageProvider = SocialContentSettings['post_image_ai_provider']

export const postImageProviderLabels: Record<PostImageProvider, string> = {
  openai: 'OpenAI (DALL·E)',
  google: 'Google (Imagen / Gemini)',
}

export const postImageProviderModels: Record<PostImageProvider, string[]> = {
  openai: ['dall-e-3', 'dall-e-2'],
  google: ['imagen-3.0-generate-002', 'gemini-2.0-flash-preview-image-generation'],
}

export const toneLabels: Record<SocialContentTone, string> = {
  professional: 'Professional',
  casual: 'Casual',
  witty: 'Witty',
  inspirational: 'Inspirational',
}

export function formatPostDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPostStatus(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'published':
      return 'Published'
    case 'generating':
      return 'Generating'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}

export function formatTopicStatus(status: string): string {
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

export const DEFAULT_SOCIAL_CATEGORY_PROMPT = `Write social content for the "{category_name}" category.

Brand voice context: {topic_niche}
Use an engaging tone for {content_language} audiences in {current_year}.
Category focus: {category_description}
Focus on shareable angles suited for social platforms.`

export const DEFAULT_BRAND_VOICE = `Write in a clear, authentic brand voice. Be helpful, specific, and avoid generic filler. Match the platform style and audience expectations.`

export const DEFAULT_TOPIC_BRIEF =
  '5 productivity tips for remote teams that save time without adding more meetings'

export function getDefaultTopicBrief(settings: SocialContentSettings | null): string {
  return settings?.default_topic_brief?.trim() || DEFAULT_TOPIC_BRIEF
}
