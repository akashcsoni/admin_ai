import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faArrowRotateRight,
  faCheck,
  faCircleQuestion,
  faClock,
  faCreditCard,
  faHeadset,
  faInbox,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import AccountHero from '../components/AccountHero'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import {
  supportApi,
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
  type SupportTicketSummary,
} from '../lib/api'
import '../styles/account.css'
import '../styles/account-dashboard.css'
import '../styles/account-support.css'

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: SupportTicketStatus): string {
  if (status === 'in_progress') return 'In progress'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusClass(status: SupportTicketStatus): string {
  if (status === 'open' || status === 'in_progress') return 'account-support-status account-support-status--open'
  if (status === 'resolved') return 'account-support-status account-support-status--resolved'
  if (status === 'closed') return 'account-support-status account-support-status--closed'
  return 'account-support-status'
}

function priorityLabel(priority: SupportTicketPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const categories: { value: SupportTicketCategory; label: string }[] = [
  { value: 'billing', label: 'Billing' },
  { value: 'credits', label: 'Credits' },
  { value: 'technical', label: 'Technical' },
  { value: 'account', label: 'Account' },
  { value: 'general', label: 'General' },
]

export default function AccountSupportPage() {
  const { token } = useAuth()
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<SupportTicketCategory>('general')
  const [priority, setPriority] = useState<SupportTicketPriority>('normal')
  const [message, setMessage] = useState('')

  const seo = pageSeo.support

  const loadTickets = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const response = await supportApi.listTickets(token)
      setTickets(response.tickets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadTickets()
  }, [loadTickets])

  const stats = useMemo(() => {
    return {
      open: tickets.filter((ticket) => ticket.status === 'open' || ticket.status === 'in_progress').length,
      resolved: tickets.filter((ticket) => ticket.status === 'resolved').length,
      closed: tickets.filter((ticket) => ticket.status === 'closed').length,
      total: tickets.length,
    }
  }, [tickets])

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return

    setCreating(true)
    setError('')
    setSuccess('')
    try {
      const response = await supportApi.createTicket(token, {
        subject,
        category,
        priority,
        message,
      })
      setSuccess(response.message)
      setSubject('')
      setMessage('')
      setCategory('general')
      setPriority('normal')
      await loadTickets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create support ticket')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        path={seo.path}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Account', path: '/account' },
          { name: 'Support', path: '/account/support' },
        ])}
      />

      <div className="account-page account-support-page">
        <AccountHero
          activeTab="support"
          eyebrow="Help center"
          title="Support"
          lead="Create a ticket for billing, credits, technical issues, or account help. Our team will reply here."
          breadcrumb={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Support' },
          ]}
        />

        <section className="account-dashboard account-support-dashboard" aria-label="Support tickets">
          <div className="account-container">
            <div className="account-home-toolbar">
              <p className="account-support-toolbar-note">
                Track open requests and start a new conversation with our team.
              </p>
              <button
                type="button"
                className="usage-icon-btn"
                onClick={() => void loadTickets()}
                title="Refresh tickets"
              >
                <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} aria-hidden="true" />
              </button>
            </div>

            {error && <p className="account-alert account-alert--error">{error}</p>}
            {success && <p className="account-alert account-alert--success">{success}</p>}

            <div className="account-home-stats account-support-stats">
              <div className="account-home-stat account-home-stat--featured">
                <div className="account-home-stat-head">
                  <span>Open tickets</span>
                  <FontAwesomeIcon icon={faHeadset} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value">{stats.open}</p>
                <p className="account-home-stat-sub">
                  {stats.open === 0 ? 'No active requests right now' : 'Waiting for or receiving a reply'}
                </p>
                <a href="#new-ticket" className="account-home-stat-action">
                  <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                  New ticket
                </a>
              </div>

              <div className="account-home-stat">
                <div className="account-home-stat-head">
                  <span>Total tickets</span>
                  <FontAwesomeIcon icon={faInbox} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value">{stats.total}</p>
                <p className="account-home-stat-sub">All conversations with support</p>
              </div>

              <div className="account-home-stat">
                <div className="account-home-stat-head">
                  <span>Resolved</span>
                  <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value">{stats.resolved}</p>
                <p className="account-home-stat-sub">Marked resolved by our team</p>
              </div>

              <div className="account-home-stat">
                <div className="account-home-stat-head">
                  <span>Closed</span>
                  <FontAwesomeIcon icon={faClock} aria-hidden="true" />
                </div>
                <p className="account-home-stat-value">{stats.closed}</p>
                <p className="account-home-stat-sub">Archived — open a new ticket if needed</p>
              </div>
            </div>

            <div className="account-home-layout account-support-layout">
              <div className="account-panel account-support-tickets-panel">
                <div className="account-home-section-head">
                  <div>
                    <h2>Your tickets</h2>
                    <p>Track replies and status updates from our support team.</p>
                  </div>
                  <span className="account-support-count-chip">
                    <strong>{stats.total}</strong> total
                  </span>
                </div>

                {loading ? (
                  <p className="account-muted">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                  <div className="account-support-empty">
                    <span className="account-support-empty-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faInbox} />
                    </span>
                    <p>No support tickets yet</p>
                    <span>Create your first ticket using the form on the right.</span>
                    <a href="#new-ticket" className="btn btn-primary">
                      Create ticket
                    </a>
                  </div>
                ) : (
                  <ul className="account-support-ticket-grid">
                    {tickets.map((ticket) => (
                      <li key={ticket.id}>
                        <Link to={`/account/support/${ticket.id}`} className="account-support-ticket-card">
                          <div className="account-support-ticket-card-top">
                            <span className="account-support-ticket-icon" aria-hidden="true">
                              <FontAwesomeIcon icon={faHeadset} />
                            </span>
                            <span className={statusClass(ticket.status)}>{statusLabel(ticket.status)}</span>
                          </div>
                          <strong>{ticket.subject}</strong>
                          <div className="account-support-ticket-meta">
                            <span className="account-support-chip">{ticket.category}</span>
                            <span className="account-support-chip account-support-chip--muted">
                              {priorityLabel(ticket.priority)}
                            </span>
                            <span>#{ticket.id.slice(0, 8)}</span>
                          </div>
                          {ticket.lastMessagePreview ? (
                            <p className="account-support-ticket-preview">{ticket.lastMessagePreview}</p>
                          ) : null}
                          <div className="account-support-ticket-footer">
                            <time dateTime={ticket.updatedAt}>Updated {formatDateTime(ticket.updatedAt)}</time>
                            <span className="account-support-ticket-link">
                              View thread
                              <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <aside className="account-dashboard-sidebar account-support-sidebar">
                <div className="account-panel account-support-create-panel" id="new-ticket">
                  <div className="account-home-section-head">
                    <div>
                      <h2>Create ticket</h2>
                      <p>Describe your issue and we will get back to you as soon as possible.</p>
                    </div>
                  </div>

                  <form className="account-support-form" onSubmit={handleCreate}>
                    <label className="account-support-field">
                      <span>Subject</span>
                      <input
                        className="account-support-input"
                        value={subject}
                        required
                        maxLength={255}
                        placeholder="Brief summary of your issue"
                        onChange={(event) => setSubject(event.target.value)}
                      />
                    </label>

                    <div className="account-support-form-row">
                      <label className="account-support-field">
                        <span>Category</span>
                        <select
                          className="account-support-input"
                          value={category}
                          onChange={(event) =>
                            setCategory(event.target.value as SupportTicketCategory)
                          }
                        >
                          {categories.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="account-support-field">
                        <span>Priority</span>
                        <select
                          className="account-support-input"
                          value={priority}
                          onChange={(event) =>
                            setPriority(event.target.value as SupportTicketPriority)
                          }
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </label>
                    </div>

                    <label className="account-support-field">
                      <span>Message</span>
                      <textarea
                        className="account-support-input account-support-textarea"
                        rows={5}
                        required
                        value={message}
                        placeholder="Tell us what happened and how we can help..."
                        onChange={(event) => setMessage(event.target.value)}
                      />
                    </label>

                    <div className="account-support-actions">
                      <button type="submit" className="btn btn-primary btn-block" disabled={creating}>
                        {creating ? 'Submitting...' : 'Submit ticket'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="account-panel">
                  <div className="account-home-section-head">
                    <div>
                      <h2>Quick help</h2>
                      <p>Common topics you can resolve without waiting.</p>
                    </div>
                  </div>

                  <div className="account-home-quick-links">
                    <Link to="/account/billing" className="account-home-quick-link">
                      <div>
                        <strong>Billing & credits</strong>
                        <span>Buy credits or review payment history</span>
                      </div>
                      <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" />
                    </Link>
                    <Link to="/faq" className="account-home-quick-link">
                      <div>
                        <strong>FAQ</strong>
                        <span>Answers to common platform questions</span>
                      </div>
                      <FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" />
                    </Link>
                    <Link to="/account/usage" className="account-home-quick-link">
                      <div>
                        <strong>Usage</strong>
                        <span>See credits used and generation activity</span>
                      </div>
                      <em>→</em>
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
