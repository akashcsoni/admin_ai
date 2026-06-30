import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUpRightFromSquare,
  faEye,
  faEyeSlash,
  faMagnifyingGlass,
  faSitemap,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { appUrl } from '../data/adminNav'
import { adminApi, type SitePageSeoRecord } from '../lib/api'

const categoryFilters = ['All', 'Marketing', 'Account', 'Auth', 'Legal'] as const

type CategoryFilter = (typeof categoryFilters)[number]
type VisibilityFilter = 'all' | 'indexable' | 'noindex' | 'inactive'

const visibilityFilters: { value: VisibilityFilter; label: string }[] = [
  { value: 'all', label: 'All pages' },
  { value: 'indexable', label: 'Indexable' },
  { value: 'noindex', label: 'Noindex' },
  { value: 'inactive', label: 'Inactive' },
]

const PAGE_SIZE = 15

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function categoryBadgeClass(category: string): string {
  if (category === 'Marketing') return 'admin-site-seo-category admin-site-seo-category--marketing'
  if (category === 'Account') return 'admin-site-seo-category admin-site-seo-category--account'
  if (category === 'Auth') return 'admin-site-seo-category admin-site-seo-category--auth'
  if (category === 'Legal') return 'admin-site-seo-category admin-site-seo-category--legal'
  return 'admin-site-seo-category'
}

function seoLengthStatus(length: number, min: number, max: number): 'good' | 'warn' | 'empty' {
  if (length === 0) return 'empty'
  if (length >= min && length <= max) return 'good'
  return 'warn'
}

function SeoLengthChip({
  label,
  length,
  min,
  max,
}: {
  label: string
  length: number
  min: number
  max: number
}) {
  const status = seoLengthStatus(length, min, max)
  return (
    <span className={`admin-site-seo-length admin-site-seo-length--${status}`}>
      {label}: {length}
      <em>{min}–{max}</em>
    </span>
  )
}

