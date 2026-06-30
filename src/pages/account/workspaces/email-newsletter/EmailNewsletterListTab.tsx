import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faEnvelope,
  faMagnifyingGlass,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { ApiError, emailNewsletterApi, type EmailNewsletterDetail } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import EmailNewsletterPreview from './EmailNewsletterPreview'
import type { EmailNewsletterSettings } from './emailNewsletter.types'
import { formatNewsletterDate, formatNewsletterStatus } from './emailNewsletter.types'

type StatusTab = 'all' | 'draft' | 'failed' | 'generating'

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'All newsletters' },
  { value: 'draft', label: 'Ready' },
  { value: 'generating', label: 'Generating' },
  { value: 'failed', label: 'Failed' },
]

type EmailNewsletterListTabProps = {
  settings: EmailNewsletterSettings | null
}

export default function EmailNewsletterListTab({ settings }: EmailNewsletterListTabProps) {
  const { token } = useAuth()
  const [newsletters, setNewsletters] = useState<EmailNewsletterDetail[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState<EmailNewsletterDetail | null>(null)
  const [statusTab, setStatusTab] = useState<StatusTab>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNewsletters = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await emailNewsletterApi.listNewsletters(token)
      setNewsletters(response.newsletters as EmailNewsletterDetail[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load newsletters')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadNewsletters()
  }, [loadNewsletters])

  const filteredNewsletters = useMemo(() => {
    const query = search.trim().toLowerCase()

    return newsletters.filter((newsletter) => {
      if (statusTab !== 'all' && newsletter.status !== statusTab) return false
      if (!query) return true
      return (
        newsletter.topic.toLowerCase().includes(query) ||
        newsletter.subject.toLowerCase().includes(query) ||
        newsletter.previewText.toLowerCase().includes(query)
      )
    })
  }, [newsletters, search, statusTab])

  const statusCounts = useMemo(() => {
    return newsletters.reduce(
      (counts, newsletter) => {
        counts.all += 1
        if (newsletter.status === 'draft') counts.draft += 1
        if (newsletter.status === 'generating') counts.generating += 1
        if (newsletter.status === 'failed') counts.failed += 1
        return counts
      },
      { all: 0, draft: 0, generating: 0, failed: 0 },
    )
  }, [newsletters])

  async function openNewsletter(newsletterId: string) {
    if (!token) return

    try {
      const response = await emailNewsletterApi.getNewsletter(token, newsletterId)
      setSelectedNewsletter(response.newsletter)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to open newsletter')
    }
  }

  async function handleDelete(newsletterId: string, event: React.MouseEvent) {
    event.stopPropagation()
    if (!token) return

    try {
      await emailNewsletterApi.deleteNewsletter(token, newsletterId)
      if (selectedNewsletter?.id === newsletterId) setSelectedNewsletter(null)
      await loadNewsletters()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete newsletter')
    }
  }

  function renderStatus(newsletter: EmailNewsletterDetail) {
    if (newsletter.status === 'draft') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
          {formatNewsletterStatus(newsletter.status)}
        </span>
      )
    }

    if (newsletter.status === 'failed') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />
          {formatNewsletterStatus(newsletter.status)}
        </span>
      )
    }

    if (newsletter.status === 'generating') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faSpinner} spin aria-hidden="true" />
          {formatNewsletterStatus(newsletter.status)}
        </span>
      )
    }

    return <span className="service-logs-status">{formatNewsletterStatus(newsletter.status)}</span>
  }

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Newsletter list</h2>
          <p>Browse generated HTML emails with subject lines, preview text, and send-ready markup.</p>
        </div>

        <Link to="?tab=compose" className="btn btn-primary">
          Compose new
        </Link>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}

      {!settings?.hasApiKey && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Add your AI API key in <Link to="?tab=settings">Settings</Link> before generating newsletters.
        </p>
      )}

      <section className="service-logs-panel service-newsletters-panel" aria-label="Newsletter list">
        <nav className="service-logs-tabs" aria-label="Newsletter status filters">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`service-logs-tab${statusTab === tab.value ? ' service-logs-tab--active' : ''}`}
              onClick={() => setStatusTab(tab.value)}
            >
              {tab.label}
              <span className="service-newsletter-tab-count">{statusCounts[tab.value]}</span>
            </button>
          ))}
        </nav>

        <div className="service-logs-toolbar service-logs-toolbar--compact">
          <form
            className="service-logs-search"
            onSubmit={(event) => {
              event.preventDefault()
            }}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search subject, preview, or topic..."
              aria-label="Search newsletters"
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <span className="service-logs-count">
            {loading
              ? 'Loading...'
              : `${filteredNewsletters.length.toLocaleString()} result${filteredNewsletters.length === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="service-logs-body">
          {loading ? (
            <p className="service-logs-loading">Loading newsletters...</p>
          ) : filteredNewsletters.length === 0 ? (
            <div className="service-logs-empty">
              <p>No newsletters found</p>
              <span>
                {search.trim() || statusTab !== 'all' ? (
                  'Try a different search or filter.'
                ) : (
                  <>
                    Go to <Link to="?tab=compose">Compose</Link> to generate your first HTML email.
                  </>
                )}
              </span>
            </div>
          ) : (
            <div className="service-logs-table-wrap">
              <table className="service-logs-table service-newsletters-table">
                <thead>
                  <tr>
                    <th scope="col" className="service-logs-col-topic">
                      Subject
                    </th>
                    <th scope="col" className="service-logs-col-meta">
                      Preview text
                    </th>
                    <th scope="col" className="service-logs-col-status">
                      Status
                    </th>
                    <th scope="col" className="service-logs-col-created">
                      Created
                    </th>
                    <th scope="col" className="service-logs-col-actions">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNewsletters.map((newsletter) => {
                    const canOpen = newsletter.status !== 'generating'

                    return (
                      <tr
                        key={newsletter.id}
                        className={`service-logs-table-row service-logs-table-row--clickable${
                          newsletter.status === 'failed' ? ' service-logs-table-row--muted' : ''
                        }`}
                        tabIndex={canOpen ? 0 : -1}
                        onClick={() => {
                          if (canOpen) void openNewsletter(newsletter.id)
                        }}
                        onKeyDown={(event) => {
                          if (!canOpen) return
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            void openNewsletter(newsletter.id)
                          }
                        }}
                      >
                        <td>
                          <span className="service-newsletter-subject-cell">
                            <span className="service-newsletter-type-badge" aria-hidden="true">
                              <FontAwesomeIcon icon={faEnvelope} />
                            </span>
                            <span className="service-newsletter-subject-copy">
                              <span className="service-logs-cell-text service-logs-cell-text--strong service-logs-cell-text--truncate">
                                {newsletter.subject || 'Untitled newsletter'}
                              </span>
                              <span className="service-newsletter-topic-line service-logs-cell-text--truncate">
                                {newsletter.topic}
                              </span>
                            </span>
                          </span>
                          {newsletter.errorMessage && (
                            <span className="service-logs-cell-error">{newsletter.errorMessage}</span>
                          )}
                        </td>
                        <td>
                          <span className="service-logs-cell-meta service-logs-cell-text--truncate">
                            {newsletter.previewText || '—'}
                          </span>
                        </td>
                        <td>{renderStatus(newsletter)}</td>
                        <td className="service-logs-table-date">{formatNewsletterDate(newsletter.createdAt)}</td>
                        <td>
                          <div className="service-logs-row-actions">
                            <button
                              type="button"
                              className="service-logs-action-btn service-logs-action-btn--icon"
                              title="Delete newsletter"
                              aria-label="Delete newsletter"
                              onClick={(event) => void handleDelete(newsletter.id, event)}
                            >
                              <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {selectedNewsletter && (
        <EmailNewsletterPreview
          newsletter={selectedNewsletter}
          onClose={() => setSelectedNewsletter(null)}
        />
      )}
    </div>
  )
}
