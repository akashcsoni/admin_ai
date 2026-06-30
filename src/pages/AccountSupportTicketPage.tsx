import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCalendarDays,
  faHashtag,
  faHeadset,
  faMessage,
  faPaperPlane,
  faTag,
  faUser,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons'
import AccountHero from '../components/AccountHero'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import {
  supportApi,
  type SupportTicketDetail,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from '../lib/api'
import '../styles/account.css'
import '../styles/account-dashboard.css'
import '../styles/account-support.css'

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
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

function formatChatDay(value: string): string {
  const date = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const messageDay = new Date(date)
  messageDay.setHours(0, 0, 0, 0)
  const dayDiff = Math.round((today.getTime() - messageDay.getTime()) / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function formatChatTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AccountSupportTicketPage() {
  const { ticketId = '' } = useParams()
  const { token } = useAuth()
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token || !ticketId) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await supportApi.getTicket(token!, ticketId)
        setTicket(response.ticket)
      } catch (err) {
        setTicket(null)
        setError(err instanceof Error ? err.message : 'Failed to load support ticket')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, ticketId])

  useEffect(() => {
    const chat = chatRef.current
    if (!chat) return
    chat.scrollTop = chat.scrollHeight
  }, [ticket?.messages.length, ticket?.id])

  async function handleReply(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !ticketId || !reply.trim()) return

    setReplying(true)
    setError('')
    setSuccess('')
    try {
      const response = await supportApi.reply(token, ticketId, reply.trim())
      setTicket(response.ticket)
      setReply('')
      setSuccess(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  const seo = pageSeo.support
  const isClosed = ticket?.status === 'closed'

  return (
    <>
      <SEO
        title={`${ticket?.subject ?? 'Support ticket'} — ${seo.title}`}
        description={ticket?.lastMessagePreview || seo.description}
        path={`/account/support/${ticketId}`}
        keywords={[...seo.keywords]}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Account', path: '/account' },
          { name: 'Support', path: '/account/support' },
          { name: ticket?.subject ?? 'Ticket', path: `/account/support/${ticketId}` },
        ])}
      />

      <div className="account-page account-support-page account-support-detail-page">
        <AccountHero
          activeTab="support"
          eyebrow="Support ticket"
          title={ticket?.subject ?? 'Ticket detail'}
          lead={
            ticket
              ? `${statusLabel(ticket.status)} · ${ticket.category} · #${ticket.id.slice(0, 8)}`
              : 'View your conversation with our support team.'
          }
          breadcrumb={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Support', to: '/account/support' },
            { label: ticket?.subject ?? 'Ticket' },
          ]}
          action={
            <Link to="/account/support" className="btn btn-secondary">
              <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
              All tickets
            </Link>
          }
        />

        <section className="account-dashboard account-support-dashboard" aria-label="Ticket conversation">
          <div className="account-container">
            {error && <p className="account-alert account-alert--error">{error}</p>}
            {success && <p className="account-alert account-alert--success">{success}</p>}

            {loading ? (
              <p className="account-muted">Loading ticket...</p>
            ) : !ticket ? (
              <div className="account-support-empty account-support-empty--page">
                <span className="account-support-empty-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faHeadset} />
                </span>
                <p>Support ticket not found.</p>
                <Link to="/account/support" className="btn btn-primary">
                  Back to support
                </Link>
              </div>
            ) : (
              <>
                <div className="account-home-stats account-support-stats account-support-detail-stats">
                  <div className="account-home-stat account-home-stat--featured">
                    <div className="account-home-stat-head">
                      <span>Status</span>
                      <FontAwesomeIcon icon={faHeadset} aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value account-support-stat-status">
                      <span className={statusClass(ticket.status)}>{statusLabel(ticket.status)}</span>
                    </p>
                    <p className="account-home-stat-sub">
                      {isClosed ? 'This ticket is archived' : 'Our team will reply in this thread'}
                    </p>
                  </div>

                  <div className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Messages</span>
                      <FontAwesomeIcon icon={faMessage} aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value">{ticket.messageCount}</p>
                    <p className="account-home-stat-sub">In this conversation</p>
                  </div>

                  <div className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Category</span>
                      <FontAwesomeIcon icon={faTag} aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value account-support-stat-text">
                      {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                    </p>
                    <p className="account-home-stat-sub">Priority: {priorityLabel(ticket.priority)}</p>
                  </div>

                  <div className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Last updated</span>
                      <FontAwesomeIcon icon={faCalendarDays} aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value account-support-stat-date">
                      {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="account-home-stat-sub">{formatDateTime(ticket.updatedAt)}</p>
                  </div>
                </div>

                <div className="account-home-layout account-support-detail-layout">
                  <div className="account-panel account-support-conversation-panel">
                    <div className="account-support-conversation-head">
                      <div className="account-support-conversation-head-copy">
                        <h2>Conversation</h2>
                        <p>
                          {ticket.assignedAdminName
                            ? `${ticket.assignedAdminName} from our support team can reply here.`
                            : 'Message history with the Content AI support team.'}
                        </p>
                      </div>
                      <div className="account-support-conversation-meta">
                        <span className={statusClass(ticket.status)}>{statusLabel(ticket.status)}</span>
                        <span className="account-support-count-chip">
                          <strong>{ticket.messages.length}</strong> messages
                        </span>
                      </div>
                    </div>

                    <div className="account-support-chat" ref={chatRef} aria-label="Message thread">
                      {ticket.messages.length === 0 ? (
                        <div className="account-support-chat-empty">
                          <p>No messages yet.</p>
                          <span>Send a reply below to continue this conversation.</span>
                        </div>
                      ) : (
                        ticket.messages.map((item, index) => {
                          const previous = ticket.messages[index - 1]
                          const showDayDivider =
                            !previous || formatChatDay(previous.createdAt) !== formatChatDay(item.createdAt)
                          const isAdmin = item.authorType === 'admin'
                          const authorName = isAdmin
                            ? item.authorName ?? 'Support team'
                            : 'You'

                          return (
                            <Fragment key={item.id}>
                              {showDayDivider ? (
                                <div className="account-support-chat-day" role="separator">
                                  <span>{formatChatDay(item.createdAt)}</span>
                                </div>
                              ) : null}
                              <article
                                className={`account-support-chat-row account-support-chat-row--${item.authorType}`}
                              >
                                {isAdmin ? (
                                  <span className="account-support-chat-avatar" aria-hidden="true">
                                    <FontAwesomeIcon icon={faUserShield} />
                                  </span>
                                ) : null}
                                <div className="account-support-chat-bubble">
                                  <header className="account-support-chat-bubble-head">
                                    <strong>{authorName}</strong>
                                    <time dateTime={item.createdAt}>{formatChatTime(item.createdAt)}</time>
                                  </header>
                                  <p>{item.message}</p>
                                </div>
                                {!isAdmin ? (
                                  <span className="account-support-chat-avatar account-support-chat-avatar--user" aria-hidden="true">
                                    <FontAwesomeIcon icon={faUser} />
                                  </span>
                                ) : null}
                              </article>
                            </Fragment>
                          )
                        })
                      )}
                    </div>

                    {!isClosed ? (
                      <form className="account-support-composer" onSubmit={handleReply}>
                        <label className="account-support-composer-field">
                          <span className="account-support-composer-label">Write a reply</span>
                          <textarea
                            className="account-support-input account-support-textarea account-support-composer-input"
                            rows={3}
                            required
                            value={reply}
                            placeholder="Type your message to support..."
                            onChange={(event) => setReply(event.target.value)}
                          />
                        </label>
                        <div className="account-support-composer-actions">
                          <p className="account-support-composer-hint">
                            Replies are visible to our support team in this ticket thread.
                          </p>
                          <button type="submit" className="btn btn-primary" disabled={replying || !reply.trim()}>
                            <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" />
                            {replying ? 'Sending...' : 'Send reply'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="account-support-composer account-support-composer--closed">
                        <p>This ticket is closed. Start a new ticket if you need more help.</p>
                        <Link to="/account/support" className="btn btn-secondary">
                          Back to support
                        </Link>
                      </div>
                    )}
                  </div>

                  <aside className="account-dashboard-sidebar account-support-sidebar account-support-detail-sidebar">
                    <div className="account-panel account-support-detail-panel">
                      <div className="account-home-section-head">
                        <div>
                          <h2>Ticket details</h2>
                          <p>Reference info for this request.</p>
                        </div>
                      </div>

                      <dl className="account-support-detail-list">
                        <div>
                          <dt>
                            <FontAwesomeIcon icon={faHashtag} aria-hidden="true" />
                            Ticket ID
                          </dt>
                          <dd>{ticket.id}</dd>
                        </div>
                        <div>
                          <dt>
                            <FontAwesomeIcon icon={faTag} aria-hidden="true" />
                            Category
                          </dt>
                          <dd>{ticket.category}</dd>
                        </div>
                        <div>
                          <dt>Priority</dt>
                          <dd>{priorityLabel(ticket.priority)}</dd>
                        </div>
                        <div>
                          <dt>Status</dt>
                          <dd>
                            <span className={statusClass(ticket.status)}>{statusLabel(ticket.status)}</span>
                          </dd>
                        </div>
                        <div>
                          <dt>Created</dt>
                          <dd>{formatDateTime(ticket.createdAt)}</dd>
                        </div>
                        <div>
                          <dt>Updated</dt>
                          <dd>{formatDateTime(ticket.updatedAt)}</dd>
                        </div>
                        {ticket.assignedAdminName ? (
                          <div>
                            <dt>Assigned to</dt>
                            <dd>{ticket.assignedAdminName}</dd>
                          </div>
                        ) : null}
                        {ticket.resolvedAt ? (
                          <div>
                            <dt>Resolved</dt>
                            <dd>{formatDateTime(ticket.resolvedAt)}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </aside>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