export default function AdminSiteSeoPage() {
  const { token } = useAdminAuth()
  const [pages, setPages] = useState<SitePageSeoRecord[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.listSiteSeoPages(token!)
        setPages(response.pages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page SEO records')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  const filteredPages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return pages.filter((item) => {
      if (categoryFilter !== 'All' && item.pageCategory !== categoryFilter) {
        return false
      }

      if (visibilityFilter === 'indexable' && item.noindex) return false
      if (visibilityFilter === 'noindex' && !item.noindex) return false
      if (visibilityFilter === 'inactive' && item.isActive) return false

      if (!normalizedQuery) return true

      return (
        item.pageName.toLowerCase().includes(normalizedQuery) ||
        item.pageKey.toLowerCase().includes(normalizedQuery) ||
        item.path.toLowerCase().includes(normalizedQuery) ||
        item.metaTitle.toLowerCase().includes(normalizedQuery) ||
        item.metaDescription.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [pages, query, categoryFilter, visibilityFilter])

  const stats = useMemo(() => {
    return {
      total: pages.length,
      indexable: pages.filter((item) => !item.noindex && item.isActive).length,
      noindex: pages.filter((item) => item.noindex).length,
      inactive: pages.filter((item) => !item.isActive).length,
    }
  }, [pages])

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / PAGE_SIZE))

  const pagedPages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredPages.slice(start, start + PAGE_SIZE)
  }, [filteredPages, page])

  const filterLabel = useMemo(() => {
    const count = filteredPages.length
    if (visibilityFilter === 'indexable') return `${count} indexable`
    if (visibilityFilter === 'noindex') return `${count} noindex`
    if (visibilityFilter === 'inactive') return `${count} inactive`
    if (categoryFilter !== 'All') return `${count} in ${categoryFilter}`
    return `${count} page${count === 1 ? '' : 's'}`
  }, [filteredPages.length, visibilityFilter, categoryFilter])

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function handleCategoryChange(next: CategoryFilter) {
    setPage(1)
    setCategoryFilter(next)
  }

  function handleVisibilityChange(next: VisibilityFilter) {
    setPage(1)
    setVisibilityFilter(next)
  }

  return (
    <div className="admin-page admin-site-seo-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Website SEO</p>
          <h1>Page SEO &amp; schema</h1>
          <p className="admin-page-lead">
            Manage meta titles, descriptions, keywords, and JSON-LD for every public route on{' '}
            {appUrl}.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <a href={appUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost">
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
            View public site
          </a>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <section className="admin-stat-grid admin-stat-grid--dashboard" aria-label="SEO overview">
        <article className="admin-stat-card admin-stat-card--violet">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faSitemap} />
            </span>
            <p className="admin-stat-label">Managed pages</p>
          </div>
          <p className="admin-stat-value">{stats.total}</p>
          <p className="admin-stat-meta">Marketing, account, auth, and legal routes</p>
        </article>

        <article className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faEye} />
            </span>
            <p className="admin-stat-label">Indexable</p>
          </div>
          <p className="admin-stat-value">{stats.indexable}</p>
          <p className="admin-stat-meta">Active pages visible to search engines</p>
        </article>

        <article className="admin-stat-card admin-stat-card--amber">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faEyeSlash} />
            </span>
            <p className="admin-stat-label">Noindex</p>
          </div>
          <p className="admin-stat-value">{stats.noindex}</p>
          <p className="admin-stat-meta">Account and auth pages hidden from Google</p>
        </article>

        <article className="admin-stat-card admin-stat-card--blue">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faToggleOff} />
            </span>
            <p className="admin-stat-label">Inactive</p>
          </div>
          <p className="admin-stat-value">{stats.inactive}</p>
          <p className="admin-stat-meta">Using static code defaults instead</p>
        </article>
      </section>

      <AdminContentCard
        className="admin-blog-posts-card admin-site-seo-list-card"
        customHead={
          <div className="admin-content-card-head admin-blog-posts-head">
            <div className="admin-blog-posts-head-main">
              <div className="admin-blog-posts-head-brand">
                <span className="admin-blog-posts-head-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faSitemap} />
                </span>
                <div className="admin-blog-posts-head-copy">
                  <h2>All pages</h2>
                  <p>Edit SEO metadata and structured data shown on the public website.</p>
                </div>
              </div>

              <div className="admin-blog-posts-head-meta">
                <span className="admin-blog-posts-head-count">{filterLabel}</span>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-blog-posts-head-link"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
                  View public site
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
                    placeholder="Search by page name, path, title, or description..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <button type="submit" className="admin-btn admin-btn--primary admin-blog-posts-search-btn">
                  Search
                </button>
              </form>

              <div className="admin-blog-posts-filters" role="group" aria-label="Filter by visibility">
                {visibilityFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={`admin-blog-posts-filter${
                      visibilityFilter === filter.value ? ' admin-blog-posts-filter--active' : ''
                    }`}
                    aria-pressed={visibilityFilter === filter.value}
                    onClick={() => handleVisibilityChange(filter.value)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-site-seo-category-bar">
              <span className="admin-site-seo-category-bar-label">Category</span>
              <div className="admin-blog-posts-filters" role="group" aria-label="Filter by category">
                {categoryFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`admin-blog-posts-filter admin-site-seo-category-filter${
                      categoryFilter === filter ? ' admin-blog-posts-filter--active' : ''
                    }`}
                    aria-pressed={categoryFilter === filter}
                    onClick={() => handleCategoryChange(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        loading={loading}
        loadingLabel="Loading page SEO records..."
        footer={
          !loading ? (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              total={filteredPages.length}
              onPrevious={() => setPage((current) => current - 1)}
              onNext={() => setPage((current) => current + 1)}
            />
          ) : undefined
        }
      >
        {pagedPages.length === 0 ? (
          <div className="admin-staff-empty">
            <p>No pages found</p>
            <span>Try a different search term, category, or visibility filter.</span>
          </div>
        ) : (
          <div className="admin-staff-table-wrap">
            <table className="admin-staff-table admin-blog-table admin-site-seo-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Category</th>
                  <th>Meta health</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedPages.map((item) => (
                  <tr key={item.id}>
                    <td className="admin-blog-title-cell admin-site-seo-page-cell">
                      <Link to={`/site-seo/${item.pageKey}`} className="admin-site-seo-page-link">
                        <strong>{item.pageName}</strong>
                      </Link>
                      <span>{item.path}</span>
                      <em>{item.metaTitle}</em>
                    </td>
                    <td>
                      <span className={categoryBadgeClass(item.pageCategory)}>{item.pageCategory}</span>
                    </td>
                    <td>
                      <div className="admin-site-seo-length-group">
                        <SeoLengthChip
                          label="Title"
                          length={item.metaTitle.length}
                          min={50}
                          max={60}
                        />
                        <SeoLengthChip
                          label="Desc"
                          length={item.metaDescription.length}
                          min={150}
                          max={160}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="admin-site-seo-status-group">
                        {item.noindex ? (
                          <span className="admin-users-badge">Noindex</span>
                        ) : (
                          <span className="admin-users-badge admin-users-badge--success">Indexable</span>
                        )}
                        {item.isActive ? (
                          <span className="admin-users-badge admin-users-badge--success">Active</span>
                        ) : (
                          <span className="admin-users-badge admin-users-badge--danger">Inactive</span>
                        )}
                        {item.contentActive && item.contentBlocks && item.contentBlocks.length > 0 ? (
                          <span className="admin-site-seo-schema-chip">
                            {item.contentBlocks.length} blocks
                          </span>
                        ) : null}
                        {item.schemaTypes.length > 0 ? (
                          <span className="admin-site-seo-schema-chip">{item.schemaTypes.join(', ')}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="admin-staff-table-date">
                      <strong>{formatDateTime(item.updatedAt)}</strong>
                      <span>{item.pageKey}</span>
                    </td>
                    <td className="admin-site-seo-actions-cell">
                      <div className="admin-staff-actions admin-site-seo-actions">
                        <Link to={`/site-seo/${item.pageKey}`} className="admin-btn admin-btn--ghost">
                          Edit
                        </Link>
                        <a
                          href={`${appUrl}${item.path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-btn admin-btn--ghost"
                        >
                          View live
                        </a>
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
