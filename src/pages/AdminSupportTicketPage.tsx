import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  adminApi,
  type SupportTicketDetail,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from '../lib/api'

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminSupportTicketPage() {
  const { ticketId = '' } = useParams()
  const { token, admin } = useAdminAuth()
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null)
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState<SupportTicketStatus>('open')
  const [priority, setPriority] = useState<SupportTicketPriority>('normal')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [replying, setReplying] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !ticketId) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getSupportTicket(token!, ticketId)
        setTicket(response.ticket)
        setStatus(response.ticket.status)
        setPriority(response.ticket.priority)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket')
        setTicket(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, ticketId])

  async function handleReply(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !ticketId || !reply.trim()) return

    setReplying(true)
    setError('')
    setMessage('')
    try {
      const response = await adminApi.replySupportTicket(token, ticketId, reply.trim())
      setTicket(response.ticket)
      setStatus(response.ticket.status)
      setReply('')
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  async function handleUpdateStatus(nextStatus: SupportTicketStatus) {
    if (!token || !ticketId) return

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await adminApi.updateSupportTicket(token, ticketId, {
        status: nextStatus,
        priority,
        assignedAdminId: admin?.id ?? null,
      })
      setTicket(response.ticket)
      setStatus(response.ticket.status)
      setPriority(response.ticket.priority)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  async function handlePriorityChange(nextPriority: SupportTicketPriority) {
    if (!token || !ticketId) return

    setPriority(nextPriority)
    setSaving(true)
    setError('')
    try {
      const response = await adminApi.updateSupportTicket(token, ticketId, {
        status,
        priority: nextPriority,
      })
      setTicket(response.ticket)
      setStatus(response.ticket.status)
      setPriority(response.ticket.priority)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update priority')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page admin-support-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Support ticket</p>
          <h1>{ticket?.subject ?? 'Ticket detail'}</h1>
          <p className="admin-page-lead">
            {ticket
              ? `${ticket.userFullName?.trim() || ticket.userEmail} · #${ticket.id.slice(0, 8)}`
              : 'Loading ticket conversation...'}
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link to="/support" className="admin-btn admin-btn--ghost">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            Back to tickets
          </Link>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      {loading ? (
        <p className="admin-content-loading">Loading ticket...</p>
      ) : !ticket ? (
        <p className="admin-alert admin-alert--error">Support ticket not found.</p>
      ) : (
        <div className="admin-support-detail-layout">
          <AdminContentCard title="Conversation" description="Full message thread with the member.">
            <div className="admin-support-thread">
              {ticket.messages.map((item) => (
                <article
                  key={item.id}
                  className={`admin-support-message admin-support-message--${item.authorType}`}
                >
                  <header>
                    <strong>{item.authorName ?? (item.authorType === 'admin' ? 'Support' : 'Member')}</strong>
                    <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                  </header>
                  <p>{item.message}</p>
                </article>
              ))}
            </div>

            {ticket.status !== 'closed' ? (
              <form className="admin-support-reply-form" onSubmit={handleReply}>
                <label className="admin-field admin-field--wide">
                  <span>Reply to member</span>
                  <textarea
                    className="admin-input admin-textarea"
                    rows={4}
                    value={reply}
                    required
                    onChange={(event) => setReply(event.target.value)}
                  />
                </label>
                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn admin-btn--primary" disabled={replying}>
                    {replying ? 'Sending...' : 'Send reply'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="admin-support-closed-note">This ticket is closed. Reopen it to send another reply.</p>
            )}
          </AdminContentCard>

          <aside className="admin-support-sidebar">
            <AdminContentCard title="Ticket details" description="Status and assignment.">
              <dl className="admin-support-details">
                <div>
                  <dt>Member</dt>
                  <dd>{ticket.userFullName?.trim() || ticket.userEmail}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{ticket.userEmail}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{ticket.category}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDateTime(ticket.createdAt)}</dd>
                </div>
                <div>
                  <dt>Assigned</dt>
                  <dd>{ticket.assignedAdminName ?? 'Unassigned'}</dd>
                </div>
              </dl>

              <div className="admin-support-controls">
                <label className="admin-field">
                  <span>Priority</span>
                  <select
                    className="admin-input"
                    value={priority}
                    disabled={saving}
                    onChange={(event) =>
                      void handlePriorityChange(event.target.value as SupportTicketPriority)
                    }
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </label>

                <label className="admin-field">
                  <span>Status</span>
                  <select
                    className="admin-input"
                    value={status}
                    disabled={saving}
                    onChange={(event) => {
                      const next = event.target.value as SupportTicketStatus
                      setStatus(next)
                      void handleUpdateStatus(next)
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>

                <div className="admin-support-action-buttons">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    disabled={saving || ticket.status === 'resolved'}
                    onClick={() => void handleUpdateStatus('resolved')}
                  >
                    Mark resolved
                  </button>
                  <Link to={`/users/${ticket.userId}`} className="admin-btn admin-btn--ghost">
                    View member
                  </Link>
                </div>
              </div>
            </AdminContentCard>
          </aside>
        </div>
      )}
    </div>
  )
}
