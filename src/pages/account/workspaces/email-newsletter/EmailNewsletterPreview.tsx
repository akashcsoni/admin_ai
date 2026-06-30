import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { EmailNewsletterDetail } from '../../../../lib/api'
import { formatNewsletterDate, formatNewsletterStatus } from './emailNewsletter.types'
import { copyEmailHtmlSource, copyRenderedEmailHtml } from './emailClipboard'

type CopyField = 'subject' | 'preview' | 'email' | 'htmlSource' | 'plain'

type EmailNewsletterPreviewProps = {
  newsletter: EmailNewsletterDetail
  onClose: () => void
}

export default function EmailNewsletterPreview({ newsletter, onClose }: EmailNewsletterPreviewProps) {
  const previewFrameRef = useRef<HTMLIFrameElement>(null)
  const [copiedField, setCopiedField] = useState<CopyField | null>(null)
  const [copyError, setCopyError] = useState('')

  async function copyText(field: CopyField, value: string) {
    setCopyError('')
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(null), 1800)
    } catch {
      setCopyError('Unable to copy to clipboard')
    }
  }

  async function copyForEmail() {
    setCopyError('')
    const ok = await copyRenderedEmailHtml(
      newsletter.htmlContent,
      newsletter.plainText,
      previewFrameRef.current,
    )
    if (ok) {
      setCopiedField('email')
      window.setTimeout(() => setCopiedField(null), 1800)
    } else {
      setCopyError('Unable to copy formatted email. Try Copy HTML code for your ESP instead.')
    }
  }

  async function copyHtmlSource() {
    setCopyError('')
    const ok = await copyEmailHtmlSource(newsletter.htmlContent)
    if (ok) {
      setCopiedField('htmlSource')
      window.setTimeout(() => setCopiedField(null), 1800)
    } else {
      setCopyError('Unable to copy HTML code')
    }
  }

  return (
    <section className="service-post-preview service-email-preview" aria-label="Email newsletter preview">
      <div className="service-post-preview-head">
        <div className="service-post-preview-head-main">
          <p className="service-post-preview-eyebrow">HTML email newsletter</p>
          <h3>{newsletter.subject || newsletter.topic}</h3>
          <div className="service-post-preview-meta">
            <span className={`service-blog-status service-blog-status--${newsletter.status}`}>
              {formatNewsletterStatus(newsletter.status)}
            </span>
            <span className="service-post-preview-chip">{newsletter.tokensTotal} tokens</span>
            <span className="service-post-preview-chip">{formatNewsletterDate(newsletter.createdAt)}</span>
          </div>
        </div>

        <div className="service-post-preview-actions">
          <button
            type="button"
            className="service-post-copy-btn service-post-copy-btn--ghost"
            onClick={() => void copyForEmail()}
          >
            <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
            {copiedField === 'email' ? 'Copied' : 'Copy for email'}
          </button>
          <button
            type="button"
            className="service-post-copy-btn service-post-copy-btn--ghost"
            onClick={() => void copyHtmlSource()}
          >
            <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
            {copiedField === 'htmlSource' ? 'Copied' : 'Copy HTML code'}
          </button>
          <button type="button" className="service-post-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            Close
          </button>
        </div>
      </div>

      {copyError && (
        <p className="service-workspace-alert service-workspace-alert--warning service-email-copy-alert">
          {copyError}
        </p>
      )}

      {newsletter.emailImage ? (
        <div className="service-email-hero-image-wrap">
          <img src={newsletter.emailImage} alt="" loading="lazy" className="service-email-hero-image" />
        </div>
      ) : newsletter.emailImageError ? (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Hero image was not created: {newsletter.emailImageError}
        </p>
      ) : null}

      <div className="service-email-preview-body">
        <div className="service-email-meta-grid">
          <div className="service-email-meta-item">
            <div className="service-email-meta-head">
              <h4>Subject line</h4>
              <button
                type="button"
                className="service-post-copy-btn service-post-copy-btn--ghost"
                onClick={() => void copyText('subject', newsletter.subject)}
              >
                <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
                {copiedField === 'subject' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p>{newsletter.subject}</p>
          </div>

          <div className="service-email-meta-item">
            <div className="service-email-meta-head">
              <h4>Preview text</h4>
              <button
                type="button"
                className="service-post-copy-btn service-post-copy-btn--ghost"
                onClick={() => void copyText('preview', newsletter.previewText)}
              >
                <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
                {copiedField === 'preview' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p>{newsletter.previewText}</p>
          </div>
        </div>

        <div className="service-email-preview-frame-wrap">
          <div className="service-post-section-head">
            <div>
              <h4>HTML preview</h4>
              <p>
                Use <strong>Copy for email</strong> to paste into Gmail or Outlook and keep the same
                layout as this preview. Use <strong>Copy HTML code</strong> for Mailchimp, Klaviyo, or
                SendGrid HTML blocks.
              </p>
            </div>
            <button
              type="button"
              className="service-post-copy-btn service-post-copy-btn--ghost"
              onClick={() => void copyForEmail()}
            >
              <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
              {copiedField === 'email' ? 'Copied' : 'Copy for email'}
            </button>
          </div>
          <div className="service-email-preview-frame-shell">
            <iframe
              ref={previewFrameRef}
              className="service-email-preview-frame"
              title={`Email preview: ${newsletter.subject}`}
              sandbox=""
              srcDoc={newsletter.htmlContent}
            />
          </div>
        </div>

        <div className="service-email-plain-wrap">
          <div className="service-post-section-head">
            <div>
              <h4>Plain text version</h4>
              <p>Fallback for clients that do not render HTML.</p>
            </div>
            <button
              type="button"
              className="service-post-copy-btn service-post-copy-btn--ghost"
              onClick={() => void copyText('plain', newsletter.plainText)}
            >
              <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
              {copiedField === 'plain' ? 'Copied' : 'Copy plain text'}
            </button>
          </div>
          <pre className="service-email-plain-text">{newsletter.plainText || 'No plain text returned.'}</pre>
        </div>
      </div>
    </section>
  )
}
