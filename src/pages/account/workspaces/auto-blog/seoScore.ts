import type { AutoBlogPostDetail } from '../../../../lib/api'

export type SeoScoreStatus = 'good' | 'warning' | 'poor' | 'missing'

export type SeoFieldScore = {
  id: 'focusKeyword' | 'seoTitle' | 'metaDescription' | 'slug' | 'content'
  label: string
  score: number
  maxScore: number
  status: SeoScoreStatus
  detail: string
  value?: string
}

export type SeoScoreResult = {
  totalScore: number
  maxScore: number
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs work'
  fields: SeoFieldScore[]
}

const SEO_TITLE_IDEAL_MIN = 50
const SEO_TITLE_IDEAL_MAX = 60
const SEO_TITLE_ACCEPTABLE_MIN = 30
const SEO_TITLE_ACCEPTABLE_MAX = 70

const META_IDEAL_MIN = 120
const META_IDEAL_MAX = 160
const META_ACCEPTABLE_MIN = 70
const META_ACCEPTABLE_MAX = 180

function clampScore(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)))
}

function scoreByLength(
  length: number,
  idealMin: number,
  idealMax: number,
  acceptableMin: number,
  acceptableMax: number,
  maxPoints: number,
): number {
  if (length === 0) return 0
  if (length >= idealMin && length <= idealMax) return maxPoints
  if (length >= acceptableMin && length <= acceptableMax) return Math.round(maxPoints * 0.7)

  const distance =
    length < acceptableMin
      ? acceptableMin - length
      : length - acceptableMax

  return clampScore(maxPoints * 0.35 - distance * 0.4, maxPoints)
}

function containsKeyword(haystack: string, keyword: string): boolean {
  if (!haystack || !keyword) return false
  return haystack.toLowerCase().includes(keyword.trim().toLowerCase())
}

function scoreSlug(slug: string | null | undefined): SeoFieldScore {
  const maxScore = 15
  const value = slug?.trim() ?? ''

  if (!value) {
    return {
      id: 'slug',
      label: 'Slug',
      score: 0,
      maxScore,
      status: 'missing',
      detail: 'Missing URL slug',
    }
  }

  let score = 5
  let status: SeoScoreStatus = 'warning'
  const isLowercase = value === value.toLowerCase()
  const usesHyphens = !/\s|_/.test(value)
  const reasonableLength = value.length >= 8 && value.length <= 80

  if (isLowercase) score += 3
  if (usesHyphens) score += 3
  if (reasonableLength) score += 4

  if (score >= 13) status = 'good'
  else if (score >= 8) status = 'warning'
  else status = 'poor'

  return {
    id: 'slug',
    label: 'Slug',
    score: clampScore(score, maxScore),
    maxScore,
    status,
    detail: `${value.length} chars · ${isLowercase ? 'lowercase' : 'mixed case'} · ${usesHyphens ? 'clean format' : 'avoid spaces/underscores'}`,
    value,
  }
}

function scoreFocusKeyword(
  keyword: string | null | undefined,
  post: AutoBlogPostDetail,
): SeoFieldScore {
  const maxScore = 20
  const value = keyword?.trim() ?? ''

  if (!value) {
    return {
      id: 'focusKeyword',
      label: 'Focus keyword',
      score: 0,
      maxScore,
      status: 'missing',
      detail: 'No focus keyword set',
    }
  }

  let score = 8
  const inTitle = containsKeyword(post.seoTitle ?? post.title, value)
  const inMeta = containsKeyword(post.metaDescription ?? '', value)
  const inContent = containsKeyword(stripHtml(post.content), value)

  if (inTitle) score += 4
  if (inMeta) score += 4
  if (inContent) score += 4

  let status: SeoScoreStatus = 'good'
  if (score < 12) status = 'warning'
  if (score < 8) status = 'poor'

  const placements = [
    inTitle ? 'title' : null,
    inMeta ? 'meta' : null,
    inContent ? 'content' : null,
  ].filter(Boolean)

  return {
    id: 'focusKeyword',
    label: 'Focus keyword',
    score: clampScore(score, maxScore),
    maxScore,
    status,
    detail:
      placements.length > 0
        ? `Found in ${placements.join(', ')}`
        : 'Keyword not found in title, meta, or content',
    value,
  }
}

