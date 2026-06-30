import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCoins,
  faFolderTree,
  faListUl,
  faPenToSquare,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import AdminAvatar from '../components/AdminAvatar'
import AdminContentCard from '../components/AdminContentCard'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  adminApi,
  type AdminGenerationLog,
  type AdminPostListItem,
  type AdminUserDetail,
  type CreditTransaction,
} from '../lib/api'

type ServiceTab = 'account' | 'credits' | 'auto-blog'
type AutoBlogTab = 'posts' | 'logs'

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

export default function AdminUserDetailPage() {
  const { userId = '' } = useParams()
  const { token } = useAdminAuth()
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [serviceTab, setServiceTab] = useState<ServiceTab>('account')
  const [autoBlogTab, setAutoBlogTab] = useState<AutoBlogTab>('posts')

  const [credits, setCredits] = useState(0)
  const [isSuspended, setIsSuspended] = useState(false)
  const [fullName, setFullName] = useState('')

  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [creditPage, setCreditPage] = useState(1)
  const [creditTotal, setCreditTotal] = useState(0)
  const [creditLoading, setCreditLoading] = useState(false)
  const [creditPageSize] = useState(10)

  const [adjustAmount, setAdjustAmount] = useState(1)
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  const [posts, setPosts] = useState<AdminPostListItem[]>([])
  const [logs, setLogs] = useState<AdminGenerationLog[]>([])
  const [autoBlogPage, setAutoBlogPage] = useState(1)
  const [autoBlogTotal, setAutoBlogTotal] = useState(0)
  const [autoBlogLoading, setAutoBlogLoading] = useState(false)
  const [autoBlogPageSize] = useState(10)

  useEffect(() => {
    if (!token || !userId) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getUser(token!, userId)
        setUser(response.user)
        setCredits(response.user.credits)
        setIsSuspended(response.user.isSuspended)
        setFullName(response.user.fullName ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token, userId])

  useEffect(() => {
    if (!token || !userId || serviceTab !== 'credits') return

    async function loadCredits() {
      setCreditLoading(true)
      try {
        const response = await adminApi.listCreditTransactions(token!, {
          userId,
          page: creditPage,
          pageSize: creditPageSize,
        })
        setTransactions(response.transactions)
        setCreditTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load credit transactions')
      } finally {
        setCreditLoading(false)
      }
    }

    loadCredits()
  }, [token, userId, serviceTab, creditPage, creditPageSize])

  useEffect(() => {
    if (!token || !userId || serviceTab !== 'auto-blog') return

    async function loadAutoBlog() {
      setAutoBlogLoading(true)
      try {
        if (autoBlogTab === 'posts') {
          const response = await adminApi.listPosts(token!, {
            userId,
            page: autoBlogPage,
            pageSize: autoBlogPageSize,
          })
          setPosts(response.items)
          setAutoBlogTotal(response.total)
        } else {
          const response = await adminApi.listGenerationLogs(token!, {
            userId,
            page: autoBlogPage,
            pageSize: autoBlogPageSize,
          })
          setLogs(response.items)
          setAutoBlogTotal(response.total)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load auto blog data')
      } finally {
        setAutoBlogLoading(false)
      }
    }

    loadAutoBlog()
  }, [token, userId, serviceTab, autoBlogTab, autoBlogPage, autoBlogPageSize])

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !userId) return

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await adminApi.updateUser(token, userId, {
        credits,
        isSuspended,
        fullName: fullName.trim() || null,
      })
      setUser(response.user)
      setCredits(response.user.credits)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  async function handleAdjustCredits(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !userId) return

    setAdjusting(true)
    setError('')
    setMessage('')
    try {
      const response = await adminApi.adjustCredits(token, {
        userId,
        amount: adjustAmount,
        reason: adjustReason.trim(),
      })
      setCredits(response.credits)
      setUser((current) => (current ? { ...current, credits: response.credits } : current))
      setMessage(`${response.message} New balance: ${response.credits}`)
      setAdjustReason('')
      setAdjustAmount(1)
      setCreditPage(1)
      const txResponse = await adminApi.listCreditTransactions(token, {
        userId,
        page: 1,
        pageSize: creditPageSize,
      })
      setTransactions(txResponse.transactions)
      setCreditTotal(txResponse.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust credits')
    } finally {
      setAdjusting(false)
    }
  }

  function switchServiceTab(nextTab: ServiceTab) {
    setServiceTab(nextTab)
    setError('')
    setMessage('')
  }

  function switchAutoBlogTab(nextTab: AutoBlogTab) {
    setAutoBlogTab(nextTab)
    setAutoBlogPage(1)
  }

  const creditTotalPages = Math.max(1, Math.ceil(creditTotal / creditPageSize))
  const autoBlogTotalPages = Math.max(1, Math.ceil(autoBlogTotal / autoBlogPageSize))

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <nav className="admin-breadcrumb" aria-label="Breadcrumb">
            <Link to="/users">Member users</Link>
            <span aria-hidden="true">/</span>
            <span>User detail</span>
          </nav>
          <p className="admin-page-eyebrow">Member profile</p>
          <h1>{user?.fullName?.trim() || user?.email || 'User detail'}</h1>
          <p className="admin-page-lead">Review account, credits, and auto blog activity for this member.</p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      {loading ? (
        <p className="admin-content-loading">Loading user...</p>
      ) : user ? (
        <>
          <section className="admin-user-profile">
            <AdminAvatar fullName={user.fullName} email={user.email} size="table" />
            <div className="admin-user-profile-copy">
              <div className="admin-user-profile-top">
                <div>
                  <h2>{user.fullName?.trim() || 'No name'}</h2>
                  <p>{user.email}</p>
                </div>
                <div className="admin-chip-row">
                  <span
                    className={`admin-chip${user.isSuspended ? ' admin-chip--danger' : ' admin-chip--success'}`}
                  >
                    {user.isSuspended ? 'Suspended' : 'Active'}
                  </span>
                  <span className={`admin-chip${user.emailVerified ? ' admin-chip--success' : ''}`}>
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
              <div className="admin-user-profile-meta">
                <span>
                  Member since <strong>{formatDateTime(user.createdAt)}</strong>
                </span>
                <code className="admin-users-table-id">{user.id}</code>
              </div>
            </div>
          </section>

          <div className="admin-stat-grid admin-stat-grid--dashboard">
            <article className="admin-stat-card admin-stat-card--blue">
              <div className="admin-stat-card-top">
                <p className="admin-stat-label">Credits</p>
                <span className="admin-stat-card-icon">
                  <FontAwesomeIcon icon={faCoins} />
                </span>
              </div>
              <p className="admin-stat-value">{formatNumber(user.credits)}</p>
              <p className="admin-stat-meta">Billing balance</p>
            </article>
            <article className="admin-stat-card admin-stat-card--green">
              <div className="admin-stat-card-top">
                <p className="admin-stat-label">Posts</p>
                <span className="admin-stat-card-icon">
                  <FontAwesomeIcon icon={faPenToSquare} />
                </span>
              </div>
              <p className="admin-stat-value">{formatNumber(user.postCount)}</p>
              <p className="admin-stat-meta">Last {formatDateTime(user.lastPostAt)}</p>
            </article>
            <article className="admin-stat-card admin-stat-card--violet">
              <div className="admin-stat-card-top">
                <p className="admin-stat-label">Topics</p>
                <span className="admin-stat-card-icon">
                  <FontAwesomeIcon icon={faListUl} />
                </span>
              </div>
              <p className="admin-stat-value">{formatNumber(user.topicCount)}</p>
              <p className="admin-stat-meta">Auto blog queue</p>
            </article>
            <article className="admin-stat-card admin-stat-card--amber">
              <div className="admin-stat-card-top">
                <p className="admin-stat-label">Categories</p>
                <span className="admin-stat-card-icon">
                  <FontAwesomeIcon icon={faFolderTree} />
                </span>
              </div>
              <p className="admin-stat-value">{formatNumber(user.categoryCount)}</p>
              <p className="admin-stat-meta">Last gen {formatDateTime(user.lastGenerationAt)}</p>
            </article>
          </div>

          <div className="admin-segmented admin-user-service-tabs" role="tablist" aria-label="Member services">
            <button
              type="button"
              role="tab"
              aria-selected={serviceTab === 'account'}
              className={`admin-segmented-btn${serviceTab === 'account' ? ' admin-segmented-btn--active' : ''}`}
              onClick={() => switchServiceTab('account')}
            >
              <FontAwesomeIcon icon={faUser} />
              Account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={serviceTab === 'credits'}
              className={`admin-segmented-btn${serviceTab === 'credits' ? ' admin-segmented-btn--active' : ''}`}
              onClick={() => switchServiceTab('credits')}
            >
              <FontAwesomeIcon icon={faCoins} />
              Credits
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={serviceTab === 'auto-blog'}
              className={`admin-segmented-btn${serviceTab === 'auto-blog' ? ' admin-segmented-btn--active' : ''}`}
              onClick={() => switchServiceTab('auto-blog')}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
              Auto Blog
            </button>
          </div>

          {serviceTab === 'account' && (
            <AdminContentCard
              title="Account settings"
              description="Update profile details, credit balance, and account status."
            >
              <form className="admin-form admin-user-account-form" onSubmit={handleSave}>
                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>Full name</span>
                    <input
                      className="admin-input"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Member display name"
                    />
                  </label>
                  <label className="admin-field">
                    <span>Credits balance</span>
                    <input
                      className="admin-input"
                      type="number"
                      min={0}
                      value={credits}
                      onChange={(event) => setCredits(Number(event.target.value))}
                    />
                  </label>
                </div>

                <div className="admin-user-switch-panel">
                  <label className="admin-switch-row">
                    <span className="admin-switch-label">
                      <strong>Suspend account</strong>
                      <span className="admin-user-switch-help">
                        Block sign-in and service access for this member.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={isSuspended}
                      onChange={(event) => setIsSuspended(event.target.checked)}
                    />
                  </label>
                </div>

                <dl className="admin-meta-list admin-user-meta-list">
                  <div>
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div>
                    <dt>Email verified</dt>
                    <dd>{user.emailVerified ? 'Yes' : 'No'}</dd>
                  </div>
                  <div>
                    <dt>Member since</dt>
                    <dd>{formatDateTime(user.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>User ID</dt>
                    <dd>
                      <code className="admin-users-table-id">{user.id}</code>
                    </dd>
                  </div>
                </dl>

                <div className="admin-form-actions">
                  <button type="submit" className="admin-btn" disabled={saving}>
                    {saving ? 'Saving...' : 'Save account changes'}
                  </button>
                </div>
              </form>
            </AdminContentCard>
          )}

          {serviceTab === 'credits' && (
            <>
              <AdminContentCard
                title="Adjust credits"
                description="Grant or deduct credits for this member. Changes are logged in the ledger."
                meta={
                  <span className="admin-chip">
                    Balance <strong>{formatNumber(user.credits)}</strong>
                  </span>
                }
              >
                <form className="admin-form-grid admin-user-adjust-form" onSubmit={handleAdjustCredits}>
                  <label className="admin-field">
                    <span>Amount (+ / −)</span>
                    <input
                      className="admin-input"
                      type="number"
                      value={adjustAmount}
                      onChange={(event) => setAdjustAmount(Number(event.target.value))}
                      required
                    />
                  </label>
                  <label className="admin-field admin-field--wide">
                    <span>Reason</span>
                    <input
                      className="admin-input"
                      value={adjustReason}
                      onChange={(event) => setAdjustReason(event.target.value)}
                      placeholder="Support refund, promo grant, etc."
                      required
                    />
                  </label>
                  <div className="admin-form-actions">
                    <button type="submit" className="admin-btn" disabled={adjusting}>
                      {adjusting ? 'Applying...' : 'Apply adjustment'}
                    </button>
                  </div>
                </form>
              </AdminContentCard>

              <AdminContentCard
                title="Credit transactions"
                description="Ledger entries for this member only."
                meta={
                  <span className="admin-chip">
                    <strong>{creditTotal}</strong> transactions
                  </span>
                }
                loading={creditLoading}
                loadingLabel="Loading transactions..."
                footer={
                  !creditLoading ? (
                    <AdminPagination
                      page={creditPage}
                      totalPages={creditTotalPages}
                      total={creditTotal}
                      onPrevious={() => setCreditPage((current) => current - 1)}
                      onNext={() => setCreditPage((current) => current + 1)}
                    />
                  ) : undefined
                }
              >
                <div className="admin-data-table-wrap">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Balance</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="admin-data-table-empty">
                            No credit transactions for this member.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="admin-data-table-date">{formatDateTime(tx.createdAt)}</td>
                            <td className={tx.amount >= 0 ? 'admin-text-success' : 'admin-text-danger'}>
                              <strong>{tx.amount >= 0 ? `+${tx.amount}` : tx.amount}</strong>
                            </td>
                            <td className="admin-data-table-num">{tx.balanceAfter}</td>
                            <td>
                              <span className="admin-chip admin-chip--muted">{tx.type}</span>
                            </td>
                            <td>{tx.reason}</td>
                            <td>{tx.adminEmail ?? '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </AdminContentCard>
            </>
          )}

          {serviceTab === 'auto-blog' && (
            <>
              <AdminContentCard
                title="Auto blog overview"
                description="Content generation activity for this member."
                meta={
                  <div className="admin-chip-row">
                    <span className="admin-chip">
                      <strong>{user.postCount}</strong> posts
                    </span>
                    <span className="admin-chip">
                      <strong>{user.topicCount}</strong> topics
                    </span>
                    <span className="admin-chip">
                      <strong>{user.categoryCount}</strong> categories
                    </span>
                  </div>
                }
              >
                <dl className="admin-meta-list admin-user-meta-list">
                  <div>
                    <dt>Last post</dt>
                    <dd>{formatDateTime(user.lastPostAt)}</dd>
                  </div>
                  <div>
                    <dt>Last generation</dt>
                    <dd>{formatDateTime(user.lastGenerationAt)}</dd>
                  </div>
                </dl>
              </AdminContentCard>

              <AdminContentCard
                title="Auto blog activity"
                description="Posts and generation logs for this member."
                toolbar={
                  <div className="admin-segmented admin-segmented--compact" role="tablist" aria-label="Auto blog views">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={autoBlogTab === 'posts'}
                      className={`admin-segmented-btn${autoBlogTab === 'posts' ? ' admin-segmented-btn--active' : ''}`}
                      onClick={() => switchAutoBlogTab('posts')}
                    >
                      Posts
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={autoBlogTab === 'logs'}
                      className={`admin-segmented-btn${autoBlogTab === 'logs' ? ' admin-segmented-btn--active' : ''}`}
                      onClick={() => switchAutoBlogTab('logs')}
                    >
                      Generation logs
                    </button>
                  </div>
                }
                meta={
                  <span className="admin-chip">
                    <strong>{autoBlogTotal}</strong> {autoBlogTab === 'posts' ? 'posts' : 'logs'}
                  </span>
                }
                loading={autoBlogLoading}
                loadingLabel="Loading auto blog data..."
                footer={
                  !autoBlogLoading ? (
                    <AdminPagination
                      page={autoBlogPage}
                      totalPages={autoBlogTotalPages}
                      total={autoBlogTotal}
                      onPrevious={() => setAutoBlogPage((current) => current - 1)}
                      onNext={() => setAutoBlogPage((current) => current + 1)}
                    />
                  ) : undefined
                }
              >
                <div className="admin-data-table-wrap">
                  {autoBlogTab === 'posts' ? (
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Title</th>
                          <th>Keyword</th>
                          <th>Status</th>
                          <th>Provider</th>
                          <th>Tokens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="admin-data-table-empty">
                              No posts for this member.
                            </td>
                          </tr>
                        ) : (
                          posts.map((post) => (
                            <tr key={post.id}>
                              <td className="admin-data-table-date">{formatDateTime(post.createdAt)}</td>
                              <td>
                                <strong>{post.title}</strong>
                              </td>
                              <td>{post.keyword}</td>
                              <td>
                                <span className="admin-chip admin-chip--muted">{post.status}</span>
                              </td>
                              <td>
                                {post.provider ?? '—'}
                                {post.model ? ` · ${post.model}` : ''}
                              </td>
                              <td className="admin-data-table-num">{post.tokensTotal}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Keyword</th>
                          <th>Status</th>
                          <th>Provider</th>
                          <th>Tokens</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="admin-data-table-empty">
                              No generation logs for this member.
                            </td>
                          </tr>
                        ) : (
                          logs.map((log) => (
                            <tr key={log.id}>
                              <td className="admin-data-table-date">{formatDateTime(log.createdAt)}</td>
                              <td>{log.keyword}</td>
                              <td>
                                <span
                                  className={`admin-chip${
                                    log.status === 'success'
                                      ? ' admin-chip--success'
                                      : log.status === 'failed'
                                        ? ' admin-chip--danger'
                                        : ' admin-chip--muted'
                                  }`}
                                >
                                  {log.status}
                                </span>
                              </td>
                              <td>
                                {log.provider ?? '—'}
                                {log.model ? ` · ${log.model}` : ''}
                              </td>
                              <td className="admin-data-table-num">{log.tokensTotal}</td>
                              <td className="admin-user-log-error">{log.errorMessage ?? '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </AdminContentCard>
            </>
          )}
        </>
      ) : null}
    </div>
  )
}
