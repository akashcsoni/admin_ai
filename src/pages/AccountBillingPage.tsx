import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRotateRight,
  faChartColumn,
  faCoins,
  faCreditCard,
  faIndianRupeeSign,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons'
import AccountHero from '../components/AccountHero'
import SEO from '../components/SEO'
import UsageCreditBalanceCard from '../components/UsageCreditBalanceCard'
import { useAuth } from '../context/AuthContext'
import { breadcrumbJsonLd, pageSeo } from '../config/seo'
import { creditExamples } from '../data/pricing'
import {
  billingApi,
  usageApi,
  type BillingConfig,
  type BillingDailyPoint,
  type BillingPurchase,
  type BillingStats,
  type UsageStats,
} from '../lib/api'
import '../styles/account.css'
import '../styles/account-billing.css'
import '../styles/account-usage.css'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function toLocalDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDefaultRange() {
  const to = new Date()
  to.setHours(0, 0, 0, 0)
  const from = new Date(to)
  from.setDate(from.getDate() - 29)
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

function formatShortDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
  })
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatProvider(provider: BillingPurchase['provider']): string {
  return provider === 'stripe' ? 'Stripe' : 'Razorpay'
}

function formatPurchaseStatus(status: BillingPurchase['status']): string {
  if (status === 'completed') return 'Completed'
  if (status === 'pending') return 'Pending'
  return 'Failed'
}

