import { useState, type CSSProperties } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faCopy,
  faFileCode,
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import type { AutoBlogPostDetail } from '../../../../lib/api'
import { calculateSeoScore, getSeoScoreColor, type SeoFieldScore } from './seoScore'
import { formatBlogDate, formatPostStatus } from './autoBlog.types'

type AutoBlogPostPreviewProps = {
  post: AutoBlogPostDetail
  onClose: () => void
}

type CopyKey =
  | 'focusKeyword'
  | 'seoTitle'
  | 'metaDescription'
  | 'seoAll'
  | 'html'
  | 'text'
  | 'slug'
  | 'featuredImage'

function stripHtml(html: string): string {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent?.trim() ?? ''
}

function buildSeoBundle(post: AutoBlogPostDetail): string {
  const lines = [
    post.focusKeyword ? `Focus keyword: ${post.focusKeyword}` : '',
    post.seoTitle ? `SEO title: ${post.seoTitle}` : '',
    post.metaDescription ? `Meta description: ${post.metaDescription}` : '',
    post.slug ? `Slug: ${post.slug}` : '',
  ].filter(Boolean)

  return lines.join('\n')
}

function copiedLabel(label: string): string {
  return label.startsWith('Copy ') ? `Copied ${label.slice(5)}` : 'Copied'
}

