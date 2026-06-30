import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faCircleCheck,
  faCoins,
  faCreditCard,
  faGear,
  faMagnifyingGlass,
  faPlus,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons'
import AdminPagination from '../components/AdminPagination'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminHasPermission } from '../lib/adminPermissions'
import { adminApi, type AdminBillingOverview, type AdminBillingPurchase } from '../lib/api'

type PeriodDays = 7 | 30 | 90

type PurchaseTab = 'all' | 'completed' | 'pending' | 'failed'

const purchaseTabs: { value: PurchaseTab; label: string }[] = [
  { value: 'all', label: 'All purchases' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPeriodRange(days: PeriodDays): { from: string; to: string } {
  const to = new Date()
  to.setHours(0, 0, 0, 0)
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

function formatMoney(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

function formatCreated(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function memberLabel(purchase: AdminBillingPurchase): string {
  const name = purchase.userFullName?.trim()
  return name ? `${name} · ${purchase.userEmail}` : purchase.userEmail
}

function formatProvider(provider: AdminBillingPurchase['provider']): string {
  return provider === 'stripe' ? 'Stripe' : 'Razorpay'
}

const periodOptions: { value: PeriodDays; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

const providerFilters = [
  { value: 'all', label: 'All providers' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'razorpay', label: 'Razorpay' },
] as const

export default function AdminBillingPage() {
  const navigate = useNavigate()
  const { token, admin } = useAdminAuth()
  const [periodDays, setPeriodDays] = useState<PeriodDays>(30)
  const [overview, setOverview] = useState<AdminBillingOverview | null>(null)
  const [purchases, setPurchases] = useState<AdminBillingPurchase[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<PurchaseTab>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [providerFilter, setProviderFilter] =
    useState<(typeof providerFilters)[number]['value']>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(25)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [error, setError] = useState('')

  const periodRange = useMemo(() => getPeriodRange(periodDays), [periodDays])
  const statusFilter = activeTab

  const canManagePayment = admin ? adminHasPermission(admin.role, 'payment.manage') : false

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1)
      setQuery(search.trim())
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    if (!token) return

    async function loadOverview() {
      setLoadingOverview(true)
      setError('')
      try {
        const response = await adminApi.getBillingOverview(token!, periodRange)
        setOverview(response.overview)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing overview')
        setOverview(null)
      } finally {
        setLoadingOverview(false)
      }
    }

    void loadOverview()
  }, [token, periodRange.from, periodRange.to])

  useEffect(() => {
    if (!token) return

    async function loadPurchases() {
      setLoadingPurchases(true)
      setError('')
      try {
        const response = await adminApi.listBillingPurchases(token!, {
          page,
          pageSize,
          status: statusFilter,
          provider: providerFilter,
          search: query,
          from: periodRange.from,
          to: periodRange.to,
        })
        setPurchases(response.purchases)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load purchases')
        setPurchases([])
        setTotal(0)
      } finally {
        setLoadingPurchases(false)
      }
    }

    void loadPurchases()
  }, [token, page, pageSize, statusFilter, providerFilter, query, periodRange.from, periodRange.to])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  function handlePeriodChange(days: PeriodDays) {
    setPeriodDays(days)
    setPage(1)
  }

  function handleTabChange(tab: PurchaseTab) {
    setActiveTab(tab)
    setPage(1)
  }

  return (
    <div className="admin-page admin-billing-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Revenue</p>
          <h1>Billing</h1>
          <p className="admin-page-lead">
            Track credit purchases, payment providers, and platform revenue across members.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <div className="admin-billing-period-toggle" role="group" aria-label="Reporting period">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`admin-billing-period-btn${
                  periodDays === option.value ? ' admin-billing-period-btn--active' : ''
                }`}
                aria-pressed={periodDays === option.value}
                onClick={() => handlePeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {loadingOverview ? (
        <p className="admin-muted">Loading billing overview...</p>
      ) : overview ? (
        <section className="admin-stat-grid admin-stat-grid--dashboard" aria-label="Billing overview">
          <article className="admin-stat-card admin-stat-card--green">
            <div className="admin-stat-card-top">
              <span className="admin-stat-card-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faCreditCard} />
              </span>
              <p className="admin-stat-label">Revenue</p>
            </div>
            <p className="admin-stat-value">
              {formatMoney(overview.summary.totalRevenueCents)}
            </p>
            <p className="admin-stat-meta">
              {overview.summary.completedPurchases} completed purchase
              {overview.summary.completedPurchases === 1 ? '' : 's'}
            </p>
          </article>

          <article className="admin-stat-card admin-stat-card--blue">
            <div className="admin-stat-card-top">
              <span className="admin-stat-card-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faCoins} />
              </span>
              <p className="admin-stat-label">Credits sold</p>
            </div>
            <p className="admin-stat-value">{overview.summary.creditsSold}</p>
            <p className="admin-stat-meta">
              {overview.summary.totalCreditsInSystem.toLocaleString()} credits in member wallets
            </p>
          </article>

          <article className="admin-stat-card admin-stat-card--violet">
            <div className="admin-stat-card-top">
              <span className="admin-stat-card-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faReceipt} />
              </span>
              <p className="admin-stat-label">Providers</p>
            </div>
            <p className="admin-stat-value admin-billing-provider-value">
              {overview.summary.stripePurchases}/{overview.summary.razorpayPurchases}
            </p>
            <p className="admin-stat-meta">Stripe / Razorpay completed</p>
          </article>

          <article className="admin-stat-card admin-stat-card--amber">
            <div className="admin-stat-card-top">
              <span className="admin-stat-card-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faGear} />
              </span>
              <p className="admin-stat-label">Checkout mode</p>
            </div>
            <p className="admin-stat-value admin-billing-mode-value">
              {overview.paymentMode === 'live' ? 'Live' : 'Test'}
            </p>
            <p className="admin-stat-meta">
              {overview.stripeEnabled ? 'Stripe on' : 'Stripe off'}
              {' · '}
              {overview.razorpayEnabled ? 'Razorpay on' : 'Razorpay off'}
            </p>
          </article>
        </section>
      ) : null}

      <section className="admin-billing-quick-links" aria-label="Billing tools">
        <Link to="/credits" className="admin-billing-quick-link">
          <strong>Credits ledger</strong>
          <span>Manual adjustments and transaction history</span>
          <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
        </Link>
        {canManagePayment ? (
          <Link to="/settings/payment" className="admin-billing-quick-link">
            <strong>Payment settings</strong>
            <span>Stripe and Razorpay keys, test / live mode</span>
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Link>
        ) : null}
        {admin && adminHasPermission(admin.role, 'support.view') ? (
          <Link to="/support" className="admin-billing-quick-link">
            <strong>Support tickets</strong>
            <span>Billing questions from members</span>
            <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
          </Link>
        ) : null}
      </section>

      <section className="admin-logs-panel admin-billing-purchases-panel" aria-label="Credit purchases">
        <div className="admin-staff-roster-head">
          <div>
            <h2>Credit purchases</h2>
            <p>
              Member checkout activity from {periodRange.from} to {periodRange.to}.
              {overview ? (
                <>
                  {' '}
                  {overview.summary.pendingPurchases} pending · {overview.summary.failedPurchases}{' '}
                  failed in this period.
                </>
              ) : null}
            </p>
          </div>
        </div>

        <nav className="admin-logs-tabs" aria-label="Purchase filters">
          {purchaseTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`admin-logs-tab${activeTab === tab.value && providerFilter === 'all' ? ' admin-logs-tab--active' : ''}`}
              onClick={() => {
                handleTabChange(tab.value)
                setProviderFilter('all')
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-logs-toolbar">
          <form className="admin-logs-search" onSubmit={handleSearchSubmit}>
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              type="search"
              value={search}
              placeholder="Search..."
              aria-label="Search purchases"
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>

          <button
            type="button"
            className={`admin-logs-filter-btn${showFilters ? ' admin-logs-filter-btn--active' : ''}`}
            onClick={() => setShowFilters((current) => !current)}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            Add filter
          </button>

          <span className="admin-logs-count">
            {loadingPurchases
              ? 'Loading...'
              : `${total.toLocaleString()} result${total === 1 ? '' : 's'}`}
          </span>
        </div>

        {showFilters && (
          <div className="admin-logs-filters">
            <label className="admin-logs-filter-field">
              <span>Provider</span>
              <select
                value={providerFilter}
                aria-label="Filter by provider"
                onChange={(event) => {
                  setPage(1)
                  setProviderFilter(event.target.value as (typeof providerFilters)[number]['value'])
                }}
              >
                {providerFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="admin-logs-body">
          {loadingPurchases ? (
            <p className="admin-logs-loading">Loading purchases...</p>
          ) : purchases.length === 0 ? (
            <div className="admin-logs-empty">
              <p>No purchases found</p>
              <span>Completed checkouts will appear here once members buy credits.</span>
            </div>
          ) : (
            <div className="admin-logs-table-wrap">
              <table className="admin-logs-table admin-billing-purchases-table">
                <thead>
                  <tr>
                    <th scope="col" className="admin-billing-col-member">
                      Member
                    </th>
                    <th scope="col" className="admin-billing-col-credits">
                      Credits
                    </th>
                    <th scope="col" className="admin-billing-col-amount">
                      Amount
                    </th>
                    <th scope="col" className="admin-billing-col-provider">
                      Provider
                    </th>
                    <th scope="col" className="admin-billing-col-status">
                      Status
                    </th>
                    <th scope="col" className="admin-billing-col-created">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="admin-logs-table-row"
                      tabIndex={0}
                      onClick={() => navigate(`/users/${purchase.userId}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/users/${purchase.userId}`)
                        }
                      }}
                    >
                      <td className="admin-billing-purchase-member">
                        <span className="admin-logs-cell-text">{memberLabel(purchase)}</span>
                      </td>
                      <td className="admin-billing-purchase-credits">
                        <span className="admin-logs-cell-mono">+{purchase.credits}</span>
                      </td>
                      <td className="admin-billing-purchase-amount">
                        <span className="admin-logs-cell-text">
                          {formatMoney(purchase.amountCents, purchase.currency)}
                        </span>
                      </td>
                      <td className="admin-billing-purchase-provider">
                        <span className="admin-billing-provider-chip">
                          {formatProvider(purchase.provider)}
                        </span>
                      </td>
                      <td className="admin-billing-purchase-status">
                        <span className="admin-logs-status">
                          {purchase.status === 'completed' ? (
                            <>
                              <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
                              Completed
                            </>
                          ) : purchase.status === 'failed' ? (
                            <>Failed</>
                          ) : (
                            <>Pending</>
                          )}
                        </span>
                      </td>
                      <td className="admin-billing-purchase-created admin-logs-table-date">
                        {formatCreated(purchase.completedAt ?? purchase.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loadingPurchases && totalPages > 1 && (
          <AdminPagination
            className="admin-logs-footer"
            page={page}
            totalPages={totalPages}
            total={total}
            onPrevious={() => setPage((current) => current - 1)}
            onNext={() => setPage((current) => current + 1)}
          />
        )}
      </section>
    </div>
  )
}
