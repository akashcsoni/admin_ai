import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleXmark, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ApiError, socialContentApi, type SocialContentPostDetail } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import type { SocialContentSettings, SocialPlatform } from './socialContent.types'
import { formatPostDate, formatPostStatus, platformIcons, platformLabels } from './socialContent.types'
import SocialContentPostPreview from './SocialContentPostPreview'

type PlatformTab = 'all' | SocialPlatform

const platformTabs: { value: PlatformTab; label: string; icon?: typeof platformIcons.linkedin }[] = [
  { value: 'all', label: 'All platforms' },
  { value: 'linkedin', label: 'LinkedIn', icon: platformIcons.linkedin },
  { value: 'x', label: 'X', icon: platformIcons.x },
  { value: 'instagram', label: 'Instagram', icon: platformIcons.instagram },
  { value: 'facebook', label: 'Facebook', icon: platformIcons.facebook },
]

type SocialContentListTabProps = {
  settings: SocialContentSettings | null
}

export default function SocialContentListTab({ settings }: SocialContentListTabProps) {
  const { token } = useAuth()
  const [posts, setPosts] = useState<SocialContentPostDetail[]>([])
  const [selectedPost, setSelectedPost] = useState<SocialContentPostDetail | null>(null)
  const [platformTab, setPlatformTab] = useState<PlatformTab>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPosts = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await socialContentApi.listPosts(token)
      setPosts(response.posts as SocialContentPostDetail[])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load social posts')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return posts.filter((post) => {
      if (platformTab !== 'all' && post.platform !== platformTab) return false
      if (!query) return true
      return (
        post.topic.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        platformLabels[post.platform].toLowerCase().includes(query)
      )
    })
  }, [posts, search, platformTab])

  async function openPost(postId: string) {
    if (!token) return

    try {
      const response = await socialContentApi.getPost(token, postId)
      setSelectedPost(response.post)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to open post')
    }
  }

  async function handleDelete(postId: string, event: React.MouseEvent) {
    event.stopPropagation()
    if (!token) return

    try {
      await socialContentApi.deletePost(token, postId)
      if (selectedPost?.id === postId) setSelectedPost(null)
      await loadPosts()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete post')
    }
  }

  function renderStatus(post: SocialContentPostDetail) {
    if (post.status === 'draft') {
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
          <h2>Content list</h2>
          <p>Generated social posts across LinkedIn, X, Instagram, and Facebook.</p>
        </div>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}

      {!settings?.hasApiKey && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Add your AI API key in <Link to="?tab=settings">Settings</Link> before generating posts.
        </p>
      )}

      <section className="service-logs-panel service-posts-panel" aria-label="Social content list">
        <nav className="service-logs-tabs" aria-label="Platform filters">
          {platformTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`service-logs-tab${platformTab === tab.value ? ' service-logs-tab--active' : ''}`}
              onClick={() => setPlatformTab(tab.value)}
            >
              {tab.icon && <FontAwesomeIcon icon={tab.icon} aria-hidden="true" />}
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
              value={search}
              placeholder="Search posts..."
              aria-label="Search social posts"
              onChange={(event) => setSearch(event.target.value)}
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
            <p className="service-logs-loading">Loading social posts...</p>
          ) : filteredPosts.length === 0 ? (
            <div className="service-logs-empty">
              <p>No social posts found</p>
              <span>
                {search.trim() || platformTab !== 'all' ? (
                  'Try a different search or filter.'
                ) : (
                  <>
                    Go to <Link to="?tab=compose">Compose</Link> to create your first post.
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
                      Topic
                    </th>
                    <th scope="col" className="service-logs-col-category">
                      Platform
                    </th>
                    <th scope="col" className="service-logs-col-meta">
                      Preview
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
                    const canOpen = post.status !== 'generating'

                    return (
                      <tr
                        key={post.id}
                        className={`service-logs-table-row service-logs-table-row--clickable${
                          post.status === 'failed' ? ' service-logs-table-row--muted' : ''
                        }`}
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
                            {post.topic}
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
                              onClick={(event) => event.stopPropagation()}
                            >
                              View live post
                            </a>
                          )}
                        </td>
                        <td>
                          <span className="service-social-platform-badge">
                            <FontAwesomeIcon icon={platformIcons[post.platform]} aria-hidden="true" />
                            {platformLabels[post.platform]}
                          </span>
                        </td>
                        <td>
                          <span className="service-logs-cell-meta service-logs-cell-text--truncate">
                            {post.content.slice(0, 120)}
                          </span>
                        </td>
                        <td>{renderStatus(post)}</td>
                        <td className="service-logs-table-date">{formatPostDate(post.createdAt)}</td>
                        <td>
                          <div className="service-logs-row-actions">
                            <button
                              type="button"
                              className="service-logs-action-btn service-logs-action-btn--icon"
                              title="Delete post"
                              aria-label="Delete post"
                              onClick={(event) => void handleDelete(post.id, event)}
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

      {selectedPost && (
        <SocialContentPostPreview post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  )
}
