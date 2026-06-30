import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsRotate,
  faBolt,
  faCalendarDays,
  faChartLine,
  faCoins,
  faEnvelope,
  faPenToSquare,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import AdminContentCard from '../components/AdminContentCard'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi, ApiError, type ServiceCreditSetting } from '../lib/api'
import { adminHasPermission } from '../lib/adminPermissions'
import { services } from '../data/services'

const serviceIcons: Record<string, IconDefinition> = {
  blog: faPenToSquare,
  social: faShareNodes,
  seo: faChartLine,
  repurpose: faArrowsRotate,
  newsletter: faEnvelope,
  schedule: faCalendarDays,
}

type EditableServiceCredit = ServiceCreditSetting & {
  available: boolean
  shortDescription: string
  icon: string
}

function formatCredits(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function formatMoneyFromCredits(credits: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(credits) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(credits)
}

export default function AdminServicesPage() {
  const { token, admin } = useAdminAuth()
  const [items, setItems] = useState<EditableServiceCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const canEdit = admin ? adminHasPermission(admin.role, 'payment.manage') : false

  const liveItems = useMemo(() => items.filter((item) => item.available), [items])
  const comingSoonCount = items.length - liveItems.length
  const customPricingCount = useMemo(
    () => items.filter((item) => item.creditCost !== 1).length,
    [items],
  )

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getServiceCreditSettings(token!)
        const merged = response.services.map((row) => {
          const catalog = services.find((service) => service.id === row.serviceId)
          return {
            ...row,
            available: catalog?.available ?? false,
            shortDescription: catalog?.shortDescription ?? '',
            icon: catalog?.icon ?? 'blog',
          }
        })
        setItems(merged)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load service settings')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token])

  function updateCreditCost(serviceId: string, rawValue: string) {
    const parsed = Number(rawValue)
    if (!Number.isFinite(parsed)) return
    const creditCost = Math.round(Math.max(0, Math.min(100, parsed)) * 100) / 100
    setItems((current) =>
      current.map((item) => (item.serviceId === serviceId ? { ...item, creditCost } : item)),
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token || !canEdit) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await adminApi.saveServiceCreditSettings(token, {
        services: items.map((item) => ({
          serviceId: item.serviceId,
          creditCost: item.creditCost,
        })),
      })

      const merged = response.services.map((row) => {
        const catalog = services.find((service) => service.id === row.serviceId)
        return {
          ...row,
          available: catalog?.available ?? false,
          shortDescription: catalog?.shortDescription ?? '',
          icon: catalog?.icon ?? 'blog',
        }
      })
      setItems(merged)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save service credit settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page admin-services-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Catalog</p>
          <h1>Services</h1>
          <p className="admin-page-lead">
            Set how many credits each service deducts per generation. Changes apply to new requests
            for live services.
          </p>
        </div>
      </header>

      {error ? <p className="admin-alert admin-alert--error">{error}</p> : null}
      {message ? <p className="admin-alert admin-alert--success">{message}</p> : null}

      {!loading && items.length > 0 ? (
        <div className="admin-service-summary">
          <article className="admin-service-summary-card">
            <span className="admin-service-summary-label">Live services</span>
            <strong>{liveItems.length}</strong>
            <span className="admin-service-summary-meta">Available to members today</span>
          </article>
          <article className="admin-service-summary-card">
            <span className="admin-service-summary-label">Coming soon</span>
            <strong>{comingSoonCount}</strong>
            <span className="admin-service-summary-meta">Pricing can be set in advance</span>
          </article>
          <article className="admin-service-summary-card">
            <span className="admin-service-summary-label">Custom pricing</span>
            <strong>{customPricingCount}</strong>
            <span className="admin-service-summary-meta">Not using the default 1 credit</span>
          </article>
        </div>
      ) : null}

      <AdminContentCard
        title="Credit cost per service"
        description={
          canEdit
            ? 'Each generation deducts the credits shown below. Minimum step 0.01 · 1 credit = $1 for members.'
            : 'View-only access. Payment administrators can edit credit costs.'
        }
        loading={loading}
        loadingLabel="Loading service settings..."
      >
        {!loading ? (
          <form className="admin-service-settings-form" onSubmit={(event) => void handleSubmit(event)}>
            <div className="admin-service-table-wrap">
              <table className="admin-service-table">
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Status</th>
                    <th scope="col">Credits per generation</th>
                    <th scope="col">Member cost</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((service) => (
                    <tr
                      key={service.serviceId}
                      className={service.available ? 'admin-service-row--live' : 'admin-service-row--soon'}
                    >
                      <td>
                        <div className="admin-service-cell">
                          <span className="admin-service-cell-icon" aria-hidden="true">
                            <FontAwesomeIcon icon={serviceIcons[service.icon] ?? faBolt} />
                          </span>
                          <div>
                            <strong>{service.title}</strong>
                            <span className="admin-service-cell-desc">{service.shortDescription}</span>
                            <span className="admin-service-cell-id">{service.serviceId}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-pill${service.available ? ' admin-pill--success' : ''}`}>
                          {service.available ? 'Live' : 'Coming soon'}
                        </span>
                      </td>
                      <td>
                        <label className="admin-service-credit-input">
                          <FontAwesomeIcon icon={faCoins} aria-hidden="true" />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            inputMode="decimal"
                            aria-label={`Credits per generation for ${service.title}`}
                            value={service.creditCost}
                            disabled={!canEdit || saving}
                            onChange={(event) => updateCreditCost(service.serviceId, event.target.value)}
                          />
                          <span className="admin-service-credit-unit">
                            credit{service.creditCost === 1 ? '' : 's'}
                          </span>
                        </label>
                      </td>
                      <td>
                        <span className="admin-service-cost">{formatMoneyFromCredits(service.creditCost)}</span>
                        <span className="admin-service-cost-note">per generation</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-service-footnote">
              <p>
                Live services:{' '}
                {liveItems.length > 0
                  ? liveItems.map((item) => `${item.title} (${formatCredits(item.creditCost)} credit${item.creditCost === 1 ? '' : 's'})`).join(' · ')
                  : 'None yet'}
              </p>
            </div>

            {canEdit ? (
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save credit settings'}
                </button>
              </div>
            ) : null}
          </form>
        ) : null}
      </AdminContentCard>
    </div>
  )
}
