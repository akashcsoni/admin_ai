import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faMagnifyingGlass,
  faRotateLeft,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import type { Service } from '../../../../data/services'
import { ApiError, autoBlogApi, type AutoBlogPostDetail } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import {
  formatCreditCostLabel,
  useServiceCreditCost,
  useServiceCredits,
} from '../../../../context/ServiceCreditsContext'
import type { AutoBlogSettings } from './autoBlog.types'
import { formatBlogDate, formatPostStatus } from './autoBlog.types'
import AutoBlogPostPreview from './AutoBlogPostPreview'
import ServicePagination from './ServicePagination'

const POST_PAGE_SIZE = 10

type PostTab = 'all' | 'draft' | 'published' | 'failed'

const postTabs: { value: PostTab; label: string }[] = [
  { value: 'all', label: 'All posts' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
]

type AutoBlogListTabProps = {
  service: Service
  settings: AutoBlogSettings | null
  onSettingsSaved: (settings: AutoBlogSettings) => void
}

export default function AutoBlogListTab({
  service,
  settings,
  onSettingsSaved,
}: AutoBlogListTabProps) {
  const { user, token, refreshUser } = useAuth()
  const { refreshCreditCosts } = useServiceCredits()
  const creditCost = useServiceCreditCost(service.id)
  const creditCostLabel = formatCreditCostLabel(creditCost)
  const [posts, setPosts] = useState<AutoBlogPostDetail[]>([])
  const [selectedPost, setSelectedPost] = useState<AutoBlogPostDetail | null>(null)
  const [postTab, setPostTab] = useState<PostTab>('all')
  const [postSearch, setPostSearch] = useState('')
  const [postPage, setPostPage] = useState(1)
  const [postTotal, setPostTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [recreatingPostId, setRecreatingPostId] = useState<string | null>(null)
  const [togglingActive, setTogglingActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasApiKey = settings?.hasApiKey ?? false
  const isActive = settings?.enabled ?? false
  const hasCredits = (user?.credits ?? 0) >= creditCost

  const loadData = useCallback(async (options?: { status?: PostTab; page?: number }) => {
    if (!token) return

    const statusFilter = options?.status ?? postTab
    const page = options?.page ?? postPage

    setLoading(true)
    setError('')

    try {
      const postsResponse = await autoBlogApi.listPosts(token, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
        pageSize: POST_PAGE_SIZE,
      })
      setPosts(postsResponse.posts as AutoBlogPostDetail[])
      setPostTotal(postsResponse.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load blog posts')
    } finally {
      setLoading(false)
    }
  }, [token, postTab, postPage])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filteredPosts = useMemo(() => {
    const query = postSearch.trim().toLowerCase()
    if (!query) return posts

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        (post.topicLabel || post.keyword).toLowerCase().includes(query) ||
        (post.categoryName || '').toLowerCase().includes(query),
    )
  }, [posts, postSearch])

  const postTotalPages = Math.max(1, Math.ceil(postTotal / POST_PAGE_SIZE))

  function flashSuccess(message: string) {
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 2500)
  }

  async function handleToggleActive() {
    if (!token || !settings) return

    setTogglingActive(true)
    setError('')

    try {
      const response = await autoBlogApi.saveSettings(token, { enabled: !settings.enabled })
      onSettingsSaved(response.settings)
      flashSuccess(response.settings.enabled ? 'Auto blog activated' : 'Auto blog deactivated')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update status')
    } finally {
      setTogglingActive(false)
    }
  }

  async function openPost(postId: string) {
    if (!token) return

    try {
      const response = await autoBlogApi.getPost(token, postId)
      setSelectedPost(response.post)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to open blog post')
    }
  }

  async function handleRecreatePost(post: AutoBlogPostDetail) {
    if (!token) return

    setRecreatingPostId(post.id)
    setError('')

    try {
      const response = await autoBlogApi.generatePost(token, { postId: post.id })
      await loadData()
      await refreshUser()
      await refreshCreditCosts()
      if (response.failed) {
        setError(response.message)
        setSelectedPost(response.post)
      } else {
        setSelectedPost(response.post)
        setError('')
        flashSuccess(response.message)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to recreate blog post')
      await loadData()
    } finally {
      setRecreatingPostId(null)
    }
  }

  function getRecreateDisabledReason(postId: string): string | undefined {
    if (recreatingPostId === postId) {
      return 'Recreating blog post...'
    }
    if (recreatingPostId) {
      return 'Wait for the current generation to finish'
    }
    if (!hasApiKey) {
      return 'Add your AI API key in Settings'
    }
    if (!isActive) {
      return 'Turn on Auto blog using the switch above'
    }
    if (!hasCredits) {
      return `You need at least ${creditCostLabel} to recreate`
    }
    return undefined
  }

  function stopRowClick(event: MouseEvent) {
    event.stopPropagation()
  }

  function renderPostStatus(post: AutoBlogPostDetail) {
    if (post.status === 'published') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
          {formatPostStatus(post.status)}
        </span>
      )
    }

    if (post.status === 'failed') {
      return (
        <span className="service-logs-status">
          <FontAwesomeIcon icon={faCircleXmark} aria-hidden="true" />
          {formatPostStatus(post.status)}
        </span>
      )
    }

    return <span className="service-logs-status">{formatPostStatus(post.status)}</span>
  }

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Blog list</h2>
          <p>Generated blog posts from your topic queue. Click a row to preview content.</p>
        </div>

        <label className="service-active-toggle">
          <span>Auto blog</span>
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
          Add your AI API key in <strong>Settings</strong> before generating posts.
        </p>
      )}

      {settings && !settings.enabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Auto blog is inactive. Turn it on using the switch above or enable it in Settings.
        </p>
      )}

      <section className="service-logs-panel service-posts-panel" aria-label="Generated blogs">
        <nav className="service-logs-tabs" aria-label="Blog post filters">
          {postTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`service-logs-tab${postTab === tab.value ? ' service-logs-tab--active' : ''}`}
              onClick={() => {
                setPostTab(tab.value)
                setPostPage(1)
              }}
            >
              {tab.label}
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
              value={postSearch}
              placeholder="Search posts..."
              aria-label="Search blog posts"
              onChange={(event) => setPostSearch(event.target.value)}
            />
          </form>

          <span className="service-logs-count">
            {loading
              ? 'Loading...'
              : `${filteredPosts.length.toLocaleString()} result${filteredPosts.length === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="service-logs-body">
          {loading ? (
            <p className="service-logs-loading">Loading blog posts...</p>
          ) : filteredPosts.length === 0 ? (
            <div className="service-logs-empty">
              <p>No blog posts found</p>
              <span>
                {postSearch.trim() || postTab !== 'all'
                  ? 'Try a different search or filter.'
                  : (
                      <>
                        Pick a pending topic on the{' '}
                        <Link to="?tab=topics">Topic queue tab</Link> and click Create.
                      </>
                    )}
              </span>
            </div>
          ) : (
            <div className="service-logs-table-wrap">
              <table className="service-logs-table service-posts-table">
                <thead>
                  <tr>
                    <th scope="col" className="service-logs-col-topic">
                      Title
                    </th>
                    <th scope="col" className="service-logs-col-category">
                      Topic
                    </th>
                    <th scope="col" className="service-logs-col-meta">
                      Category
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
                  {filteredPosts.map((post) => {
                    const canOpen = post.status !== 'generating' && post.status !== 'failed'
                    const recreateDisabledReason = getRecreateDisabledReason(post.id)
                    const isRecreateDisabled = Boolean(recreateDisabledReason)

                    return (
                      <tr
                        key={post.id}
                        className={`service-logs-table-row${
                          canOpen ? ' service-logs-table-row--clickable' : ''
                        }${post.status === 'failed' ? ' service-logs-table-row--muted' : ''}`}
                        tabIndex={canOpen ? 0 : -1}
                        onClick={() => {
                          if (canOpen) void openPost(post.id)
                        }}
                        onKeyDown={(event) => {
                          if (!canOpen) return
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            void openPost(post.id)
                          }
                        }}
                      >
                        <td>
                          <span className="service-logs-cell-text service-logs-cell-text--strong service-logs-cell-text--truncate">
                            {post.title}
                          </span>
                          {post.errorMessage && (
                            <span className="service-logs-cell-error">{post.errorMessage}</span>
                          )}
                          {post.livePublishError && (
                            <span className="service-logs-cell-error">{post.livePublishError}</span>
                          )}
                          {post.remotePostUrl && (
                            <a
                              className="service-logs-cell-link"
                              href={post.remotePostUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={stopRowClick}
                            >
                              View live post
                            </a>
                          )}
                        </td>
                        <td>
                          <span className="service-logs-cell-meta service-logs-cell-text--truncate">
                            {post.topicLabel || post.keyword}
                          </span>
                        </td>
                        <td>
                          <span className="service-logs-cell-meta service-logs-cell-text--truncate">
                            {post.categoryName || '—'}
                          </span>
                        </td>
                        <td>{renderPostStatus(post)}</td>
                        <td className="service-logs-table-date">{formatBlogDate(post.createdAt)}</td>
                        <td>
                          <div className="service-logs-row-actions" onClick={stopRowClick}>
                            {post.status === 'failed' && (
                              <button
                                type="button"
                                className="service-logs-action-btn service-logs-action-btn--primary"
                                disabled={isRecreateDisabled}
                                title={recreateDisabledReason}
                                onClick={() => void handleRecreatePost(post)}
                              >
                                <FontAwesomeIcon
                                  icon={recreatingPostId === post.id ? faSpinner : faRotateLeft}
                                  spin={recreatingPostId === post.id}
                                  aria-hidden="true"
                                />
                                {recreatingPostId === post.id ? 'Recreating...' : 'Recreate'}
                              </button>
                            )}
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

        {!loading && postTotalPages > 1 && (
          <ServicePagination
            className="service-logs-footer"
            page={postPage}
            totalPages={postTotalPages}
            total={postTotal}
            label="posts"
            onPrevious={() => setPostPage((current) => Math.max(1, current - 1))}
            onNext={() => setPostPage((current) => Math.min(postTotalPages, current + 1))}
          />
        )}
      </section>

      {selectedPost && (
        <AutoBlogPostPreview post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  )
}
