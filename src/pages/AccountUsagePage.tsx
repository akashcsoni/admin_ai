import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRotateRight,
  faChartColumn,
  faDownload,
  faEnvelope,
  faPenToSquare,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import AccountHero from '../components/AccountHero'
import SEO from '../components/SEO'
import UsageCreditBalanceCard from '../components/UsageCreditBalanceCard'
import { useAuth } from '../context/AuthContext'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { usageApi, type UsageActivityItem, type UsageDailyPoint, type UsageStats } from '../lib/api'
import ServicePagination from './account/workspaces/auto-blog/ServicePagination'
import '../styles/account.css'
import '../styles/account-usage.css'

const WORK_PAGE_SIZE = 10

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatShortDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
  })
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

const SERVICE_ICONS: Record<string, IconDefinition> = {
  auto_blog: faPenToSquare,
  social_content: faShareNodes,
  email_newsletter: faEnvelope,
}

function formatServiceLabel(service: string, fallback?: string): string {
  return fallback ?? service.replace(/_/g, ' ')
}

function statusClass(status: string): string {
  if (status === 'completed') return 'usage-status usage-status--completed'
  if (status === 'failed') return 'usage-status usage-status--failed'
  return 'usage-status usage-status--started'
}

function getDefaultRange() {
  const to = new Date()
  to.setHours(0, 0, 0, 0)
  const from = new Date(to)
  from.setDate(from.getDate() - 14)
  return { from: toLocalDateInputValue(from), to: toLocalDateInputValue(to) }
}

function buildBarChart(points: UsageDailyPoint[], key: keyof UsageDailyPoint) {
  const values = points.map((point) => Number(point[key] ?? 0))
  const max = Math.max(...values, 1)

  return points.map((point, index) => {
    const value = Number(point[key] ?? 0)
    return {
      date: point.date,
      value,
      height: value === 0 ? 0 : Math.max(10, Math.round((value / max) * 100)),
      showLabel:
        points.length <= 8 ||
        index === 0 ||
        index === points.length - 1 ||
        index % Math.ceil(points.length / 6) === 0,
    }
  })
}

