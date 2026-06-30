import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi, type AdminGenerationLog, type AdminPostListItem } from '../lib/api'

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type AdminTab = 'posts' | 'logs'

export default function AdminAutoBlogPage() {
  const { token } = useAdminAuth()
  const [tab, setTab] = useState<AdminTab>('posts')
  const [posts, setPosts] = useState<AdminPostListItem[]>([])
  const [logs, setLogs] = useState<AdminGenerationLog[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        if (tab === 'posts') {
          const response = await adminApi.listPosts(token!, { page, pageSize, search: query })
          setPosts(response.items)
          setTotal(response.total)
        } else {
          const response = await adminApi.listGenerationLogs(token!, { page, pageSize })
          setLogs(response.items)
          setTotal(response.total)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load auto blog data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, tab, page, pageSize, query])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function switchTab(nextTab: AdminTab) {
    setTab(nextTab)
    setPage(1)
    setSearch('')
    setQuery('')
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Content</p>
          <h1>Auto Blog</h1>
          <p className="admin-page-lead">Monitor generated posts and generation logs across all users.</p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <div className="admin-segmented" role="tablist" aria-label="Auto blog views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'posts'}
          className={`admin-segmented-btn${tab === 'posts' ? ' admin-segmented-btn--active' : ''}`}
          onClick={() => switchTab('posts')}
        >
          Posts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'logs'}
          className={`admin-segmented-btn${tab === 'logs' ? ' admin-segmented-btn--active' : ''}`}
          onClick={() => switchTab('logs')}
        >
          Generation logs
        </button>
      </div>

      <AdminContentCard
        title={tab === 'posts' ? 'All posts' : 'Generation logs'}
        description={
          tab === 'posts'
            ? 'Generated blog posts from every member account.'
            : 'AI generation attempts, token usage, and errors.'
        }
        meta={
          <span className="admin-chip">
            <strong>{total}</strong> {tab === 'posts' ? 'posts' : 'logs'}
          </span>
        }
        toolbar={
          tab === 'posts' ? (
            <form className="admin-search-form" onSubmit={handleSearch}>
              <span className="admin-search-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                type="search"
                className="admin-input admin-search-input"
                placeholder="Search title, keyword, or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit" className="admin-btn">
                Search
              </button>
            </form>
          ) : undefined
        }
        loading={loading}
        loadingLabel="Loading auto blog data..."
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
        {tab === 'posts' ? (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Tokens</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-data-table-empty">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <strong>{post.title || post.keyword || 'Untitled'}</strong>
                        <span className="admin-data-table-sub">{post.keyword}</span>
                      </td>
                      <td>{post.userEmail}</td>
                      <td>
                        <span className="admin-chip admin-chip--muted">{post.status}</span>
                      </td>
                      <td>
                        {post.provider || '—'}
                        <span className="admin-data-table-sub">{post.model || ''}</span>
                      </td>
                      <td className="admin-data-table-num">{post.tokensTotal}</td>
                      <td className="admin-data-table-date">{formatDateTime(post.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Tokens</th>
                  <th>Error</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-data-table-empty">
                      No generation logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <strong>{log.keyword || '—'}</strong>
                      </td>
                      <td>{log.userEmail}</td>
                      <td>
                        <span
                          className={`admin-chip${
                            log.status === 'failed' || log.errorMessage
                              ? ' admin-chip--danger'
                              : ' admin-chip--success'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>
                        {log.provider || '—'}
                        <span className="admin-data-table-sub">{log.model || ''}</span>
                      </td>
                      <td className="admin-data-table-num">{log.tokensTotal}</td>
                      <td className="admin-data-table-error">{log.errorMessage || '—'}</td>
                      <td className="admin-data-table-date">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminContentCard>
    </div>
  )
}
