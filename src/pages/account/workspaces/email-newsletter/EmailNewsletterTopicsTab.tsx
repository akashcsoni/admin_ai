import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faEye,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
  faRotateLeft,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import type { Service } from '../../../../data/services'
import { ApiError, emailNewsletterApi, type EmailNewsletterDetail } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import { formatCreditCostLabel, useServiceCreditCost, useServiceCredits } from '../../../../context/ServiceCreditsContext'
import type { EmailNewsletterCategory, EmailNewsletterSettings, EmailNewsletterTopic } from './emailNewsletter.types'
import { formatNewsletterTopicStatus } from './emailNewsletter.types'
import EmailNewsletterPreview from './EmailNewsletterPreview'
import ServicePagination from './ServicePagination'

const TOPIC_PAGE_SIZE = 10

type TopicTab = 'pending' | 'all' | 'used' | 'failed'

const topicTabs: { value: TopicTab; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'all', label: 'All topics' },
  { value: 'used', label: 'Used' },
  { value: 'failed', label: 'Failed' },
]

type EmailNewsletterTopicsTabProps = {
  service: Service
  settings: EmailNewsletterSettings | null
  onSettingsSaved: (settings: EmailNewsletterSettings) => void
}

function formatTopicCreated(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EmailNewsletterTopicsTab({
  service,
  settings,
  onSettingsSaved,
}: EmailNewsletterTopicsTabProps) {
  const { user, token, refreshUser } = useAuth()
  const { refreshCreditCosts } = useServiceCredits()
  const creditCost = useServiceCreditCost(service.id)
  const creditCostLabel = formatCreditCostLabel(creditCost)
  const [topics, setTopics] = useState<EmailNewsletterTopic[]>([])
  const [categories, setCategories] = useState<EmailNewsletterCategory[]>([])
  const [selectedNewsletter, setSelectedNewsletter] = useState<EmailNewsletterDetail | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [topicTab, setTopicTab] = useState<TopicTab>('pending')
  const [topicSearch, setTopicSearch] = useState('')
  const [showTopicFilters, setShowTopicFilters] = useState(false)
  const [topicPage, setTopicPage] = useState(1)
  const [topicTotal, setTopicTotal] = useState(0)
  const [topicPendingCount, setTopicPendingCount] = useState(0)
  const [newTopic, setNewTopic] = useState('')
  const [newTopicCategoryId, setNewTopicCategoryId] = useState('')
  const [generateTopicCount, setGenerateTopicCount] = useState(10)
  const [loading, setLoading] = useState(true)
  const [generatingTopicId, setGeneratingTopicId] = useState<string | null>(null)
  const [generatingTopics, setGeneratingTopics] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasApiKey = settings?.hasApiKey ?? false
  const isActive = settings?.enabled ?? false
  const hasCredits = (user?.credits ?? 0) >= creditCost

  const loadData = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const [topicsResponse, categoriesResponse] = await Promise.all([
        emailNewsletterApi.listTopics(token, {
          categoryId: selectedCategoryId === 'all' ? undefined : selectedCategoryId,
          status: topicTab === 'all' ? undefined : topicTab,
          page: topicPage,
          pageSize: TOPIC_PAGE_SIZE,
        }),
        emailNewsletterApi.listCategories(token),
      ])

      setTopics(topicsResponse.topics)
      setTopicTotal(topicsResponse.total)
      setTopicPendingCount(topicsResponse.pendingCount)
      setCategories(categoriesResponse.categories)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load topics')
    } finally {
      setLoading(false)
    }
  }, [token, selectedCategoryId, topicTab, topicPage])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredTopics = useMemo(() => {
    const query = topicSearch.trim().toLowerCase()
    if (!query) return topics

    return topics.filter(
      (topic) =>
        topic.topic.toLowerCase().includes(query) ||
        topic.categoryName?.toLowerCase().includes(query) ||
        topic.source.toLowerCase().includes(query),
    )
  }, [topics, topicSearch])

  function flashSuccess(message: string) {
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 2500)
  }

  async function handleToggleActive() {
    if (!token || !settings) return

    setTogglingActive(true)
    setError('')

    try {
      const response = await emailNewsletterApi.saveSettings(token, { enabled: !settings.enabled })
      onSettingsSaved(response.settings)
      flashSuccess(response.settings.enabled ? 'Email newsletters activated' : 'Email newsletters deactivated')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update status')
    } finally {
      setTogglingActive(false)
    }
  }

  async function handleAddTopic() {
    if (!token || !newTopic.trim()) return

    setError('')
    try {
      await emailNewsletterApi.addTopic(token, {
        topic: newTopic.trim(),
        categoryId: newTopicCategoryId || null,
      })
      setNewTopic('')
      await loadData()
      flashSuccess('Topic added')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to add topic')
    }
  }

  async function handleGenerateTopics() {
    if (!token) return

    setGeneratingTopics(true)
    setError('')

    try {
      const response = await emailNewsletterApi.generateTopics(token, {
        count: generateTopicCount,
        categoryId: selectedCategoryId === 'all' ? null : selectedCategoryId,
      })
      await loadData()
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to generate topics')
    } finally {
      setGeneratingTopics(false)
    }
  }

  async function handleGenerateFromTopic(topic: EmailNewsletterTopic) {
    if (!token) return

    setGeneratingTopicId(topic.id)
    setError('')

    try {
      const response = await emailNewsletterApi.generateNewsletter(token, { topicId: topic.id })
      setSelectedNewsletter(response.newsletter)
      await loadData()
      await refreshUser()
      await refreshCreditCosts()
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to generate newsletter')
      await loadData()
    } finally {
      setGeneratingTopicId(null)
    }
  }

  async function handleDeleteTopic(topicId: string) {
    if (!token) return

    setError('')
    try {
      await emailNewsletterApi.deleteTopic(token, topicId)
      await loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete topic')
    }
  }

  async function handleResetTopic(topicId: string) {
    if (!token) return

    setError('')
    try {
      await emailNewsletterApi.resetTopic(token, topicId)
      await loadData()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset topic')
    }
  }

  async function openNewsletter(newsletterId: string) {
    if (!token) return

    try {
      const response = await emailNewsletterApi.getNewsletter(token, newsletterId)
      setSelectedNewsletter(response.newsletter)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to open newsletter')
    }
  }

  const canUseWorkspace = hasApiKey && isActive

  function getCreateNewsletterDisabledReason(topicId: string): string | undefined {
    if (generatingTopicId === topicId) {
      return 'Generating newsletter...'
    }
    if (generatingTopicId) {
      return 'Wait for the current generation to finish'
    }
    if (!hasApiKey) {
      return 'Add your AI API key in Settings'
    }
    if (!isActive) {
      return 'Turn on Email newsletters using the switch above'
    }
    if (!hasCredits) {
      return `You need at least ${creditCostLabel} to generate`
    }
    return undefined
  }

  function renderTopicStatus(topic: EmailNewsletterTopic) {
    if (topic.status === 'used') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
          {formatNewsletterTopicStatus(topic.status)}
        </span>
      )
    }

    if (topic.status === 'failed') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />
          {formatNewsletterTopicStatus(topic.status)}
        </span>
      )
    }

    return <span className="service-logs-status">{formatNewsletterTopicStatus(topic.status)}</span>
  }

  function stopRowClick(event: MouseEvent) {
    event.stopPropagation()
  }

  const topicTotalPages = Math.max(1, Math.ceil(topicTotal / TOPIC_PAGE_SIZE))

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Topic queue</h2>
          <p>Add topics manually or generate them with AI. Create newsletters from pending topics.</p>
        </div>

        <label className="service-active-toggle">
          <span>Email newsletters</span>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            className={`service-active-switch ${isActive ? 'is-active' : ''}`}
            disabled={!settings || togglingActive}
            onClick={() => void handleToggleActive()}
          >
            <span className="service-active-switch-thumb" />
          </button>
          <span className="service-active-toggle-label">{isActive ? 'Active' : 'Inactive'}</span>
        </label>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}
      {success && <p className="service-workspace-alert service-workspace-alert--success">{success}</p>}

      {!hasApiKey && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Add your AI API key in <strong>Settings</strong> before using topics or generating newsletters.
        </p>
      )}

      {settings && !settings.enabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Email newsletters is inactive. Turn it on using the switch above or enable it in Settings.
        </p>
      )}

      {categories.length === 0 && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Create categories with prompts on the <Link to="?tab=categories">Categories tab</Link> before
          generating topics.
        </p>
      )}

      {!hasCredits && canUseWorkspace && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          You need at least {creditCostLabel} to generate a newsletter.{' '}
          <Link to="/account/billing">Buy credits</Link>
        </p>
      )}

      <section className="service-logs-panel service-topics-panel" aria-label="Topic queue">
        <nav className="service-logs-tabs" aria-label="Topic filters">
          {topicTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`service-logs-tab${topicTab === tab.value ? ' service-logs-tab--active' : ''}`}
              onClick={() => {
                setTopicTab(tab.value)
                setTopicPage(1)
              }}
            >
              {tab.label}
              {tab.value === 'pending' && topicPendingCount > 0 ? ` (${topicPendingCount})` : ''}
            </button>
          ))}
        </nav>

        <div className="service-logs-toolbar">
          <form
            className="service-logs-search"
            onSubmit={(event) => {
              event.preventDefault()
            }}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              type="search"
              value={topicSearch}
              placeholder="Search topics..."
              aria-label="Search topics"
              onChange={(event) => setTopicSearch(event.target.value)}
            />
          </form>

          <button
            type="button"
            className={`service-logs-filter-btn${showTopicFilters ? ' service-logs-filter-btn--active' : ''}`}
            onClick={() => setShowTopicFilters((current) => !current)}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            Add filter
          </button>

          <span className="service-logs-count">
            {loading
              ? 'Loading...'
              : `${topicTotal.toLocaleString()} topic${topicTotal === 1 ? '' : 's'} · ${topicPendingCount} pending`}
          </span>
        </div>

        {showTopicFilters && (
          <div className="service-logs-filters">
            <label className="service-logs-filter-field">
              <span>Category</span>
              <select
                value={selectedCategoryId}
                onChange={(event) => {
                  setSelectedCategoryId(event.target.value)
                  setTopicPage(1)
                }}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.pendingTopicCount} pending)
                  </option>
                ))}
              </select>
            </label>

            <label className="service-logs-filter-field">
              <span>AI topic count</span>
              <input
                type="number"
                min="5"
                max="50"
                value={generateTopicCount}
                onChange={(event) => setGenerateTopicCount(Number(event.target.value))}
              />
            </label>

            <div className="service-logs-filter-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!canUseWorkspace || generatingTopics}
                onClick={() => void handleGenerateTopics()}
              >
                {generatingTopics ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>

            <label className="service-logs-filter-field">
              <span>New topic</span>
              <input
                type="text"
                value={newTopic}
                placeholder="Add a topic manually"
                onChange={(event) => setNewTopic(event.target.value)}
              />
            </label>

            <label className="service-logs-filter-field">
              <span>Topic category</span>
              <select
                value={newTopicCategoryId}
                onChange={(event) => setNewTopicCategoryId(event.target.value)}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="service-logs-filter-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!newTopic.trim() || !canUseWorkspace}
                onClick={() => void handleAddTopic()}
              >
                Add topic
              </button>
            </div>
          </div>
        )}

        <div className="service-logs-body">
          {loading ? (
            <p className="service-logs-loading">Loading topics...</p>
          ) : filteredTopics.length === 0 ? (
            <div className="service-logs-empty">
              <p>No topics found</p>
              <span>
                {topicSearch.trim()
                  ? 'Try a different search or filter.'
                  : 'Generate topics with AI or add one manually using Add filter.'}
              </span>
            </div>
          ) : (
            <div className="service-logs-table-wrap">
              <table className="service-logs-table service-topics-table">
                <thead>
                  <tr>
                    <th scope="col" className="service-logs-col-topic">
                      Topic
                    </th>
                    <th scope="col" className="service-logs-col-category">
                      Category
                    </th>
                    <th scope="col" className="service-logs-col-status">
                      Status
                    </th>
                    <th scope="col" className="service-logs-col-meta">
                      Source
                    </th>
                    <th scope="col" className="service-logs-col-created">
                      Added
                    </th>
                    <th scope="col" className="service-logs-col-actions">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.map((topic) => {
                    const createDisabledReason = getCreateNewsletterDisabledReason(topic.id)
                    const isCreateDisabled = Boolean(createDisabledReason)

                    return (
                      <tr
                        key={topic.id}
                        className={`service-logs-table-row${topic.status === 'used' ? ' service-logs-table-row--muted' : ''}`}
                      >
                        <td>
                          <span className="service-logs-cell-text service-logs-cell-text--strong service-logs-cell-text--truncate">
                            {topic.topic}
                          </span>
                        </td>
                        <td>
                          <span className="service-logs-cell-meta service-logs-cell-text--truncate">
                            {topic.categoryName || '—'}
                          </span>
                        </td>
                        <td>{renderTopicStatus(topic)}</td>
                        <td>
                          <span className="service-logs-cell-meta">
                            {topic.source === 'ai' ? 'AI' : 'Manual'}
                          </span>
                        </td>
                        <td className="service-logs-table-date">{formatTopicCreated(topic.createdAt)}</td>
                        <td>
                          <div className="service-logs-row-actions" onClick={stopRowClick}>
                            {topic.status === 'pending' && (
                              <button
                                type="button"
                                className="service-logs-action-btn service-logs-action-btn--primary"
                                disabled={isCreateDisabled}
                                title={createDisabledReason}
                                onClick={() => void handleGenerateFromTopic(topic)}
                              >
                                <FontAwesomeIcon
                                  icon={generatingTopicId === topic.id ? faSpinner : faPenToSquare}
                                  spin={generatingTopicId === topic.id}
                                  aria-hidden="true"
                                />
                                {generatingTopicId === topic.id ? 'Generating...' : 'Create'}
                              </button>
                            )}
                            {topic.status === 'used' && topic.postId && (
                              <button
                                type="button"
                                className="service-logs-action-btn"
                                onClick={() => void openNewsletter(topic.postId!)}
                              >
                                <FontAwesomeIcon icon={faEye} aria-hidden="true" />
                                View
                              </button>
                            )}
                            {topic.status === 'failed' && (
                              <button
                                type="button"
                                className="service-logs-action-btn"
                                onClick={() => void handleResetTopic(topic.id)}
                              >
                                <FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" />
                                Reset
                              </button>
                            )}
                            <button
                              type="button"
                              className="service-logs-action-btn service-logs-action-btn--icon"
                              title="Delete topic"
                              aria-label="Delete topic"
                              onClick={() => void handleDeleteTopic(topic.id)}
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

        {!loading && topicTotalPages > 1 && (
          <ServicePagination
            className="service-logs-footer"
            page={topicPage}
            totalPages={topicTotalPages}
            total={topicTotal}
            label="topics"
            onPrevious={() => setTopicPage((current) => Math.max(1, current - 1))}
            onNext={() => setTopicPage((current) => Math.min(topicTotalPages, current + 1))}
          />
        )}
      </section>

      {selectedNewsletter && (
        <EmailNewsletterPreview newsletter={selectedNewsletter} onClose={() => setSelectedNewsletter(null)} />
      )}
    </div>
  )
}
