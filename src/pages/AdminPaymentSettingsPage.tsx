import { useEffect, useState, type FormEvent } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi, ApiError, type PaymentMode, type PaymentSettings } from '../lib/api'

export default function AdminPaymentSettingsPage() {
  const { token } = useAdminAuth()
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [activeMode, setActiveMode] = useState<PaymentMode>('test')
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [stripeTestPublishableKey, setStripeTestPublishableKey] = useState('')
  const [stripeTestSecretKey, setStripeTestSecretKey] = useState('')
  const [stripeLivePublishableKey, setStripeLivePublishableKey] = useState('')
  const [stripeLiveSecretKey, setStripeLiveSecretKey] = useState('')
  const [razorpayEnabled, setRazorpayEnabled] = useState(false)
  const [razorpayTestKeyId, setRazorpayTestKeyId] = useState('')
  const [razorpayTestKeySecret, setRazorpayTestKeySecret] = useState('')
  const [razorpayLiveKeyId, setRazorpayLiveKeyId] = useState('')
  const [razorpayLiveKeySecret, setRazorpayLiveKeySecret] = useState('')

  useEffect(() => {
    if (!token) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getPaymentSettings(token!)
        applySettings(response.settings)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load payment settings')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [token])

  function applySettings(next: PaymentSettings) {
    setSettings(next)
    setActiveMode(next.activeMode)
    setStripeEnabled(next.stripeEnabled)
    setStripeTestPublishableKey(next.stripeTestPublishableKey)
    setStripeLivePublishableKey(next.stripeLivePublishableKey)
    setRazorpayEnabled(next.razorpayEnabled)
    setRazorpayTestKeyId(next.razorpayTestKeyId)
    setRazorpayLiveKeyId(next.razorpayLiveKeyId)
    setStripeTestSecretKey('')
    setStripeLiveSecretKey('')
    setRazorpayTestKeySecret('')
    setRazorpayLiveKeySecret('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await adminApi.savePaymentSettings(token, {
        activeMode,
        stripeEnabled,
        stripeTestPublishableKey,
        stripeTestSecretKey: stripeTestSecretKey.trim() || undefined,
        stripeLivePublishableKey,
        stripeLiveSecretKey: stripeLiveSecretKey.trim() || undefined,
        razorpayEnabled,
        razorpayTestKeyId,
        razorpayTestKeySecret: razorpayTestKeySecret.trim() || undefined,
        razorpayLiveKeyId,
        razorpayLiveKeySecret: razorpayLiveKeySecret.trim() || undefined,
      })
      applySettings(response.settings)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save payment settings')
    } finally {
      setSaving(false)
    }
  }

  const liveMode = activeMode === 'live'

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Configuration</p>
          <h1>Payment settings</h1>
          <p className="admin-page-lead">
            Configure Stripe and Razorpay with separate test and live keys. Secret keys are stored
            securely and never shown again after saving.
          </p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      {loading ? (
        <p className="admin-muted">Loading payment settings...</p>
      ) : settings ? (
        <form className="admin-payment-form" onSubmit={handleSubmit}>
          <div className="admin-payment-accordion">
            <details className="admin-payment-section" open>
              <summary>
                <span className="admin-payment-section-summary-main">
                  <span className="admin-payment-section-title">Environment mode</span>
                  <span
                    className={`admin-payment-section-meta${liveMode ? ' admin-payment-section-meta--live' : ''}`}
                  >
                    {liveMode ? 'Live checkout' : 'Test checkout'}
                  </span>
                </span>
              </summary>

              <div className="admin-payment-section-body">
                <div className="admin-payment-field-group admin-payment-field-group--toggle">
                  <label className="admin-switch-row">
                    <span className="admin-switch-label">Use live checkout mode</span>
                    <input
                      type="checkbox"
                      checked={liveMode}
                      onChange={(event) => setActiveMode(event.target.checked ? 'live' : 'test')}
                    />
                  </label>
                  <p className="admin-payment-help">
                    {liveMode
                      ? 'Live mode uses production keys and processes real payments.'
                      : 'Test mode uses sandbox keys — recommended while developing.'}
                  </p>
                </div>
              </div>
            </details>

            <details className="admin-payment-section">
              <summary>
                <span className="admin-payment-section-summary-main">
                  <span className="admin-payment-section-title">Stripe</span>
                  <span className="admin-payment-section-meta">
                    {stripeEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </span>
              </summary>

              <div className="admin-payment-section-body">
                <div className="admin-payment-field-group admin-payment-field-group--toggle">
                  <label className="admin-switch-row">
                    <span className="admin-switch-label">Enable Stripe payments</span>
                    <input
                      type="checkbox"
                      checked={stripeEnabled}
                      onChange={(event) => setStripeEnabled(event.target.checked)}
                    />
                  </label>
                </div>

                <fieldset className="admin-payment-fieldset" disabled={!stripeEnabled}>
                  <details className="admin-payment-subsection" open>
                    <summary>
                      <span className="admin-payment-section-summary-main">
                        <span className="admin-payment-section-title">Test keys</span>
                        <span className="admin-payment-section-meta">
                          {settings.hasStripeTestSecret ? 'Secret saved' : 'Not configured'}
                        </span>
                      </span>
                    </summary>
                    <div className="admin-payment-section-body admin-payment-section-body--nested">
                      <label className="admin-field">
                        <span>Publishable key</span>
                        <input
                          className="admin-input"
                          value={stripeTestPublishableKey}
                          onChange={(event) => setStripeTestPublishableKey(event.target.value)}
                          placeholder="pk_test_..."
                        />
                      </label>
                      <label className="admin-field">
                        <span>Secret key</span>
                        <input
                          className="admin-input"
                          type="password"
                          value={stripeTestSecretKey}
                          onChange={(event) => setStripeTestSecretKey(event.target.value)}
                          placeholder={
                            settings.hasStripeTestSecret ? 'Saved — enter to replace' : 'sk_test_...'
                          }
                        />
                      </label>
                    </div>
                  </details>

                  <details className="admin-payment-subsection">
                    <summary>
                      <span className="admin-payment-section-summary-main">
                        <span className="admin-payment-section-title">Live keys</span>
                        <span className="admin-payment-section-meta admin-payment-section-meta--live">
                          {settings.hasStripeLiveSecret ? 'Secret saved' : 'Not configured'}
                        </span>
                      </span>
                    </summary>
                    <div className="admin-payment-section-body admin-payment-section-body--nested">
                      <label className="admin-field">
                        <span>Publishable key</span>
                        <input
                          className="admin-input"
                          value={stripeLivePublishableKey}
                          onChange={(event) => setStripeLivePublishableKey(event.target.value)}
                          placeholder="pk_live_..."
                        />
                      </label>
                      <label className="admin-field">
                        <span>Secret key</span>
                        <input
                          className="admin-input"
                          type="password"
                          value={stripeLiveSecretKey}
                          onChange={(event) => setStripeLiveSecretKey(event.target.value)}
                          placeholder={
                            settings.hasStripeLiveSecret ? 'Saved — enter to replace' : 'sk_live_...'
                          }
                        />
                      </label>
                    </div>
                  </details>
                </fieldset>
              </div>
            </details>

            <details className="admin-payment-section">
              <summary>
                <span className="admin-payment-section-summary-main">
                  <span className="admin-payment-section-title">Razorpay</span>
                  <span className="admin-payment-section-meta">
                    {razorpayEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </span>
              </summary>

              <div className="admin-payment-section-body">
                <div className="admin-payment-field-group admin-payment-field-group--toggle">
                  <label className="admin-switch-row">
                    <span className="admin-switch-label">Enable Razorpay payments</span>
                    <input
                      type="checkbox"
                      checked={razorpayEnabled}
                      onChange={(event) => setRazorpayEnabled(event.target.checked)}
                    />
                  </label>
                </div>

                <fieldset className="admin-payment-fieldset" disabled={!razorpayEnabled}>
                  <details className="admin-payment-subsection" open>
                    <summary>
                      <span className="admin-payment-section-summary-main">
                        <span className="admin-payment-section-title">Test keys</span>
                        <span className="admin-payment-section-meta">
                          {settings.hasRazorpayTestSecret ? 'Secret saved' : 'Not configured'}
                        </span>
                      </span>
                    </summary>
                    <div className="admin-payment-section-body admin-payment-section-body--nested">
                      <label className="admin-field">
                        <span>Key ID</span>
                        <input
                          className="admin-input"
                          value={razorpayTestKeyId}
                          onChange={(event) => setRazorpayTestKeyId(event.target.value)}
                          placeholder="rzp_test_..."
                        />
                      </label>
                      <label className="admin-field">
                        <span>Key secret</span>
                        <input
                          className="admin-input"
                          type="password"
                          value={razorpayTestKeySecret}
                          onChange={(event) => setRazorpayTestKeySecret(event.target.value)}
                          placeholder={
                            settings.hasRazorpayTestSecret
                              ? 'Saved — enter to replace'
                              : 'Test secret key'
                          }
                        />
                      </label>
                    </div>
                  </details>

                  <details className="admin-payment-subsection">
                    <summary>
                      <span className="admin-payment-section-summary-main">
                        <span className="admin-payment-section-title">Live keys</span>
                        <span className="admin-payment-section-meta admin-payment-section-meta--live">
                          {settings.hasRazorpayLiveSecret ? 'Secret saved' : 'Not configured'}
                        </span>
                      </span>
                    </summary>
                    <div className="admin-payment-section-body admin-payment-section-body--nested">
                      <label className="admin-field">
                        <span>Key ID</span>
                        <input
                          className="admin-input"
                          value={razorpayLiveKeyId}
                          onChange={(event) => setRazorpayLiveKeyId(event.target.value)}
                          placeholder="rzp_live_..."
                        />
                      </label>
                      <label className="admin-field">
                        <span>Key secret</span>
                        <input
                          className="admin-input"
                          type="password"
                          value={razorpayLiveKeySecret}
                          onChange={(event) => setRazorpayLiveKeySecret(event.target.value)}
                          placeholder={
                            settings.hasRazorpayLiveSecret
                              ? 'Saved — enter to replace'
                              : 'Live secret key'
                          }
                        />
                      </label>
                    </div>
                  </details>
                </fieldset>
              </div>
            </details>
          </div>

          <div className="admin-payment-footer">
            <p className="admin-payment-help">
              Last updated: {new Date(settings.updatedAt).toLocaleString()}
            </p>
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save payment settings'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
