export type AutoBlogProvider = 'openai' | 'anthropic' | 'google' | 'deepseek'
export type FeaturedImageProvider = 'openai' | 'google'
export type AutoBlogGenerationMode = 'single' | 'multi_step'
export type AutoBlogContentLength = 'short' | 'medium' | 'long' | 'extended' | 'custom'
export type AutoBlogContentPromptType =
  | 'news_article'
  | 'seo_blog'
  | 'informative_blog'
  | 'latest_trading_news'
  | 'market_analysis'
  | 'breaking_news'
  | 'custom'
export type AutoBlogPublishStatus = 'draft' | 'published'

export type AutoBlogLivePublishPlatform =
  | 'wordpress'
  | 'ghost'
  | 'custom_webhook'
  | 'webflow'
  | 'shopify'
  | 'nextjs'

export type AutoBlogRemotePublishStatus = 'draft' | 'publish'

export type AutoBlogLivePublish = {
  enabled: boolean
  platform: AutoBlogLivePublishPlatform
  siteUrl: string
  username: string
  hasApiKey: boolean
  webhookUrl: string
  remoteStatus: AutoBlogRemotePublishStatus
  remoteCategoryId: string
  lastTestedAt: string | null
  lastTestStatus: string | null
  lastTestMessage: string
  createdAt: string
  updatedAt: string
}

export type AutoBlogLivePublishPlatformInfo = {
  id: AutoBlogLivePublishPlatform
  label: string
  description: string
  live: boolean
}

export type MultiStepSlug = 'plan' | 'opening' | 'main_body' | 'supporting' | 'closing' | 'schema'

export type MultiStepPromptStep = {
  label: string
  description: string
  placeholders: string[]
  prompt: string
  instruction: string
  max_tokens: number
}

export type MultiStepPrompts = Record<MultiStepSlug, MultiStepPromptStep>

export type AutoBlogSettings = {
  enabled: boolean
  ai_provider: AutoBlogProvider
  ai_model: string
  hasApiKey: boolean
  generation_mode: AutoBlogGenerationMode
  generation_temperature: number
  generation_max_tokens: number
  content_length: AutoBlogContentLength
  content_min_words: number
  content_max_words: number
  content_prompt_type: AutoBlogContentPromptType
  system_prompt: string
  content_language: string
  publish_status: AutoBlogPublishStatus
  seo_enabled: boolean
  featured_image_enabled: boolean
  featured_image_ai_provider: FeaturedImageProvider
  featured_image_ai_model: string
  hasFeaturedImageApiKey: boolean
  featuredImageKeyError: string | null
  multi_step_prompts: MultiStepPrompts
  topic_niche: string
  created_at: string
  updated_at: string
}

export type AutoBlogCategory = {
  id: string
  name: string
  description: string
  prompt: string
  enabled: boolean
  sortOrder: number
  topicCount: number
  pendingTopicCount: number
  createdAt: string
  updatedAt: string
}

export type AutoBlogTopic = {
  id: string
  topic: string
  status: string
  source: string
  priority: number
  categoryId: string | null
  categoryName: string | null
  postId: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export type AutoBlogPost = {
  id: string
  keyword: string
  title: string
  slug: string | null
  excerpt: string | null
  status: string
  focusKeyword: string | null
  metaDescription: string | null
  seoTitle: string | null
  provider: string | null
  model: string | null
  generationMode: string | null
  topicId: string | null
  topicLabel: string | null
  categoryName: string | null
  tokensTotal: number
  errorMessage: string | null
  featuredImage: string | null
  featuredImageError: string | null
  remotePostId: string | null
  remotePostUrl: string | null
  livePublishError: string | null
  createdAt: string
  updatedAt: string
}

export type AutoBlogPostDetail = AutoBlogPost & {
  content: string
  tokensPrompt: number
  tokensCompletion: number
}

export const contentPromptTypes = {
  news_article: {
    label: 'News article (recommended)',
    description: 'Professional digital news with inverted pyramid structure.',
  },
  seo_blog: {
    label: 'SEO blog article',
    description: 'Long-form SEO posts with headings, FAQs, and takeaways.',
  },
  informative_blog: {
    label: 'Informative blog',
    description: 'Educational posts that explain topics clearly.',
  },
  latest_trading_news: {
    label: 'Latest trading news',
    description: 'Timely market and trading news.',
  },
  market_analysis: {
    label: 'Market analysis',
    description: 'In-depth analysis with technical context.',
  },
  breaking_news: {
    label: 'Breaking news',
    description: 'Short urgent news format.',
  },
  custom: {
    label: 'Custom prompt',
    description: 'Use your own system prompt.',
  },
} as const

export const contentLengthPresets = {
  short: { label: 'Short (~400–600 words)', min: 400, max: 600 },
  medium: { label: 'Medium (~800–1,200 words)', min: 800, max: 1200 },
  long: { label: 'Long (~1,500–2,000 words)', min: 1500, max: 2000 },
  extended: { label: 'Extended (~2,500–3,500 words)', min: 2500, max: 3500 },
  custom: { label: 'Custom word range', min: 800, max: 1200 },
} as const

export const providerModels: Record<AutoBlogProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022'],
  google: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
}

export const featuredImageProviderLabels: Record<FeaturedImageProvider, string> = {
  openai: 'ChatGPT (OpenAI)',
  google: 'Gemini (Google)',
}

export const featuredImageProviderModels: Record<FeaturedImageProvider, string[]> = {
  openai: ['dall-e-3', 'dall-e-2'],
  google: ['imagen-3.0-generate-002', 'gemini-2.0-flash-preview-image-generation'],
}

export const multiStepSlugs: MultiStepSlug[] = [
  'plan',
  'opening',
  'main_body',
  'supporting',
  'closing',
  'schema',
]

export function formatBlogDate(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

export function formatPostStatus(status: string): string {
  switch (status) {
    case 'published':
      return 'Published'
    case 'draft':
      return 'Draft'
    case 'generating':
      return 'Generating'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}
