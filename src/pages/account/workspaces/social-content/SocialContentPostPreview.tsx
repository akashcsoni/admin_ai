import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { SocialContentPostDetail } from '../../../../lib/api'
import { formatPostDate, formatPostStatus, platformLabels } from './socialContent.types'

type SocialContentPostPreviewProps = {
  post: SocialContentPostDetail
  onClose: () => void
}

export default function SocialContentPostPreview({ post, onClose }: SocialContentPostPreviewProps) {
  const [copied, setCopied] = useState(false)

  const fullText = [
    post.hook,
    post.content,
    post.hashtags.length > 0 ? post.hashtags.map((tag) => `#${tag.replace(/^#/, '')}`).join(' ') : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  async function copyPost() {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="service-post-preview" aria-label="Social post preview">
      <div className="service-post-preview-head">
        <div className="service-post-preview-head-main">
          <p className="service-post-preview-eyebrow">{platformLabels[post.platform]} post</p>
          <h3>{post.topic}</h3>
          <div className="service-post-preview-meta">
            <span className={`service-blog-status service-blog-status--${post.status}`}>
              {formatPostStatus(post.status)}
            </span>
            <span className="service-post-preview-chip">{post.tokensTotal} tokens</span>
            <span className="service-post-preview-chip">{formatPostDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="service-post-preview-actions">
          <button type="button" className="service-post-copy-btn service-post-copy-btn--ghost" onClick={() => void copyPost()}>
            <FontAwesomeIcon icon={faCopy} aria-hidden="true" />
            {copied ? 'Copied' : 'Copy post'}
          </button>
          <button type="button" className="service-post-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
            Close
          </button>
        </div>
      </div>

      {post.postImage ? (
        <div className="service-post-featured">
          <div className="service-post-section-head">
            <div>
              <h4>Post image</h4>
              <p>AI-generated image saved with this post.</p>
            </div>
          </div>
          <figure className="service-post-featured-figure">
            <img src={post.postImage} alt="" loading="lazy" />
          </figure>
        </div>
      ) : post.postImageError ? (
        <div className="service-workspace-alert service-workspace-alert--error">
          Post image was not created: {post.postImageError}
        </div>
      ) : null}

      <div className="service-post-content-wrap">
        {post.hook && (
          <div className="service-social-preview-block">
            <h4>Hook</h4>
            <p>{post.hook}</p>
          </div>
        )}

        <div className="service-social-preview-block">
          <h4>Post</h4>
          <p className="service-social-preview-content">{post.content}</p>
        </div>

        {post.hashtags.length > 0 && (
          <div className="service-social-preview-block">
            <h4>Hashtags</h4>
            <p>{post.hashtags.map((tag) => `#${tag.replace(/^#/, '')}`).join(' ')}</p>
          </div>
        )}
      </div>
    </section>
  )
}