function scoreSeoTitle(title: string | null | undefined, keyword: string): SeoFieldScore {
  const maxScore = 25
  const value = title?.trim() ?? ''

  if (!value) {
    return {
      id: 'seoTitle',
      label: 'SEO title',
      score: 0,
      maxScore,
      status: 'missing',
      detail: 'Missing SEO title',
    }
  }

  const lengthScore = scoreByLength(
    value.length,
    SEO_TITLE_IDEAL_MIN,
    SEO_TITLE_IDEAL_MAX,
    SEO_TITLE_ACCEPTABLE_MIN,
    SEO_TITLE_ACCEPTABLE_MAX,
    15,
  )
  const keywordScore = keyword && containsKeyword(value, keyword) ? 5 : 0
  const score = clampScore(5 + lengthScore + keywordScore, maxScore)

  let status: SeoScoreStatus = 'good'
  if (score < 18) status = 'warning'
  if (score < 10) status = 'poor'

  const lengthHint =
    value.length >= SEO_TITLE_IDEAL_MIN && value.length <= SEO_TITLE_IDEAL_MAX
      ? 'ideal length'
      : value.length < SEO_TITLE_ACCEPTABLE_MIN
        ? 'too short'
        : value.length > SEO_TITLE_ACCEPTABLE_MAX
          ? 'too long'
          : 'acceptable length'

  return {
    id: 'seoTitle',
    label: 'SEO title',
    score,
    maxScore,
    status,
    detail: `${value.length} chars · ${lengthHint}${keywordScore ? ' · keyword included' : ''}`,
    value,
  }
}

function scoreMetaDescription(description: string | null | undefined, keyword: string): SeoFieldScore {
  const maxScore = 25
  const value = description?.trim() ?? ''

  if (!value) {
    return {
      id: 'metaDescription',
      label: 'Meta description',
      score: 0,
      maxScore,
      status: 'missing',
      detail: 'Missing meta description',
    }
  }

  const lengthScore = scoreByLength(
    value.length,
    META_IDEAL_MIN,
    META_IDEAL_MAX,
    META_ACCEPTABLE_MIN,
    META_ACCEPTABLE_MAX,
    15,
  )
  const keywordScore = keyword && containsKeyword(value, keyword) ? 5 : 0
  const score = clampScore(5 + lengthScore + keywordScore, maxScore)

  let status: SeoScoreStatus = 'good'
  if (score < 18) status = 'warning'
  if (score < 10) status = 'poor'

  const lengthHint =
    value.length >= META_IDEAL_MIN && value.length <= META_IDEAL_MAX
      ? 'ideal length'
      : value.length < META_ACCEPTABLE_MIN
        ? 'too short'
        : value.length > META_ACCEPTABLE_MAX
          ? 'too long'
          : 'acceptable length'

  return {
    id: 'metaDescription',
    label: 'Meta description',
    score,
    maxScore,
    status,
    detail: `${value.length} chars · ${lengthHint}${keywordScore ? ' · keyword included' : ''}`,
    value,
  }
}

function scoreContent(post: AutoBlogPostDetail, keyword: string): SeoFieldScore {
  const maxScore = 15
  const plainText = stripHtml(post.content)
  const wordCount = plainText.split(/\s+/).filter(Boolean).length
  const hasHeadings = /<h2[\s>]/i.test(post.content)
  const keywordInContent = keyword ? containsKeyword(plainText, keyword) : false

  let score = 0
  if (wordCount >= 300) score += 5
  else if (wordCount >= 150) score += 3

  if (hasHeadings) score += 4
  if (keywordInContent) score += 6

  let status: SeoScoreStatus = 'good'
  if (score < 10) status = 'warning'
  if (score < 6) status = 'poor'

  return {
    id: 'content',
    label: 'Content SEO',
    score: clampScore(score, maxScore),
    maxScore,
    status,
    detail: `${wordCount} words · ${hasHeadings ? 'has H2 sections' : 'add H2 sections'} · ${keywordInContent ? 'keyword in body' : 'keyword missing in body'}`,
  }
}

function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getGrade(totalScore: number): SeoScoreResult['grade'] {
  if (totalScore >= 85) return 'Excellent'
  if (totalScore >= 70) return 'Good'
  if (totalScore >= 50) return 'Fair'
  return 'Needs work'
}

export function calculateSeoScore(post: AutoBlogPostDetail): SeoScoreResult {
  const keyword = post.focusKeyword?.trim() || post.keyword?.trim() || ''

  const fields = [
    scoreFocusKeyword(keyword, post),
    scoreSeoTitle(post.seoTitle, keyword),
    scoreMetaDescription(post.metaDescription, keyword),
    scoreSlug(post.slug),
    scoreContent(post, keyword),
  ]

  const totalScore = fields.reduce((sum, field) => sum + field.score, 0)
  const maxScore = fields.reduce((sum, field) => sum + field.maxScore, 0)

  return {
    totalScore,
    maxScore,
    grade: getGrade(totalScore),
    fields,
  }
}

export function getSeoScoreColor(score: number): string {
  if (score >= 85) return 'success'
  if (score >= 70) return 'accent'
  if (score >= 50) return 'warning'
  return 'danger'
}
