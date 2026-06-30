export type PromptShortcodeDefinition = {
  key: string
  label: string
  example: string
  description: string
}

export const PROMPT_SHORTCODE_DEFINITIONS: PromptShortcodeDefinition[] = [
  { key: 'current_year', label: 'Current year', example: '2026', description: 'Four-digit year' },
  { key: 'current_month', label: 'Current month', example: 'June', description: 'Full month name' },
  { key: 'current_month_short', label: 'Month (short)', example: 'Jun', description: 'Abbreviated month' },
  { key: 'current_month_number', label: 'Month number', example: '06', description: 'Two-digit month' },
  { key: 'current_date', label: 'Current date', example: '2026-06-27', description: 'ISO date (YYYY-MM-DD)' },
  { key: 'current_day', label: 'Day of month', example: '27', description: 'Day number' },
  { key: 'current_weekday', label: 'Weekday', example: 'Friday', description: 'Full weekday name' },
  { key: 'content_language', label: 'Content language', example: 'en', description: 'From Settings → Content language' },
  { key: 'min_words', label: 'Min words', example: '800', description: 'From content length preset' },
  { key: 'max_words', label: 'Max words', example: '1200', description: 'From content length preset' },
  { key: 'keyword', label: 'Keyword / topic', example: 'AI marketing tips', description: 'Current topic when generating' },
  { key: 'category_name', label: 'Category name', example: 'SEO Tips', description: 'Assigned category name' },
  { key: 'category_description', label: 'Category description', example: 'Search optimization guides', description: 'Category description text' },
  { key: 'topic_niche', label: 'Site niche', example: 'B2B SaaS marketing', description: 'From Settings → Topics & niche' },
]

export const DEFAULT_TOPIC_NICHE_PROMPT = `Our site publishes helpful, SEO-focused articles in {content_language} for professionals and small business owners.

Keep topics timely and relevant to {current_month} {current_year}. Target length per article: {min_words}–{max_words} words.`

export const DEFAULT_CATEGORY_PROMPT = `Write content for the "{category_name}" category.

Audience and niche context: {topic_niche}
Use a clear, authoritative tone suitable for {content_language} readers in {current_year}.
Category focus: {category_description}`
