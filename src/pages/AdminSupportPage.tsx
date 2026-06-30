import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadset, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi, type SupportTicketStatus, type SupportTicketSummary } from '../lib/api'

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusBadge(status: SupportTicketStatus) {
  if (status === 'open') return 'admin-users-badge admin-users-badge--danger'
  if (status === 'in_progress') return 'admin-users-badge admin-users-badge--admin'
  if (status === 'resolved') return 'admin-users-badge admin-users-badge--success'
  return 'admin-users-badge'
}

function statusLabel(status: SupportTicketStatus): string {
  if (status === 'in_progress') return 'In progress'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function AdminSupportPage() {
  const { token } = useAdminAuth()
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([])
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 })
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return

    async function loadStats() {
      try {
        const response = await adminApi.getSupportStats(token!)
        setStats(response.stats)
      } catch {
        setStats({ open: 0, inProgress: 0, resolved: 0, closed: 0 })
      }
    }

    void loadStats()
  }, [token])

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.listSupportTickets(token!, {
          search: query,
          status: statusFilter,
          page,
          pageSize,
        })
        setTickets(response.tickets)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load support tickets')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, query, statusFilter, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  return (
    <div className="admin-page admin-support-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Member help</p>
          <h1>Support tickets</h1>
          <p className="admin-page-lead">
            Review member requests, reply to tickets, and mark issues as resolved.
          </p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <section className="admin-stat-grid admin-stat-grid--dashboard" aria-label="Support overview">
        <article className="admin-stat-card admin-stat-card--amber">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faHeadset} />
            </span>
            <p className="admin-stat-label">Open</p>
          </div>
          <p className="admin-stat-value">{stats.open}</p>
          <p className="admin-stat-meta">Waiting for support response</p>
        </article>

        <article className="admin-stat-card admin-stat-card--blue">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faHeadset} />
            </span>
            <p className="admin-stat-label">In progress</p>
          </div>
          <p className="admin-stat-value">{stats.inProgress}</p>
          <p className="admin-stat-meta">Being handled by support</p>
        </article>

        <article className="admin-stat-card admin-stat-card--green">
          <div className="admin-stat-card-top">
            <span className="admin-stat-card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faHeadset} />
            </span>
            <p className="admin-stat-label">Resolved</p>
          </div>
          <p className="admin-stat-value">{stats.resolved}</p>
          <p className="admin-stat-meta">{stats.closed} closed tickets</p>
        </article>
      </section>

      <AdminContentCard
        title="All tickets"
        description="Newest and open tickets appear first."
        meta={
          <span className="admin-chip">
            <strong>{total}</strong> tickets
          </span>
        }
        toolbar={
          <div className="admin-blog-toolbar">
            <form className="admin-search-form" onSubmit={handleSearch}>
              <span className="admin-search-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                type="search"
                className="admin-input admin-search-input"
                placeholder="Search subject, email, or name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button type="submit" className="admin-btn">
                Search
              </button>
            </form>

            <select
              className="admin-input admin-blog-status-filter"
              value={statusFilter}
              onChange={(event) => {
                setPage(1)
                setStatusFilter(event.target.value as SupportTicketStatus | 'all')
              }}
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        }
        loading={loading}
        loadingLabel="Loading tickets..."
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
        {tickets.length === 0 ? (
          <div className="admin-staff-empty">
            <p>No support tickets yet</p>
            <span>Tickets created by members will appear here.</span>
          </div>
        ) : (
          <div className="admin-staff-table-wrap">
            <table className="admin-staff-table admin-support-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="admin-blog-title-cell">
                      <strong>{ticket.subject}</strong>
                      <span>{ticket.category.replace(/_/g, ' ')} · #{ticket.id.slice(0, 8)}</span>
                      {ticket.lastMessagePreview ? <em>{ticket.lastMessagePreview}</em> : null}
                    </td>
                    <td>
                      <strong>{ticket.userFullName?.trim() || ticket.userEmail}</strong>
                      <span className="admin-support-member-email">{ticket.userEmail}</span>
                    </td>
                    <td>
                      <span className={statusBadge(ticket.status)}>{statusLabel(ticket.status)}</span>
                    </td>
                    <td>{ticket.priority}</td>
                    <td className="admin-staff-table-date">
                      <strong>{formatDateTime(ticket.updatedAt)}</strong>
                      <span>{ticket.messageCount} message{ticket.messageCount === 1 ? '' : 's'}</span>
                    </td>
                    <td>
                      <Link to={`/support/${ticket.id}`} className="admin-btn admin-btn--ghost">
                        Open
                      </Link>
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