export default function AutoBlogPostPreview({ post, onClose }: AutoBlogPostPreviewProps) {
  const [copiedKey, setCopiedKey] = useState<CopyKey | null>(null)
  const seoScore = calculateSeoScore(post)
  const scoreTone = getSeoScoreColor(seoScore.totalScore)

  const hasSeo = Boolean(
    post.focusKeyword || post.seoTitle || post.metaDescription || post.slug || post.content,
  )

  async function copyValue(key: CopyKey, value: string) {
    if (!value.trim()) return

    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1800)
    } catch {
      setCopiedKey(null)
    }
  }

  function renderCopyButton(key: CopyKey, value: string, label: string) {
    const isCopied = copiedKey === key

    return (
      <button
        type="button"
        className={`service-post-copy-btn${isCopied ? ' service-post-copy-btn--copied' : ''}`}
        onClick={() => void copyValue(key, value)}
        disabled={!value.trim()}
        title={isCopied ? copiedLabel(label) : label}
        aria-label={isCopied ? copiedLabel(label) : label}
      >
        <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} aria-hidden="true" />
        {isCopied ? copiedLabel(label) : label}
      </button>
    )
  }

  function renderSeoFieldCard(field: SeoFieldScore) {
    const copyKeyMap: Record<SeoFieldScore['id'], CopyKey | null> = {
      focusKeyword: 'focusKeyword',
      seoTitle: 'seoTitle',
      metaDescription: 'metaDescription',
      slug: 'slug',
      content: null,
    }

    const copyKey = copyKeyMap[field.id]
    const copyValueText = field.value ?? ''

    return (
      <div
        key={field.id}
        className={`service-post-seo-card service-post-seo-card--${field.status}${
          field.id === 'metaDescription' || field.id === 'content'
            ? ' service-post-seo-card--wide'
            : ''
        }`}
      >
        <div className="service-post-seo-card-top">
          <dt>{field.label}</dt>
          <span className={`service-post-seo-score service-post-seo-score--${field.status}`}>
            {field.score}/{field.maxScore}
          </span>
        </div>
        <div className="service-post-seo-meter" aria-hidden="true">
          <span
            className={`service-post-seo-meter-fill service-post-seo-meter-fill--${field.status}`}
            style={{ width: `${Math.round((field.score / field.maxScore) * 100)}%` }}
          />
        </div>
        <dd>{field.value || 'Not set'}</dd>
        <p className="service-post-seo-detail">{field.detail}</p>
        {copyKey && field.value
          ? renderCopyButton(copyKey, copyValueText, `Copy ${field.label.toLowerCase()}`)
          : null}
      </div>
    )
  }

  return (
    <section className="service-post-preview" aria-label="Blog post preview">
      <div className="service-post-preview-head">
        <div className="service-post-preview-head-main">
          <p className="service-post-preview-eyebrow">Generated blog preview</p>
          <h3>{post.title}</h3>
          <div className="service-post-preview-meta">
            <span className={`service-blog-status service-blog-status--${post.status}`}>
              {formatPostStatus(post.status)}
            </span>
            {post.categoryName ? (
              <span className="service-post-preview-chip">{post.categoryName}</span>
            ) : null}
            <span className="service-post-preview-chip">
              Topic: {post.topicLabel || post.keyword}
            </span>
            <span className="service-post-preview-chip">{post.tokensTotal} tokens</span>
            <span className="service-post-preview-chip">{formatBlogDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="service-post-preview-actions">
          <button
            type="button"
            className="service-post-copy-btn service-post-copy-btn--ghost"
            onClick={() => void copyValue('html', post.content)}
            title="Copy article HTML"
          >
            <FontAwesomeIcon icon={faFileCode} aria-hidden="true" />
            {copiedKey === 'html' ? 'Copied HTML' : 'Copy HTML'}
          </button>
          <button
            type="button"
            className="service-post-copy-btn service-post-copy-btn--ghost"
            onClick={() => void copyValue('text', stripHtml(post.content))}
            title="Copy article content"
          >
            <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
            {copiedKey === 'text' ? 'Copied Content' : 'Copy Content'}
          </button>
          <button type="button" className="service-post-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            Close
          </button>
        </div>
      </div>

      {post.featuredImage ? (
        <div className="service-post-featured">
          <div className="service-post-section-head">
            <div>
              <h4>Featured image</h4>
              <p>AI-generated hero image saved with this post.</p>
            </div>
            {renderCopyButton('featuredImage', post.featuredImage, 'Copy image URL')}
          </div>
          <figure className="service-post-featured-figure">
            <img src={post.featuredImage} alt="" loading="lazy" />
          </figure>
        </div>
      ) : post.featuredImageError ? (
        <div className="service-workspace-alert service-workspace-alert--error">
          Featured image was not created: {post.featuredImageError}
        </div>
      ) : null}

      {hasSeo && (
        <div className="service-post-seo">
          <div className="service-post-section-head">
            <div>
              <h4>
                <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
                SEO metadata
              </h4>
              <p>Score is calculated out of 100 based on keyword usage, lengths, slug, and content.</p>
            </div>
            {renderCopyButton('seoAll', buildSeoBundle(post), 'Copy all SEO fields')}
          </div>

          <div className={`service-post-seo-summary service-post-seo-summary--${scoreTone}`}>
            <div
              className="service-post-seo-summary-ring"
              style={{ '--seo-score': seoScore.totalScore } as CSSProperties}
              aria-hidden="true"
            >
              <div className="service-post-seo-summary-ring-inner">
                <strong>{seoScore.totalScore}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="service-post-seo-summary-copy">
              <div className="service-post-seo-summary-head">
                <strong>{seoScore.grade}</strong>
                <span className={`service-post-seo-grade-badge service-post-seo-grade-badge--${scoreTone}`}>
                  SEO score
                </span>
              </div>
              <p>
                {seoScore.fields.filter((field) => field.status === 'good').length} of{' '}
                {seoScore.fields.length} checks passed. Improve fields scoring below 70% of their
                points.
              </p>
              <div className="service-post-seo-summary-stats">
                {seoScore.fields.map((field) => (
                  <span
                    key={field.id}
                    className={`service-post-seo-mini-stat service-post-seo-mini-stat--${field.status}`}
                    title={`${field.label}: ${field.score}/${field.maxScore}`}
                  >
                    {field.label} {field.score}/{field.maxScore}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <dl className="service-post-seo-grid">
            {seoScore.fields
              .filter((field) => field.id !== 'content')
              .map((field) => renderSeoFieldCard(field))}
            {seoScore.fields
              .filter((field) => field.id === 'content')
              .map((field) => renderSeoFieldCard(field))}
          </dl>
        </div>
      )}

      <div className="service-post-content-wrap">
        <div className="service-post-section-head">
          <div>
            <h4>Article content</h4>
            <p>Preview how the generated HTML will read on your site.</p>
          </div>
          <div className="service-post-content-actions">
            {renderCopyButton('html', post.content, 'Copy HTML')}
            {renderCopyButton('text', stripHtml(post.content), 'Copy Content')}
          </div>
        </div>

        <article
          className="service-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </section>
  )
}