function UsageBarChart({
  points,
  valueKey,
  label,
  compact = false,
}: {
  points: UsageDailyPoint[]
  valueKey: keyof UsageDailyPoint
  label: string
  compact?: boolean
}) {
  const chartPoints = compact ? points.slice(-10) : points
  const bars = buildBarChart(chartPoints, valueKey)
  const maxValue = Math.max(...bars.map((bar) => bar.value), 0)
  const average =
    chartPoints.length > 0
      ? chartPoints.reduce((sum, point) => sum + Number(point[valueKey] ?? 0), 0) / chartPoints.length
      : 0

  return (
    <div className={`usage-chart${compact ? ' usage-chart--compact' : ''}`}>
      <div className="usage-chart-meta">
        <span className="usage-chart-average">
          Avg <strong>{formatNumber(Math.round(average * 100) / 100)}</strong>
        </span>
        <span className="usage-chart-max">
          Peak <strong>{formatNumber(maxValue)}</strong>
        </span>
      </div>
      <div className="usage-chart-scroll">
        <div className="usage-chart-bars" role="img" aria-label={`${label} chart`}>
          {bars.map((bar) => (
            <div key={bar.date} className="usage-chart-bar-col" title={`${bar.date}: ${bar.value}`}>
              <div className="usage-chart-bar-track">
                <div
                  className={`usage-chart-bar-fill${bar.value === 0 ? ' usage-chart-bar-fill--empty' : ''}`}
                  style={{ height: bar.value === 0 ? '0' : `${bar.height}%` }}
                />
              </div>
              {!compact && (
                <span className={bar.showLabel ? undefined : 'usage-chart-label--muted'}>
                  {bar.showLabel ? formatShortDate(bar.date) : '·'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MiniSparkline({ points, valueKey }: { points: UsageDailyPoint[]; valueKey: keyof UsageDailyPoint }) {
  const bars = buildBarChart(points.slice(-12), valueKey)

  return (
    <div className="usage-sparkline" aria-hidden="true">
      {bars.map((bar) => (
        <span
          key={bar.date}
          className={bar.value === 0 ? 'usage-sparkline-bar--empty' : undefined}
          style={{ height: bar.value === 0 ? '8%' : `${Math.max(12, bar.height)}%` }}
        />
      ))}
    </div>
  )
}

function UsageWorkRow({
  item,
  services,
}: {
  item: UsageActivityItem
  services: UsageStats['services']
}) {
  const serviceLabel = services.find((service) => service.service === item.service)?.label

  return (
    <tr>
      <td>
        <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
      </td>
      <td>
        <div className="usage-table-service">
          <span className="usage-table-service-icon" aria-hidden="true">
            <FontAwesomeIcon icon={SERVICE_ICONS[item.service] ?? faChartColumn} />
          </span>
          <span>{formatServiceLabel(item.service, serviceLabel)}</span>
        </div>
      </td>
      <td className="usage-table-work-title">{item.title}</td>
      <td>
        <span className={statusClass(item.status)}>{item.status}</span>
      </td>
      <td className="usage-table-credits">
        {item.creditsUsed > 0 ? `-${formatNumber(item.creditsUsed)}` : '—'}
      </td>
      <td>{item.tokens > 0 ? formatCompactTokens(item.tokens) : '—'}</td>
    </tr>
  )
}

export default function AccountUsagePage() {
  const { user, token } = useAuth()
  const defaults = getDefaultRange()
  const [fromDate, setFromDate] = useState(defaults.from)
  const [toDate, setToDate] = useState(defaults.to)
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usageView, setUsageView] = useState<'services' | 'work' | 'creditsAdded'>('services')
  const [workPage, setWorkPage] = useState(1)
  const seo = pageSeo.usage

  const loadStats = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await usageApi.getStats(token, {
        from: fromDate,
        to: toDate,
        workPage,
        workPageSize: WORK_PAGE_SIZE,
      })
      setStats(response.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [token, fromDate, toDate, workPage])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const creditTotals = useMemo(() => {
    if (!stats || !user) {
      return { available: 0, total: 0, periodAmount: 0 }
    }

    const available = user.credits
    const total = available + stats.summary.creditsUsed

    return {
      available,
      total: total > 0 ? total : available,
      periodAmount: stats.summary.creditsAdded,
    }
  }, [stats, user])

  const balanceProgress = useMemo(() => {
    if (creditTotals.total <= 0) return 100
    return Math.round((creditTotals.available / creditTotals.total) * 100)
  }, [creditTotals])

  function applyPreset(days: number) {
    const to = new Date()
    to.setHours(0, 0, 0, 0)
    const from = new Date(to)
    from.setDate(from.getDate() - days)
    setWorkPage(1)
    setFromDate(toLocalDateInputValue(from))
    setToDate(toLocalDateInputValue(to))
  }

  function exportCsv() {
    if (!stats) return

    const rows = [
      ['date', 'credits_used', 'credits_added', 'requests', 'tokens'],
      ...stats.daily.map((point) => [
        point.date,
        point.creditsUsed,
        point.creditsAdded,
        point.requests,
        point.tokens,
      ]),
    ]

    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `content-ai-usage-${stats.from}-${stats.to}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!user) return null

  const serviceTotals = stats
    ? {
        requests: stats.services.reduce((sum, item) => sum + item.requests, 0),
        tokens: stats.services.reduce((sum, item) => sum + item.tokens, 0),
        creditsUsed: stats.services.reduce((sum, item) => sum + item.creditsUsed, 0),
      }
    : null

  const workItems = stats?.workActivity.items ?? []
  const workTotal = stats?.workActivity.total ?? 0
  const workTotalPages = Math.max(1, Math.ceil(workTotal / WORK_PAGE_SIZE))

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
          { name: 'Usage', path: '/account/usage' },
        ])}
      />

      <div className="account-page account-usage-page">
        <AccountHero
          activeTab="usage"
          eyebrow="Usage analytics"
          title="Usage"
          lead="Track credits used, content generated, and AI tokens across your account."
          breadcrumb={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Usage' },
          ]}
        />

        <section className="account-dashboard account-usage-dashboard" aria-label="Usage dashboard">
          <div className="account-container">
            <div className="usage-toolbar">
              <div className="usage-toolbar-filters">
                <span className="usage-filter-chip usage-filter-chip--active">All services</span>
                <label className="usage-date-field">
                  <span className="sr-only">From date</span>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate}
                    onChange={(event) => {
                      setWorkPage(1)
                      setFromDate(event.target.value)
                    }}
                  />
                </label>
                <span className="usage-date-separator">to</span>
                <label className="usage-date-field">
                  <span className="sr-only">To date</span>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    max={toLocalDateInputValue(new Date())}
                    onChange={(event) => {
                      setWorkPage(1)
                      setToDate(event.target.value)
                    }}
                  />
                </label>
                <div className="usage-presets">
                  <button type="button" onClick={() => applyPreset(7)}>
                    7d
                  </button>
                  <button type="button" onClick={() => applyPreset(14)}>
                    14d
                  </button>
                  <button type="button" onClick={() => applyPreset(30)}>
                    30d
                  </button>
                </div>
              </div>

              <div className="usage-toolbar-actions">
                <button type="button" className="usage-icon-btn" onClick={() => void loadStats()} title="Refresh">
                  <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="usage-icon-btn"
                  onClick={exportCsv}
                  disabled={!stats}
                  title="Export CSV"
                >
                  <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
                </button>
              </div>
            </div>

            {error && <p className="account-alert account-alert--error">{error}</p>}

            {loading && !stats ? (
              <p className="account-muted">Loading usage...</p>
            ) : stats ? (
              <div className="usage-layout">
                <div className="usage-main">
                  <div className="usage-panel">
                    <div className="usage-panel-head">
                      <div>
                        <h2>Total credits used</h2>
                        <p className="usage-panel-value">{formatMoney(stats.summary.estimatedSpendCents)}</p>
                        <p className="usage-panel-sub">
                          {formatNumber(stats.summary.creditsUsed)} credit
                          {stats.summary.creditsUsed === 1 ? '' : 's'} · {formatShortDate(stats.from)} –{' '}
                          {formatShortDate(stats.to)}
                        </p>
                      </div>
                      <span className="usage-panel-badge">1 credit = $1</span>
                    </div>
                    <UsageBarChart points={stats.daily} valueKey="creditsUsed" label="Credits used" />
                  </div>

                  <div className="usage-tabs" role="tablist" aria-label="Usage breakdown">
                    <button
                      type="button"
                      role="tab"
                      id="usage-tab-services"
                      aria-selected={usageView === 'services'}
                      aria-controls="usage-panel-services"
                      className={`usage-tab${usageView === 'services' ? ' usage-tab--active' : ''}`}
                      onClick={() => setUsageView('services')}
                    >
                      By service
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="usage-tab-work"
                      aria-selected={usageView === 'work'}
                      aria-controls="usage-panel-work"
                      className={`usage-tab${usageView === 'work' ? ' usage-tab--active' : ''}`}
                      onClick={() => setUsageView('work')}
                    >
                      By work
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="usage-tab-credits-added"
                      aria-selected={usageView === 'creditsAdded'}
                      aria-controls="usage-panel-credits-added"
                      className={`usage-tab${usageView === 'creditsAdded' ? ' usage-tab--active' : ''}`}
                      onClick={() => setUsageView('creditsAdded')}
                    >
                      Credits added
                    </button>
                  </div>

                  {usageView === 'services' ? (
                    <div
                      id="usage-panel-services"
                      role="tabpanel"
                      aria-labelledby="usage-tab-services"
                      className="usage-table-panel"
                    >
                      <div className="usage-table-panel-head">
                        <div>
                          <h3>Credits used by service</h3>
                          <p>How many generations and credits each service consumed in this period.</p>
                        </div>
                      </div>
                      <div className="usage-table-wrap">
                        <table className="usage-table">
                          <thead>
                            <tr>
                              <th scope="col">Service</th>
                              <th scope="col">Work</th>
                              <th scope="col">Tokens</th>
                              <th scope="col">Credits used</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.services.map((service) => (
                              <tr key={service.service}>
                                <td>
                                  <div className="usage-table-service">
                                    <span className="usage-table-service-icon" aria-hidden="true">
                                      <FontAwesomeIcon
                                        icon={SERVICE_ICONS[service.service] ?? faChartColumn}
                                      />
                                    </span>
                                    <span>{service.label}</span>
                                  </div>
                                </td>
                                <td>
                                  {formatNumber(service.requests)} generation
                                  {service.requests === 1 ? '' : 's'}
                                </td>
                                <td>{formatCompactTokens(service.tokens)}</td>
                                <td className="usage-table-credits">
                                  {formatNumber(service.creditsUsed)} credit
                                  {service.creditsUsed === 1 ? '' : 's'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          {serviceTotals && stats.services.length > 0 ? (
                            <tfoot>
                              <tr>
                                <th scope="row">Total</th>
                                <td>
                                  {formatNumber(serviceTotals.requests)} generation
                                  {serviceTotals.requests === 1 ? '' : 's'}
                                </td>
                                <td>{formatCompactTokens(serviceTotals.tokens)}</td>
                                <td className="usage-table-credits">
                                  {formatNumber(serviceTotals.creditsUsed)} credit
                                  {serviceTotals.creditsUsed === 1 ? '' : 's'}
                                </td>
                              </tr>
                            </tfoot>
                          ) : null}
                        </table>
                      </div>
                      {stats.services.every((service) => service.requests === 0) ? (
                        <p className="account-muted usage-table-empty">
                          No service usage in this date range.
                        </p>
                      ) : null}
                    </div>
                  ) : usageView === 'work' ? (
                    <div
                      id="usage-panel-work"
                      role="tabpanel"
                      aria-labelledby="usage-tab-work"
                      className="usage-table-panel"
                    >
                      <div className="usage-table-panel-head">
                        <div>
                          <h3>Usage by work</h3>
                          <p>Each generation, post, or newsletter created in this period.</p>
                        </div>
                        <span className="usage-table-count">{workTotal.toLocaleString()} items</span>
                      </div>
                      {workTotal === 0 ? (
                        <p className="account-muted usage-table-empty">
                          No completed work in this date range.
                        </p>
                      ) : (
                        <>
                        <div className="usage-table-wrap">
                          <table className="usage-table usage-table--work">
                            <thead>
                              <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Service</th>
                                <th scope="col">Work</th>
                                <th scope="col">Status</th>
                                <th scope="col">Credits</th>
                                <th scope="col">Tokens</th>
                              </tr>
                            </thead>
                            <tbody>
                              {workItems.map((item) => (
                                <UsageWorkRow key={item.id} item={item} services={stats.services} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {workTotalPages > 1 && (
                          <ServicePagination
                            className="usage-table-pagination"
                            page={workPage}
                            totalPages={workTotalPages}
                            total={workTotal}
                            label="items"
                            onPrevious={() => setWorkPage((current) => Math.max(1, current - 1))}
                            onNext={() => setWorkPage((current) => Math.min(workTotalPages, current + 1))}
                          />
                        )}
                        </>
                      )}
                    </div>
                  ) : (
                    <div
                      id="usage-panel-credits-added"
                      role="tabpanel"
                      aria-labelledby="usage-tab-credits-added"
                      className="usage-credits-added-panel"
                    >
                      <div className="usage-panel">
                        <div className="usage-panel-head">
                          <div>
                            <h2>Total credits added</h2>
                            <p className="usage-panel-value">
                              {formatMoney(stats.summary.creditsAdded * 100)}
                            </p>
                            <p className="usage-panel-sub">
                              {formatNumber(stats.summary.creditsAdded)} credit
                              {stats.summary.creditsAdded === 1 ? '' : 's'} · {formatShortDate(stats.from)} –{' '}
                              {formatShortDate(stats.to)}
                            </p>
                          </div>
                          <Link to="/account/billing" className="usage-panel-link">
                            View billing
                          </Link>
                        </div>
                        <UsageBarChart
                          points={stats.daily}
                          valueKey="creditsAdded"
                          label="Credits added"
                        />
                      </div>
                      {stats.summary.creditsAdded === 0 ? (
                        <p className="account-muted usage-credits-added-empty">
                          No credits were added in this date range.{' '}
                          <Link to="/account/billing">Buy credits</Link> to top up your balance.
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>

                <aside className="usage-sidebar">
                  <UsageCreditBalanceCard
                    available={creditTotals.available}
                    total={creditTotals.total}
                    periodAmount={creditTotals.periodAmount}
                    progressPercent={balanceProgress}
                    periodLabel="added in this period"
                  />

                  <div className="usage-sidebar-card">
                    <h3>Total tokens</h3>
                    <p className="usage-sidebar-metric">{formatNumber(stats.summary.totalTokens)}</p>
                    <MiniSparkline points={stats.daily} valueKey="tokens" />
                  </div>

                  <div className="usage-sidebar-card">
                    <h3>Total requests</h3>
                    <p className="usage-sidebar-metric">{formatNumber(stats.summary.totalRequests)}</p>
                    <MiniSparkline points={stats.daily} valueKey="requests" />
                  </div>

                  <div className="usage-sidebar-card">
                    <div className="usage-sidebar-card-head">
                      <h3>Recent activity</h3>
                      <span className="usage-sidebar-count">{stats.recentActivity.length}</span>
                    </div>
                    {stats.recentActivity.length === 0 ? (
                      <p className="account-muted">No activity in this date range.</p>
                    ) : (
                      <ul className="usage-activity-list">
                        {stats.recentActivity.map((item) => (
                          <li key={item.id}>
                            <div className="usage-activity-main">
                              <strong>{item.title}</strong>
                              <span>
                                {item.service.replace(/_/g, ' ')} · {item.status}
                              </span>
                            </div>
                            <div className="usage-activity-meta">
                              {item.creditsUsed > 0 ? (
                                <span>-{item.creditsUsed} credit</span>
                              ) : (
                                <span>—</span>
                              )}
                              <time dateTime={item.createdAt}>{formatDateTime(item.createdAt)}</time>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </aside>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  )
}
