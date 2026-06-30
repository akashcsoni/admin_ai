import { useEffect, useState, type FormEvent } from 'react'
import AdminContentCard from '../components/AdminContentCard'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi, ApiError, type InvoiceCompanySettings } from '../lib/api'

export default function AdminInvoiceSettingsPage() {
  const { token } = useAdminAuth()
  const [settings, setSettings] = useState<InvoiceCompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddressLine1, setCompanyAddressLine1] = useState('')
  const [companyAddressLine2, setCompanyAddressLine2] = useState('')
  const [companyCity, setCompanyCity] = useState('')
  const [companyState, setCompanyState] = useState('')
  const [companyPostalCode, setCompanyPostalCode] = useState('')
  const [companyCountry, setCompanyCountry] = useState('')
  const [taxId, setTaxId] = useState('')
  const [invoicePrefix, setInvoicePrefix] = useState('INV')
  const [invoiceFooter, setInvoiceFooter] = useState('')

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getInvoiceCompanySettings(token!)
        applySettings(response.settings)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load invoice settings')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  function applySettings(next: InvoiceCompanySettings) {
    setSettings(next)
    setCompanyName(next.companyName)
    setCompanyEmail(next.companyEmail)
    setCompanyPhone(next.companyPhone)
    setCompanyAddressLine1(next.companyAddressLine1)
    setCompanyAddressLine2(next.companyAddressLine2)
    setCompanyCity(next.companyCity)
    setCompanyState(next.companyState)
    setCompanyPostalCode(next.companyPostalCode)
    setCompanyCountry(next.companyCountry)
    setTaxId(next.taxId)
    setInvoicePrefix(next.invoicePrefix || 'INV')
    setInvoiceFooter(next.invoiceFooter)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await adminApi.saveInvoiceCompanySettings(token, {
        companyName,
        companyEmail,
        companyPhone,
        companyAddressLine1,
        companyAddressLine2,
        companyCity,
        companyState,
        companyPostalCode,
        companyCountry,
        taxId,
        invoicePrefix,
        invoiceFooter,
      })
      applySettings(response.settings)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save invoice settings')
    } finally {
      setSaving(false)
    }
  }

  const nextInvoiceLabel = settings
    ? `${invoicePrefix || 'INV'}-${String(settings.nextInvoiceNumber).padStart(5, '0')}`
    : null

  return (
    <div className="admin-page admin-invoice-settings-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Configuration</p>
          <h1>Invoice company info</h1>
          <p className="admin-page-lead">
            Company details shown on member invoices. Invoice numbers are assigned automatically
            when a payment completes.
          </p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      <AdminContentCard
        title="Company & invoice details"
        description="All fields appear on generated invoices for credit purchases."
        loading={loading}
        loadingLabel="Loading invoice settings..."
        meta={
          nextInvoiceLabel ? (
            <span className="admin-invoice-next-chip">Next invoice: {nextInvoiceLabel}</span>
          ) : null
        }
        className="admin-invoice-settings-card"
      >
        {settings ? (
          <form className="admin-invoice-settings-form" onSubmit={handleSubmit}>
            <section className="admin-invoice-settings-section">
              <h3>Company</h3>
              <div className="admin-form-grid admin-invoice-settings-grid">
                <label className="admin-field admin-field--wide">
                  <span>Company name</span>
                  <input
                    className="admin-input"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Content AI Inc."
                  />
                </label>

                <label className="admin-field">
                  <span>Email</span>
                  <input
                    className="admin-input"
                    type="email"
                    value={companyEmail}
                    onChange={(event) => setCompanyEmail(event.target.value)}
                    placeholder="billing@example.com"
                  />
                </label>

                <label className="admin-field">
                  <span>Phone</span>
                  <input
                    className="admin-input"
                    value={companyPhone}
                    onChange={(event) => setCompanyPhone(event.target.value)}
                    placeholder="+1 555 0100"
                  />
                </label>

                <label className="admin-field">
                  <span>Tax ID / VAT</span>
                  <input
                    className="admin-input"
                    value={taxId}
                    onChange={(event) => setTaxId(event.target.value)}
                    placeholder="Optional"
                  />
                </label>
              </div>
            </section>

            <section className="admin-invoice-settings-section">
              <h3>Address</h3>
              <div className="admin-form-grid admin-invoice-settings-grid">
                <label className="admin-field admin-field--wide">
                  <span>Address line 1</span>
                  <input
                    className="admin-input"
                    value={companyAddressLine1}
                    onChange={(event) => setCompanyAddressLine1(event.target.value)}
                  />
                </label>

                <label className="admin-field admin-field--wide">
                  <span>Address line 2</span>
                  <input
                    className="admin-input"
                    value={companyAddressLine2}
                    onChange={(event) => setCompanyAddressLine2(event.target.value)}
                    placeholder="Optional"
                  />
                </label>

                <label className="admin-field">
                  <span>City</span>
                  <input
                    className="admin-input"
                    value={companyCity}
                    onChange={(event) => setCompanyCity(event.target.value)}
                  />
                </label>

                <label className="admin-field">
                  <span>State / region</span>
                  <input
                    className="admin-input"
                    value={companyState}
                    onChange={(event) => setCompanyState(event.target.value)}
                  />
                </label>

                <label className="admin-field">
                  <span>Postal code</span>
                  <input
                    className="admin-input"
                    value={companyPostalCode}
                    onChange={(event) => setCompanyPostalCode(event.target.value)}
                  />
                </label>

                <label className="admin-field">
                  <span>Country</span>
                  <input
                    className="admin-input"
                    value={companyCountry}
                    onChange={(event) => setCompanyCountry(event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="admin-invoice-settings-section">
              <h3>Invoice options</h3>
              <div className="admin-form-grid admin-invoice-settings-grid">
                <label className="admin-field">
                  <span>Invoice prefix</span>
                  <input
                    className="admin-input"
                    value={invoicePrefix}
                    maxLength={20}
                    onChange={(event) => setInvoicePrefix(event.target.value.toUpperCase())}
                    placeholder="INV"
                  />
                </label>

                <div className="admin-field admin-invoice-settings-readonly">
                  <span>Next number</span>
                  <p>{nextInvoiceLabel}</p>
                  <p className="admin-invoice-settings-help">
                    Assigned automatically on completed purchases.
                  </p>
                </div>

                <label className="admin-field admin-field--wide">
                  <span>Footer note</span>
                  <textarea
                    className="admin-input admin-textarea admin-invoice-settings-textarea"
                    rows={2}
                    value={invoiceFooter}
                    onChange={(event) => setInvoiceFooter(event.target.value)}
                    placeholder="Thank you for your purchase."
                  />
                </label>
              </div>
            </section>

            <div className="admin-form-actions admin-invoice-settings-actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save invoice settings'}
              </button>
            </div>
          </form>
        ) : null}
      </AdminContentCard>
    </div>
  )
}
