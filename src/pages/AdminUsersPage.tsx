import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi, type AdminUserListItem } from '../lib/api'
import AdminUsersTable from '../sections/AdminUsersTable'

type UserTab = 'all' | 'active' | 'suspended' | 'unverified'

const userTabs: { value: UserTab; label: string }[] = [
  { value: 'all', label: 'All members' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'unverified', label: 'Unverified' },
]

function tabIsActive(tab: UserTab, activeTab: UserTab, verifiedFilter: 'any' | 'verified' | 'unverified') {
  if (verifiedFilter === 'unverified' && tab === 'unverified') return true
  if (verifiedFilter === 'verified' && tab === 'active') return true
  return activeTab === tab && verifiedFilter === 'any'
}

export default function AdminUsersPage() {
  const { token } = useAdminAuth()
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<UserTab>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [verifiedFilter, setVerifiedFilter] = useState<'any' | 'verified' | 'unverified'>('any')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const effectiveFilter: UserTab | 'verified' =
    verifiedFilter === 'verified'
      ? 'verified'
      : verifiedFilter === 'unverified'
        ? 'unverified'
        : activeTab

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1)
      setQuery(search.trim())
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.listUsers(token!, {
          search: query,
          page,
          pageSize,
          filter: effectiveFilter,
        })
        setUsers(response.users)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, query, page, pageSize, effectiveFilter])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function handleTabChange(tab: UserTab) {
    setActiveTab(tab)
    setVerifiedFilter('any')
    setPage(1)
  }

  function handleVerifiedFilterChange(value: 'any' | 'verified' | 'unverified') {
    setVerifiedFilter(value)
    if (value === 'any') {
      setActiveTab('all')
    }
    setPage(1)
  }

  return (
    <div className="admin-page admin-logs-page admin-users-logs-page">
      <header className="admin-logs-header">
        <h1>Member users</h1>
        <p className="admin-logs-lead">
          Front-end app accounts only. Admin portal logins are stored separately.
        </p>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <section className="admin-logs-panel" aria-label="Member users list">
        <nav className="admin-logs-tabs" aria-label="Member filters">
          {userTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`admin-logs-tab${tabIsActive(tab.value, activeTab, verifiedFilter) ? ' admin-logs-tab--active' : ''}`}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-logs-toolbar">
          <form className="admin-logs-search" onSubmit={handleSearchSubmit}>
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search..."
              aria-label="Search members"
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <button
            type="button"
            className={`admin-logs-filter-btn${showFilters ? ' admin-logs-filter-btn--active' : ''}`}
            onClick={() => setShowFilters((current) => !current)}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            Add filter
          </button>

          <span className="admin-logs-count">
            {loading ? 'Loading...' : `${total.toLocaleString()} result${total === 1 ? '' : 's'}`}
          </span>
        </div>

        {showFilters && (
          <div className="admin-logs-filters">
            <label className="admin-logs-filter-field">
              <span>Email verified</span>
              <select
                value={verifiedFilter}
                onChange={(event) =>
                  handleVerifiedFilterChange(event.target.value as 'any' | 'verified' | 'unverified')
                }
              >
                <option value="any">Any</option>
                <option value="verified">Verified only</option>
                <option value="unverified">Unverified only</option>
              </select>
            </label>
          </div>
        )}

        <div className="admin-logs-body">
          {loading ? (
            <p className="admin-logs-loading">Loading members...</p>
          ) : (
            <AdminUsersTable users={users} />
          )}
        </div>

        {!loading && totalPages > 1 && (
          <AdminPagination
            className="admin-logs-footer"
            page={page}
            totalPages={totalPages}
            total={total}
            onPrevious={() => setPage((current) => current - 1)}
            onNext={() => setPage((current) => current + 1)}
          />
        )}
      </section>
    </div>
  )
}
