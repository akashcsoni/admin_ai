import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faArrowRotateRight,
  faCheck,
  faCoins,
  faCreditCard,
  faPenToSquare,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons'
import AccountHero from '../components/AccountHero'
import ContentIcon from '../components/ContentIcon'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { formatCreditCostLabel, useServiceCredits } from '../context/ServiceCreditsContext'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { accountActions, gettingStartedSteps } from '../data/account'
import { getServiceAccountPath, liveServices } from '../data/services'
import {
  billingApi,
  usageApi,
  type BillingDailyPoint,
  type BillingStats,
  type UsageDailyPoint,
  type UsageStats,
} from '../lib/api'
import '../styles/account.css'
import '../styles/account-dashboard.css'
import '../styles/account-usage.css'

type PeriodDays = 7 | 14 | 30 | 90

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRangeForDays(days: PeriodDays) {
  const to = new Date()
  to.setHours(0, 0, 0, 0)
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return { from: toLocalDateInputValue(from), to: toLocalDateInputValue(to) }
}

function formatMoney(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined).format(value)
}

function formatCompactTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`
  return String(value)
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildSparkline<T extends { date: string }>(
  points: T[],
  valueKey: keyof T,
  slice = 14,
) {
  const chartPoints = points.slice(-slice)
  const values = chartPoints.map((point) => Number(point[valueKey] ?? 0))
  const max = Math.max(...values, 1)

  return chartPoints.map((point) => {
    const value = Number(point[valueKey] ?? 0)
    const height = value === 0 ? 8 : Math.max(12, Math.round((value / max) * 100))
    return { date: point.date, value, height }
  })
}

function DashboardSparkline<T extends { date: string }>({
  points,
  valueKey,
}: {
  points: T[]
  valueKey: keyof T
}) {
  const bars = buildSparkline(points, valueKey)

  return (
    <div className="usage-sparkline account-home-stat-chart" aria-hidden="true">
      {bars.map((bar) => (
        <span
          key={bar.date}
          className={bar.value === 0 ? 'usage-sparkline-bar--empty' : undefined}
          style={{ height: `${bar.height}%` }}
        />
      ))}
    </div>
  )
}

export default function AccountPage() {
  const { user, token } = useAuth()
  const { getCreditCost } = useServiceCredits()
  const [periodDays, setPeriodDays] = useState<PeriodDays>(30)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const seo = pageSeo.account

  const range = useMemo(() => getRangeForDays(periodDays), [periodDays])

  const loadDashboard = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const [usageResponse, billingResponse] = await Promise.all([
        usageApi.getStats(token, range),
        billingApi.getStats(token, range),
      ])
      setUsageStats(usageResponse.stats)
      setBillingStats(billingResponse.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      setUsageStats(null)
      setBillingStats(null)
    } finally {
      setLoading(false)
    }
  }, [token, range.from, range.to])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  if (!user) return null

  const hasCredits = user.credits > 0
  const liveServiceCount = liveServices.length
  const creditsUsed = usageStats?.summary.creditsUsed ?? 0
  const creditsPurchased = billingStats?.summary.creditsPurchased ?? 0
  const totalSpentCents = billingStats?.summary.totalSpentCents ?? 0
  const totalRequests = usageStats?.summary.totalRequests ?? 0
  const totalTokens = usageStats?.summary.totalTokens ?? 0
  const balanceTotal = user.credits + creditsUsed
  const balanceProgress =
    balanceTotal > 0 ? Math.round((user.credits / balanceTotal) * 100) : 100

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
        ])}
      />

      <div className="account-page">
        <AccountHero
          activeTab="dashboard"
          eyebrow="Member dashboard"
          title="Dashboard"
          lead={`Welcome back${user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}. Track credits, usage, and services in one place.`}
          breadcrumb={[
            { label: 'Home', to: '/' },
            { label: 'Account' },
          ]}
        />

        <section className="account-dashboard account-home-dashboard" aria-label="Account dashboard">
          <div className="account-container">
            <div className="account-home-toolbar">
              <div className="account-home-period" role="tablist" aria-label="Time period">
                {([7, 14, 30, 90] as PeriodDays[]).map((days) => (
                  <button
                    key={days}
                    type="button"
                    role="tab"
                    aria-selected={periodDays === days}
                    className={periodDays === days ? 'is-active' : undefined}
                    onClick={() => setPeriodDays(days)}
                  >
                    {days}d
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="usage-icon-btn"
                onClick={() => void loadDashboard()}
                title="Refresh dashboard"
              >
                <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} aria-hidden="true" />
              </button>
            </div>

            {error && <p className="account-alert account-alert--error">{error}</p>}

            {loading && !usageStats ? (
              <p className="account-muted">Loading dashboard...</p>
            ) : (
              <>
                <div className="account-home-stats">
                  <Link to="/account/usage" className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Credits used</span>
                      <FontAwesomeIcon icon={faArrowRight} className="account-home-stat-arrow" aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value">{formatNumber(creditsUsed)}</p>
                    <p className="account-home-stat-sub">
                      {formatMoney(usageStats?.summary.estimatedSpendCents ?? creditsUsed * 100)} estimated spend
                    </p>
                    {usageStats && (
                      <DashboardSparkline<UsageDailyPoint>
                        points={usageStats.daily}
                        valueKey="creditsUsed"
                      />
                    )}
                  </Link>

                  <Link to="/account/usage" className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Content created</span>
                      <FontAwesomeIcon icon={faArrowRight} className="account-home-stat-arrow" aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value">{formatNumber(totalRequests)}</p>
                    <p className="account-home-stat-sub">Blog posts and generations in this period</p>
                    {usageStats && (
                      <DashboardSparkline<UsageDailyPoint>
                        points={usageStats.daily}
                        valueKey="requests"
                      />
                    )}
                  </Link>

                  <Link to="/account/usage" className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Total tokens</span>
                      <FontAwesomeIcon icon={faArrowRight} className="account-home-stat-arrow" aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value">{formatCompactTokens(totalTokens)}</p>
                    <p className="account-home-stat-sub">{formatNumber(totalTokens)} input/output tokens</p>
                    {usageStats && (
                      <DashboardSparkline<UsageDailyPoint>
                        points={usageStats.daily}
                        valueKey="tokens"
                      />
                    )}
                  </Link>

                  <div className="account-home-stat account-home-stat--featured">
                    <div className="account-home-stat-head">
                      <span>Credit balance</span>
                      <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value">{formatNumber(user.credits)}</p>
                    <p className="account-home-stat-sub">
                      {formatNumber(user.credits)} available · {formatNumber(creditsUsed)} used in period
                    </p>
                    <div className="account-home-stat-progress">
                      <div className="account-home-stat-progress-bar">
                        <div
                          className="account-home-stat-progress-fill"
                          style={{ width: `${balanceProgress}%` }}
                        />
                      </div>
                    </div>
                    <Link to="/account/billing" className="account-home-stat-action">
                      <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" />
                      Add credits
                    </Link>
                  </div>

                  <Link to="/account/billing" className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Total spent</span>
                      <FontAwesomeIcon icon={faArrowRight} className="account-home-stat-arrow" aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value">{formatMoney(totalSpentCents)}</p>
                    <p className="account-home-stat-sub">
                      {formatNumber(billingStats?.summary.purchaseCount ?? 0)} completed payment
                      {(billingStats?.summary.purchaseCount ?? 0) === 1 ? '' : 's'}
                    </p>
                    {billingStats && (
                      <DashboardSparkline<BillingDailyPoint>
                        points={billingStats.daily}
                        valueKey="amountCents"
                      />
                    )}
                  </Link>

                  <Link to="/account/billing" className="account-home-stat">
                    <div className="account-home-stat-head">
                      <span>Credits purchased</span>
                      <FontAwesomeIcon icon={faReceipt} aria-hidden="true" />
                    </div>
                    <p className="account-home-stat-value">{formatNumber(creditsPurchased)}</p>
                    <p className="account-home-stat-sub">
                      {hasCredits ? 'Top up anytime at $1 per credit' : 'You are out of credits — add more to create content'}
                    </p>
                    {billingStats && (
                      <DashboardSparkline<BillingDailyPoint>
                        points={billingStats.daily}
                        valueKey="creditsPurchased"
                      />
                    )}
                  </Link>
                </div>

                <div className="account-home-layout">
                  <div className="account-panel account-services-section" id="services">
                    <div className="account-home-section-head">
                      <div>
                        <h2>Your services</h2>
                        <p>{liveServiceCount} live service{liveServiceCount === 1 ? '' : 's'} ready to use</p>
                      </div>
                      <Link to="/services" className="account-panel-link">
                        Browse all
                      </Link>
                    </div>

                    <div className="account-services-grid">
                      {liveServices.map((service) => (
                        <Link
                          key={service.id}
                          to={getServiceAccountPath(service.id)}
                          className="account-service-card account-service-card--live"
                        >
                          <div className="account-service-card-top">
                            <ContentIcon name={service.icon} className="account-service-card-icon" />
                            <span className="account-service-card-badge account-service-card-badge--live">
                              Live
                            </span>
                          </div>
                          <h3>{service.title}</h3>
                          <p>{service.shortDescription}</p>
                          <div className="account-service-card-footer">
                            <span className="account-service-card-credits">
                              {formatCreditCostLabel(getCreditCost(service.id))} / use
                            </span>
                            <span className="account-service-card-link">Open →</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <aside className="account-dashboard-sidebar">
                    <div className="account-panel">
                      <div className="account-home-section-head">
                        <div>
                          <h2>Getting started</h2>
                          <p>Finish setup to create your first content.</p>
                        </div>
                      </div>

                      <ol className="account-steps">
                        {gettingStartedSteps.map((step, index) => {
                          const isDone = step.done || (step.id === 'credits' && hasCredits)

                          return (
                            <li
                              key={step.id}
                              className={`account-step ${isDone ? 'account-step--done' : ''}`}
                            >
                              <span className="account-step-marker" aria-hidden="true">
                                {isDone ? <FontAwesomeIcon icon={faCheck} /> : index + 1}
                              </span>
                              <div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    </div>

                    <div className="account-panel">
                      <div className="account-home-section-head">
                        <div>
                          <h2>Quick links</h2>
                          <p>Billing, usage, and account settings.</p>
                        </div>
                      </div>

                      <div className="account-home-quick-links">
                        {accountActions.map((action) => (
                          <Link key={action.id} to={action.link} className="account-home-quick-link">
                            <div>
                              <strong>{action.title}</strong>
                              <span>{action.description}</span>
                            </div>
                            <em>{action.label} →</em>
                          </Link>
                        ))}
                        <Link to="/account/settings" className="account-home-quick-link">
                          <div>
                            <strong>Account settings</strong>
                            <span>Update profile and change password</span>
                          </div>
                          <em>Edit →</em>
                        </Link>
                      </div>
                    </div>

                    <div className="account-panel">
                      <div className="account-home-section-head">
                        <div>
                          <h2>Recent activity</h2>
                          <p>Latest content generation events.</p>
                        </div>
                        <Link to="/account/usage" className="account-panel-link">
                          View all
                        </Link>
                      </div>

                      {!usageStats || usageStats.recentActivity.length === 0 ? (
                        <p className="account-muted">No activity in this period yet.</p>
                      ) : (
                        <ul className="account-home-activity-list">
                          {usageStats.recentActivity.slice(0, 5).map((item) => (
                            <li key={item.id}>
                              <div className="account-home-activity-main">
                                <div>
                                  <strong>{item.title}</strong>
                                  <span>
                                    <FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" />{' '}
                                    {item.service.replace(/_/g, ' ')} · {item.status}
                                  </span>
                                </div>
                                {item.creditsUsed > 0 ? (
                                  <span className="account-usage-type">-{item.creditsUsed} credit</span>
                                ) : null}
                              </div>
                              <div className="account-home-activity-meta">
                                <span>{formatCompactTokens(item.tokens)} tokens</span>
                                <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
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
