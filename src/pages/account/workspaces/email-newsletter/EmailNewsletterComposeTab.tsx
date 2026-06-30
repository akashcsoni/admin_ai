import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons'
import type { Service } from '../../../../data/services'
import { ApiError, emailNewsletterApi, type EmailNewsletterDetail } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import { formatCreditCostLabel, useServiceCreditCost, useServiceCredits } from '../../../../context/ServiceCreditsContext'
import EmailNewsletterPreview from './EmailNewsletterPreview'
import type { EmailNewsletterSettings } from './emailNewsletter.types'
import { getDefaultTopicBrief } from './emailNewsletter.types'

type EmailNewsletterComposeTabProps = {
  service: Service
  settings: EmailNewsletterSettings | null
  onSettingsSaved: (settings: EmailNewsletterSettings) => void
}

export default function EmailNewsletterComposeTab({
  service,
  settings,
  onSettingsSaved,
}: EmailNewsletterComposeTabProps) {
  const { user, token, refreshUser } = useAuth()
  const { refreshCreditCosts } = useServiceCredits()
  const creditCost = useServiceCreditCost(service.id)
  const creditCostLabel = formatCreditCostLabel(creditCost)
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [generatedNewsletter, setGeneratedNewsletter] = useState<EmailNewsletterDetail | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasApiKey = settings?.hasApiKey ?? false
  const isActive = settings?.enabled ?? false
  const hasCredits = (user?.credits ?? 0) >= creditCost
  const canGenerate = hasApiKey && isActive && hasCredits && topic.trim().length >= 2
  const exampleTopicBrief = getDefaultTopicBrief(settings)

  async function handleToggleActive() {
    if (!token || !settings) return

    setTogglingActive(true)
    setError('')

    try {
      const response = await emailNewsletterApi.saveSettings(token, { enabled: !settings.enabled })
      onSettingsSaved(response.settings)
      setSuccess(response.settings.enabled ? 'Email newsletters activated' : 'Email newsletters deactivated')
      window.setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to update status')
    } finally {
      setTogglingActive(false)
    }
  }

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !canGenerate) return

    setGenerating(true)
    setError('')
    setGeneratedNewsletter(null)

    try {
      const response = await emailNewsletterApi.generateNewsletter(token, { topic: topic.trim() })
      setGeneratedNewsletter(response.newsletter)
      setSuccess(response.message)
      await refreshUser()
      await refreshCreditCosts()
      window.setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to generate newsletter')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Compose</h2>
          <p>Turn a topic or brief into a complete HTML email with subject line, preview text, and plain-text fallback.</p>
        </div>

        <label className="service-active-toggle">
          <span>Email newsletters</span>
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
          Add your AI API key in <Link to="?tab=settings">Settings</Link> before generating newsletters.
        </p>
      )}

      {settings && !settings.enabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Email newsletters are inactive. Turn them on using the switch above or enable them in Settings.
        </p>
      )}

      {!hasCredits && hasApiKey && isActive && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          You need at least {creditCostLabel} to generate a newsletter.{' '}
          <Link to="/account/billing">Buy credits</Link>
        </p>
      )}

      <form className="service-social-compose-form" onSubmit={handleGenerate}>
        <label className="service-settings-field service-settings-field--full">
          <span>Topic or brief</span>
          <textarea
            className="account-settings-input"
            rows={4}
            value={topic}
            placeholder={exampleTopicBrief}
            onChange={(event) => setTopic(event.target.value)}
          />
          <span className="service-field-hint">Example: {exampleTopicBrief}</span>
        </label>

        <div className="service-social-compose-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!exampleTopicBrief}
            onClick={() => setTopic(exampleTopicBrief)}
          >
            Use example brief
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canGenerate || generating}>
            <FontAwesomeIcon icon={generating ? faSpinner : faEnvelope} spin={generating} aria-hidden="true" />
            {generating ? 'Generating HTML email...' : `Generate newsletter (${creditCostLabel})`}
          </button>
        </div>
      </form>

      {generatedNewsletter && (
        <EmailNewsletterPreview
          newsletter={generatedNewsletter}
          onClose={() => setGeneratedNewsletter(null)}
        />
      )}
    </div>
  )
}
