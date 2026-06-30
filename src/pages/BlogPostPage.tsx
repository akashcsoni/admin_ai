import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import { blogPostingJsonLd, breadcrumbJsonLd, pageSeo } from '../config/seo'
import { siteConfig } from '../config/site'
import { blogApi, type PublicBlogPost } from '../lib/api'
import '../styles/blog.css'

function formatDate(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url.trim())
    return `${parsed.origin}${parsed.pathname}`.toLowerCase()
  } catch {
    return url.trim().split('?')[0].toLowerCase()
  }
}

function stripLeadingFeaturedImageFromContent(content: string, featuredImage: string): string {
  const featured = featuredImage.trim()
  if (!featured) return content

  const normalizedFeatured = normalizeImageUrl(featured)
  const leadingFigure = content.match(/^\s*<figure\b[^>]*>[\s\S]*?<\/figure>\s*/i)
  if (!leadingFigure) return content

  const srcMatch = leadingFigure[0].match(/<img\b[^>]*\ssrc=["']([^"']+)["']/i)
  if (srcMatch && normalizeImageUrl(srcMatch[1]) === normalizedFeatured) {
    return content.slice(leadingFigure[0].length)
  }

  return content
}

export default function BlogPostPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<PublicBlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await blogApi.getPost(slug)
        setPost(response.post)
      } catch (err) {
        setPost(null)
        setError(err instanceof Error ? err.message : 'Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  const path = `/blog/${slug}`
  const seoTitle = post?.seoTitle?.trim() || post?.title || 'Blog post'
  const seoDescription =
    post?.metaDescription?.trim() || post?.excerpt?.trim() || pageSeo.blog.description
  const keywords = post?.focusKeyword
    ? [post.focusKeyword, ...pageSeo.blog.keywords.slice(0, 4)]
    : [...pageSeo.blog.keywords]
  const displayContent = post
    ? stripLeadingFeaturedImageFromContent(post.content, post.featuredImage)
    : ''

  return (
    <>
      <SEO
        title={`${seoTitle} — ${siteConfig.name}`}
        description={seoDescription}
        path={path}
        keywords={keywords}
        ogType="article"
        image={post?.featuredImage}
        noindex={!post && !loading}
        jsonLd={
          post
            ? [
                breadcrumbJsonLd([
                  { name: 'Home', path: '/' },
                  { name: 'Blog', path: '/blog' },
                  { name: post.title, path },
                ]),
                blogPostingJsonLd({
                  title: post.title,
                  description: seoDescription,
                  path,
                  datePublished: post.publishedAt ?? post.createdAt,
                  dateModified: post.updatedAt,
                  authorName: post.authorName,
                  image: post.featuredImage,
                }),
              ]
            : undefined
        }
      />

      <div className="blog-page blog-post-page">
        <section className="blog-post-hero" aria-labelledby="blog-post-heading">
          <div className="blog-container blog-container--narrow">
            <nav className="blog-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/blog">Blog</Link>
              <span aria-hidden="true">/</span>
              <span>{post?.title ?? 'Article'}</span>
            </nav>

            {loading ? (
              <p className="blog-muted">Loading article...</p>
            ) : error || !post ? (
              <div className="blog-empty">
                <h1 id="blog-post-heading">Article not found</h1>
                <p>{error || 'This blog post may have been removed or is not published yet.'}</p>
                <Link to="/blog" className="btn btn-primary">
                  Back to blog
                </Link>
              </div>
            ) : (
              <>
                {post.featuredImage ? (
                  <div className="blog-post-featured-image">
                    <img src={post.featuredImage} alt="" loading="eager" />
                  </div>
                ) : null}
                <header className="blog-post-header">
                <time dateTime={post.publishedAt ?? post.createdAt}>
                  {formatDate(post.publishedAt ?? post.createdAt)}
                </time>
                <h1 id="blog-post-heading">{post.title}</h1>
                {post.excerpt ? <p className="blog-post-excerpt">{post.excerpt}</p> : null}
                <div className="blog-post-meta">
                  {post.authorName ? <span>By {post.authorName}</span> : null}
                  {post.focusKeyword ? <span>Focus: {post.focusKeyword}</span> : null}
                </div>
              </header>
              </>
            )}
          </div>
        </section>

        {post ? (
          <section className="blog-post-content-section" aria-label="Article content">
            <div className="blog-container blog-container--narrow">
              <article
                className="blog-post-content"
                dangerouslySetInnerHTML={{ __html: displayContent }}
              />
              <footer className="blog-post-footer">
                <Link to="/blog" className="btn btn-secondary">
                  ← All articles
                </Link>
              </footer>
            </div>
          </section>
        ) : null}
      </div>
    </>
  )
}