function buildBarChart(points: BillingDailyPoint[], key: keyof BillingDailyPoint) {
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

function BillingBarChart({
  points,
  valueKey,
  label,
  compact = false,
}: {
  points: BillingDailyPoint[]
  valueKey: keyof BillingDailyPoint
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
  const formatValue = (value: number) =>
    valueKey === 'amountCents' ? formatMoney(value) : formatNumber(value)

  return (
    <div className={`usage-chart${compact ? ' usage-chart--compact' : ''}`}>
      <div className="usage-chart-meta">
        <span className="usage-chart-average">
          Avg <strong>{formatValue(Math.round(average * 100) / 100)}</strong>
        </span>
        <span className="usage-chart-max">
          Peak <strong>{formatValue(maxValue)}</strong>
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

function MiniSparkline({
  points,
  valueKey,
}: {
  points: BillingDailyPoint[]
  valueKey: keyof BillingDailyPoint
}) {
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

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

export default function AccountBillingPage() {
  const { user, token, refreshUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const defaults = getDefaultRange()
  const [fromDate, setFromDate] = useState(defaults.from)
  const [toDate, setToDate] = useState(defaults.to)
  const [config, setConfig] = useState<BillingConfig | null>(null)
  const [stats, setStats] = useState<BillingStats | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [purchases, setPurchases] = useState<BillingPurchase[]>([])
  const [purchasePage, setPurchasePage] = useState(1)
  const [purchaseTotal, setPurchaseTotal] = useState(0)
  const [purchasePageSize] = useState(10)
  const [selectedCredits, setSelectedCredits] = useState(20)
  const [customCredits, setCustomCredits] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const seo = pageSeo.billing
  const creditPriceCents = config?.creditPriceCents ?? 100

  const purchaseCredits = useMemo(() => {
    if (customCredits.trim()) {
      const parsed = Number(customCredits)
      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 500) {
        return parsed
      }
    }
    return selectedCredits
  }, [customCredits, selectedCredits])

  const totalCents = purchaseCredits * creditPriceCents
  const purchaseTotalPages = Math.max(1, Math.ceil(purchaseTotal / purchasePageSize))

  const creditTotals = useMemo(() => {
    if (!stats) {
      return { available: 0, total: 0, periodAmount: 0 }
    }

    const available = stats.summary.creditsBalance
    const creditsUsed = usageStats?.summary.creditsUsed ?? 0
    const total = available + creditsUsed

    return {
      available,
      total: total > 0 ? total : available,
      periodAmount: stats.summary.creditsPurchased,
    }
  }, [stats, usageStats])

  const balanceProgress = useMemo(() => {
    if (creditTotals.total <= 0) return 100
    return Math.round((creditTotals.available / creditTotals.total) * 100)
  }, [creditTotals])

  const loadBillingData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [configResponse, statsResponse, usageResponse, purchasesResponse] = await Promise.all([
        billingApi.getConfig(token),
        billingApi.getStats(token, { from: fromDate, to: toDate }),
        usageApi.getStats(token, { from: fromDate, to: toDate }),
        billingApi.listPurchases(token, {
          page: purchasePage,
          pageSize: purchasePageSize,
          from: fromDate,
          to: toDate,
        }),
      ])
      setConfig(configResponse.config)
      setStats(statsResponse.stats)
      setUsageStats(usageResponse.stats)
      setPurchases(purchasesResponse.purchases)
      setPurchaseTotal(purchasesResponse.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing')
      setStats(null)
      setUsageStats(null)
      setPurchases([])
    } finally {
      setLoading(false)
    }
  }, [token, fromDate, toDate, purchasePage, purchasePageSize])

  useEffect(() => {
    void loadBillingData()
  }, [loadBillingData])

  useEffect(() => {
    setPurchasePage(1)
  }, [fromDate, toDate])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const success = searchParams.get('success')

    if (!token || success !== 'stripe' || !sessionId) return

    async function confirmStripe() {
      setPaying(true)
      setError('')
      try {
        const response = await billingApi.confirmStripeCheckout(token!, sessionId!)
        setMessage(response.message)
        await refreshUser()
        await loadBillingData()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to confirm payment')
      } finally {
        setPaying(false)
        setSearchParams({}, { replace: true })
      }
    }

    void confirmStripe()
  }, [token, searchParams, refreshUser, setSearchParams, loadBillingData])

  useEffect(() => {
    if (searchParams.get('canceled') === '1') {
      setError('Payment was canceled.')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function applyPreset(days: number) {
    const to = new Date()
    to.setHours(0, 0, 0, 0)
    const from = new Date(to)
    from.setDate(from.getDate() - days)
    setFromDate(toLocalDateInputValue(from))
    setToDate(toLocalDateInputValue(to))
  }

  async function handleStripeCheckout() {
    if (!token) return
    setPaying(true)
    setError('')
    setMessage('')
    try {
      const response = await billingApi.createStripeCheckout(token, purchaseCredits)
      window.location.href = response.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Stripe checkout')
      setPaying(false)
    }
  }

  async function handleRazorpayCheckout() {
    if (!token || !config?.razorpayKeyId) return
    setPaying(true)
    setError('')
    setMessage('')
    try {
      await loadRazorpayScript()
      const order = await billingApi.createRazorpayOrder(token, purchaseCredits)

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout failed to load')
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Content AI',
        description: `${purchaseCredits} content credit${purchaseCredits === 1 ? '' : 's'}`,
        order_id: order.orderId,
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            const result = await billingApi.verifyRazorpayPayment(token, {
              purchaseId: order.purchaseId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })
            setMessage(result.message)
            await refreshUser()
            await loadBillingData()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify payment')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        prefill: {
          email: user?.email,
          name: user?.fullName ?? undefined,
        },
        theme: {
          color: '#0d0d0d',
        },
      })

      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start Razorpay checkout')
      setPaying(false)
    }
  }

  if (!user) return null

  const hasPaymentMethod = Boolean(config?.stripeEnabled || config?.razorpayEnabled)

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
          { name: 'Billing', path: '/account/billing' },
        ])}
      />

      <div className="account-page account-billing-page">
        <AccountHero
          activeTab="billing"
          eyebrow="Billing & credits"
          title="Billing"
          lead="$1 per credit · 1 credit = 1 content piece. Credits stay on your account until used."
          breadcrumb={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account' },
            { label: 'Billing' },
          ]}
        />

        <section className="account-dashboard account-billing-dashboard" aria-label="Billing">
          <div className="account-container">
            <div className="usage-toolbar">
              <div className="usage-toolbar-filters">
                <span className="usage-filter-chip usage-filter-chip--active">Billing history</span>
                <label className="usage-date-field">
                  <span className="sr-only">From date</span>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate}
                    onChange={(event) => setFromDate(event.target.value)}
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
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </label>
                <div className="usage-presets">
                  <button type="button" onClick={() => applyPreset(7)}>
                    7d
                  </button>
                  <button type="button" onClick={() => applyPreset(30)}>
                    30d
                  </button>
                  <button type="button" onClick={() => applyPreset(90)}>
                    90d
                  </button>
                </div>
              </div>

              <div className="usage-toolbar-actions">
                <button
                  type="button"
                  className="usage-icon-btn"
                  onClick={() => void loadBillingData()}
                  title="Refresh"
                >
                  <FontAwesomeIcon icon={faArrowRotateRight} spin={loading} aria-hidden="true" />
                </button>
              </div>
            </div>

            {error && <p className="account-alert account-alert--error">{error}</p>}
            {message && <p className="account-alert account-alert--success">{message}</p>}

            {loading && !stats ? (
              <p className="account-muted">Loading billing...</p>
            ) : stats ? (
              <div className="usage-layout account-billing-layout">
                <div className="usage-main">
                  <div className="account-panel account-billing-panel">
                    <div className="account-panel-head">
                      <div>
                        <h2>Buy credits</h2>
                        <p>Select a pack or enter a custom amount (1–500 credits).</p>
                      </div>
                    </div>

                    <div className="account-billing-packs">
                      {creditExamples.map((example) => (
                        <button
                          key={example.amount}
                          type="button"
                          className={`account-billing-pack${selectedCredits === example.credits && !customCredits ? ' account-billing-pack--active' : ''}${example.amount === 20 ? ' account-billing-pack--popular' : ''}`}
                          onClick={() => {
                            setSelectedCredits(example.credits)
                            setCustomCredits('')
                          }}
                        >
                          {example.amount === 20 && (
                            <span className="account-billing-pack-badge">Popular</span>
                          )}
                          <span className="account-billing-pack-label">{example.label}</span>
                          <strong>${example.amount}</strong>
                          <span>{example.credits} credits</span>
                        </button>
                      ))}
                    </div>

                    <label className="account-field">
                      <span>Custom credits</span>
                      <input
                        className="account-input"
                        type="number"
                        min={1}
                        max={500}
                        placeholder="e.g. 25"
                        value={customCredits}
                        onChange={(event) => setCustomCredits(event.target.value)}
                      />
                    </label>

                    <div className="account-billing-summary">
                      <div>
                        <span>Purchase</span>
                        <strong>
                          {purchaseCredits} credit{purchaseCredits === 1 ? '' : 's'}
                        </strong>
                      </div>
                      <div>
                        <span>Total</span>
                        <strong>{formatMoney(totalCents)}</strong>
                      </div>
                    </div>

                    <div className="account-billing-actions">
                      {config?.stripeEnabled && (
                        <button
                          type="button"
                          className="btn btn-primary btn-block"
                          disabled={paying}
                          onClick={() => void handleStripeCheckout()}
                        >
                          <FontAwesomeIcon icon={faCreditCard} />
                          {paying ? 'Processing...' : `Pay with Stripe · ${formatMoney(totalCents)}`}
                        </button>
                      )}
                      {config?.razorpayEnabled && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-block"
                          disabled={paying}
                          onClick={() => void handleRazorpayCheckout()}
                        >
                          <FontAwesomeIcon icon={faIndianRupeeSign} />
                          {paying ? 'Processing...' : `Pay with Razorpay · ${formatMoney(totalCents)}`}
                        </button>
                      )}
                      {!hasPaymentMethod && (
                        <p className="account-billing-unavailable">
                          Online checkout is not configured yet. Contact support to add credits, or ask
                          an admin to enable Stripe or Razorpay in the admin portal.
                        </p>
                      )}
                    </div>

                    {config?.activeMode === 'test' && hasPaymentMethod && (
                      <p className="account-billing-mode-note">
                        Test mode is active — use test cards only. No real charges will be made.
                      </p>
                    )}
                  </div>

                  <div className="usage-panel">
                    <div className="usage-panel-head">
                      <div>
                        <h2>Total spent</h2>
                        <p className="usage-panel-value">{formatMoney(stats.summary.totalSpentCents)}</p>
                        <p className="usage-panel-sub">
                          {formatNumber(stats.summary.creditsPurchased)} credit
                          {stats.summary.creditsPurchased === 1 ? '' : 's'} purchased ·{' '}
                          {formatShortDate(stats.from)} – {formatShortDate(stats.to)}
                        </p>
                      </div>
                      <span className="usage-panel-badge">1 credit = $1</span>
                    </div>
                    <BillingBarChart points={stats.daily} valueKey="amountCents" label="Spend in cents" />
                  </div>

                  <div className="account-panel account-billing-history-panel">
                    <div className="account-panel-head">
                      <div>
                        <h2>Billing history</h2>
                        <p>Payments and credit purchases for the selected period.</p>
                      </div>
                      <span className="account-billing-history-count">
                        {formatNumber(purchaseTotal)} payment{purchaseTotal === 1 ? '' : 's'}
                      </span>
                    </div>

                    {purchases.length === 0 ? (
                      <p className="account-muted">No billing history in this date range.</p>
                    ) : (
                      <>
                        <div className="account-billing-table-wrap">
                          <table className="account-billing-table">
                            <thead>
                              <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Provider</th>
                                <th scope="col">Credits</th>
                                <th scope="col">Amount</th>
                                <th scope="col">Status</th>
                                <th scope="col">Invoice</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                  <td>{formatDateTime(purchase.completedAt ?? purchase.createdAt)}</td>
                                  <td>{formatProvider(purchase.provider)}</td>
                                  <td>
                                    +{purchase.credits} credit{purchase.credits === 1 ? '' : 's'}
                                  </td>
                                  <td>{formatMoney(purchase.amountCents)}</td>
                                  <td>
                                    <span
                                      className={`account-billing-status account-billing-status--${purchase.status}`}
                                    >
                                      {formatPurchaseStatus(purchase.status)}
                                    </span>
                                  </td>
                                  <td>
                                    {purchase.status === 'completed' ? (
                                      <Link
                                        to={`/account/billing/invoice/${purchase.id}`}
                                        className="account-billing-invoice-link"
                                      >
                                        {purchase.invoiceNumber ?? 'View invoice'}
                                      </Link>
                                    ) : (
                                      <span className="account-muted">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {purchaseTotalPages > 1 && (
                          <div className="account-billing-pagination">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={purchasePage <= 1}
                              onClick={() => setPurchasePage((current) => current - 1)}
                            >
                              Previous
                            </button>
                            <span>
                              Page {purchasePage} of {purchaseTotalPages}
                            </span>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={purchasePage >= purchaseTotalPages}
                              onClick={() => setPurchasePage((current) => current + 1)}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <aside className="usage-sidebar account-billing-sidebar">
                  <UsageCreditBalanceCard
                    available={creditTotals.available}
                    total={creditTotals.total}
                    periodAmount={creditTotals.periodAmount}
                    progressPercent={balanceProgress}
                    periodLabel="purchased in this period"
                    showBuyLink={false}
                  />

                  <div className="usage-sidebar-card">
                    <div className="usage-sidebar-card-head">
                      <FontAwesomeIcon icon={faReceipt} aria-hidden="true" />
                      <h3>Total spent</h3>
                    </div>
                    <p className="usage-sidebar-metric">{formatMoney(stats.summary.totalSpentCents)}</p>
                    <MiniSparkline points={stats.daily} valueKey="amountCents" />
                  </div>

                  <div className="usage-sidebar-card">
                    <div className="usage-sidebar-card-head">
                      <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                      <h3>Credits purchased</h3>
                    </div>
                    <p className="usage-sidebar-metric">{formatNumber(stats.summary.creditsPurchased)}</p>
                    <MiniSparkline points={stats.daily} valueKey="creditsPurchased" />
                  </div>

                  <div className="usage-sidebar-card">
                    <div className="usage-sidebar-card-head">
                      <FontAwesomeIcon icon={faChartColumn} aria-hidden="true" />
                      <h3>Completed payments</h3>
                    </div>
                    <p className="usage-sidebar-metric">{formatNumber(stats.summary.purchaseCount)}</p>
                    {stats.summary.pendingCount > 0 && (
                      <p className="usage-sidebar-note">
                        {formatNumber(stats.summary.pendingCount)} pending checkout
                        {stats.summary.pendingCount === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>

                  <div className="usage-sidebar-card">
                    <div className="usage-sidebar-card-head">
                      <h3>Recent purchases</h3>
                      <span className="usage-sidebar-count">{stats.recentPurchases.length}</span>
                    </div>
                    {stats.recentPurchases.length === 0 ? (
                      <p className="account-muted">No purchases yet.</p>
                    ) : (
                      <ul className="usage-activity-list">
                        {stats.recentPurchases.map((purchase) => (
                          <li key={purchase.id}>
                            <div className="usage-activity-main">
                              <strong>
                                +{purchase.credits} credit{purchase.credits === 1 ? '' : 's'}
                              </strong>
                              <span>
                                {formatProvider(purchase.provider)} · {formatPurchaseStatus(purchase.status)}
                              </span>
                            </div>
                            <div className="usage-activity-meta">
                              <span>{formatMoney(purchase.amountCents)}</span>
                              <time dateTime={purchase.createdAt}>
                                {formatDateTime(purchase.createdAt)}
                              </time>
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
