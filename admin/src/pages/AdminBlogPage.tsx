import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faFileLines,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { appUrl } from '../data/adminNav'
import { adminApi, type CmsBlogPostSummary, type CmsPostStatus } from '../lib/api'

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(status: CmsPostStatus) {
  if (status === 'published') {
    return <span className="admin-users-badge admin-users-badge--success">Published</span>
  }
  return <span className="admin-users-badge">Draft</span>
}

const statusFilters: { value: 'all' | CmsPostStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

export default function AdminBlogPage() {
  const { token } = useAdminAuth()
  const [posts, setPosts] = useState<CmsBlogPostSummary[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CmsPostStatus>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.listCmsPosts(token!, {
          search: query,
          status: statusFilter,
          page,
          pageSize,
        })
        setPosts(response.posts)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, query, statusFilter, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pageStats = useMemo(() => {
    return {
      published: posts.filter((post) => post.status === 'published').length,
      drafts: posts.filter((post) => post.status === 'draft').length,
    }
  }, [posts])

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function handleStatusChange(next: 'all' | CmsPostStatus) {
    setPage(1)
    setStatusFilter(next)
  }

  const filterLabel =
    statusFilter === 'all'
      ? `${total} post${total === 1 ? '' : 's'}`
      : statusFilter === 'published'
        ? `${total} published`
        : `${total} draft${total === 1 ? '' : 's'}`

  return (
    <div className="admin-page admin-blog-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Website content</p>
          <h1>Site blog</h1>
          <p className="admin-page-lead">
            Create and publish SEO-friendly articles for the public website at {appUrl}/blog.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link to="/blog-cms/new" className="admin-btn admin-btn--primary">
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            New post
          </Link>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <section className="admin-stat-grid admin-stat-grid--dashboard" aria-label="Blog overview">
        <article className="admin-stat-card admin-stat-card--violet">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faPenToSquare} />
            </span>
            <p className="admin-stat-label">Total posts</p>
          </div>
          <p className="admin-stat-value">{total}</p>
          <p className="admin-stat-meta">All drafts and published articles</p>
        </article>

        <article className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </span>
            <p className="admin-stat-label">On this page</p>
          </div>
          <p className="admin-stat-value">{pageStats.published}</p>
          <p className="admin-stat-meta">
            {pageStats.drafts} draft{pageStats.drafts === 1 ? '' : 's'} shown
          </p>
        </article>
      </section>

      <AdminContentCard
        className="admin-blog-posts-card"
        customHead={
          <div className="admin-content-card-head admin-blog-posts-head">
            <div className="admin-blog-posts-head-main">
              <div className="admin-blog-posts-head-brand">
                <span className="admin-blog-posts-head-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faFileLines} />
                </span>
                <div className="admin-blog-posts-head-copy">
                  <h2>All blog posts</h2>
                  <p>Manage website articles, SEO fields, and publish status.</p>
                </div>
              </div>

              <div className="admin-blog-posts-head-meta">
                <span className="admin-blog-posts-head-count">{filterLabel}</span>
                <a
                  href={`${appUrl}/blog`}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-blog-posts-head-link"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
                  View public blog
                </a>
              </div>
            </div>

            <div className="admin-blog-posts-head-toolbar">
              <form className="admin-blog-posts-search" onSubmit={handleSearch}>
                <label className="admin-blog-posts-search-field">
                  <span className="admin-blog-posts-search-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                  <input
                    type="search"
                    className="admin-input admin-blog-posts-search-input"
                    placeholder="Search by title or slug..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <button type="submit" className="admin-btn admin-btn--primary admin-blog-posts-search-btn">
                  Search
                </button>
              </form>

              <div
                className="admin-blog-posts-filters"
                role="group"
                aria-label="Filter by status"
              >
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={`admin-blog-posts-filter${
                      statusFilter === filter.value ? ' admin-blog-posts-filter--active' : ''
                    }`}
                    aria-pressed={statusFilter === filter.value}
                    onClick={() => handleStatusChange(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        loading={loading}
        loadingLabel="Loading blog posts..."
        footer={
          !loading ? (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPrevious={() => setPage((current) => current - 1)}
              onNext={() => setPage((current) => current + 1)}
            />
          ) : undefined
        }
      >
        {posts.length === 0 ? (
          <div className="admin-staff-empty">
            <p>No blog posts found</p>
            <span>Create your first article to show it on the public website.</span>
          </div>
        ) : (
          <div className="admin-staff-table-wrap">
            <table className="admin-staff-table admin-blog-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="admin-blog-title-cell">
                      <strong>{post.title}</strong>
                      <span>/{post.slug}</span>
                      {post.excerpt ? <em>{post.excerpt}</em> : null}
                    </td>
                    <td>{statusBadge(post.status)}</td>
                    <td>{post.authorName?.trim() || '—'}</td>
                    <td className="admin-staff-table-date">
                      <strong>{formatDateTime(post.publishedAt)}</strong>
                      <span>Updated {formatDateTime(post.updatedAt)}</span>
                    </td>
                    <td>
                      <div className="admin-staff-actions">
                        <Link to={`/blog-cms/${post.id}`} className="admin-btn admin-btn--ghost">
                          Edit
                        </Link>
                        {post.status === 'published' ? (
                          <a
                            href={`${appUrl}/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-btn admin-btn--ghost"
                          >
                            View live
                          </a>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminContentCard>
    </div>
  )
}
