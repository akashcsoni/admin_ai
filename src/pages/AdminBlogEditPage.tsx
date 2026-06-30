import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import { useAdminAuth } from '../context/AdminAuthContext'
import { appUrl } from '../data/adminNav'
import { adminApi, type CmsPostStatus } from '../lib/api'

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  focusKeyword: '',
  metaDescription: '',
  seoTitle: '',
  featuredImage: '',
  status: 'draft' as CmsPostStatus,
}

export default function AdminBlogEditPage() {
  const { postId } = useParams()
  const isNew = postId === 'new' || !postId
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || isNew || !postId) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getCmsPost(token!, postId!)
        setForm({
          title: response.post.title,
          slug: response.post.slug,
          excerpt: response.post.excerpt,
          content: response.post.content,
          focusKeyword: response.post.focusKeyword,
          metaDescription: response.post.metaDescription,
          seoTitle: response.post.seoTitle,
          featuredImage: response.post.featuredImage,
          status: response.post.status,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, postId, isNew])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (isNew) {
        const response = await adminApi.createCmsPost(token, form)
        setMessage(response.message)
        navigate(`/blog-cms/${response.post.id}`, { replace: true })
      } else if (postId) {
        const response = await adminApi.updateCmsPost(token, postId, form)
        setMessage(response.message)
        setForm({
          title: response.post.title,
          slug: response.post.slug,
          excerpt: response.post.excerpt,
          content: response.post.content,
          focusKeyword: response.post.focusKeyword,
          metaDescription: response.post.metaDescription,
          seoTitle: response.post.seoTitle,
          featuredImage: response.post.featuredImage,
          status: response.post.status,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog post')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!token || !postId || isNew) return
    if (!window.confirm('Delete this blog post permanently?')) return

    setDeleting(true)
    setError('')
    try {
      await adminApi.deleteCmsPost(token, postId)
      navigate('/blog-cms', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post')
    } finally {
      setDeleting(false)
    }
  }

  const liveUrl = form.status === 'published' && form.slug ? `${appUrl}/blog/${form.slug}` : null

  return (
    <div className="admin-page admin-blog-edit-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Website content</p>
          <h1>{isNew ? 'New blog post' : 'Edit blog post'}</h1>
          <p className="admin-page-lead">
            Write content and SEO metadata for the public blog. Published posts appear at /blog.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link to="/blog-cms" className="admin-btn admin-btn--ghost">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            Back to list
          </Link>
          {liveUrl ? (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost">
              View live
            </a>
          ) : null}
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      {loading ? (
        <p className="admin-content-loading">Loading blog post...</p>
      ) : (
        <AdminContentCard
          title="Post details"
          description="Title, body, and SEO fields used on the public website."
        >
          <form className="admin-blog-edit-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <label className="admin-field admin-field--wide">
                <span>Title</span>
                <input
                  className="admin-input"
                  value={form.title}
                  required
                  maxLength={500}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </label>

              <label className="admin-field">
                <span>URL slug</span>
                <input
                  className="admin-input"
                  value={form.slug}
                  maxLength={500}
                  placeholder="auto-generated from title if empty"
                  onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                />
              </label>

              <label className="admin-field">
                <span>Status</span>
                <select
                  className="admin-input"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as CmsPostStatus,
                    }))
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              <label className="admin-field admin-field--wide">
                <span>Excerpt</span>
                <textarea
                  className="admin-input admin-textarea"
                  rows={3}
                  value={form.excerpt}
                  onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
                />
              </label>

              <label className="admin-field admin-field--wide">
                <span>Content (HTML)</span>
                <textarea
                  className="admin-input admin-textarea admin-textarea--tall"
                  rows={16}
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                />
              </label>
            </div>

            <div className="admin-blog-seo-section">
              <h3>SEO</h3>
              <div className="admin-form-grid">
                <label className="admin-field">
                  <span>SEO title</span>
                  <input
                    className="admin-input"
                    value={form.seoTitle}
                    maxLength={500}
                    placeholder="Defaults to post title"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, seoTitle: event.target.value }))
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Focus keyword</span>
                  <input
                    className="admin-input"
                    value={form.focusKeyword}
                    maxLength={120}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, focusKeyword: event.target.value }))
                    }
                  />
                </label>

                <label className="admin-field admin-field--wide">
                  <span>Featured image URL</span>
                  <input
                    className="admin-input"
                    type="url"
                    value={form.featuredImage}
                    placeholder="https://..."
                    onChange={(event) =>
                      setForm((current) => ({ ...current, featuredImage: event.target.value }))
                    }
                  />
                </label>

                <label className="admin-field admin-field--wide">
                  <span>Meta description</span>
                  <textarea
                    className="admin-input admin-textarea"
                    rows={3}
                    maxLength={320}
                    value={form.metaDescription}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, metaDescription: event.target.value }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="admin-form-actions admin-blog-edit-actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : isNew ? 'Create post' : 'Save changes'}
              </button>
              {!isNew ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--danger"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                >
                  <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" />
                  {deleting ? 'Deleting...' : 'Delete post'}
                </button>
              ) : null}
            </div>
          </form>
        </AdminContentCard>
      )}
    </div>
  )
}
