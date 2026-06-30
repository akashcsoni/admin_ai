import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faSpinner } from '@fortawesome/free-solid-svg-icons'
import type { Service } from '../../../../data/services'
import { ApiError, socialContentApi, type SocialContentPostDetail, type SocialPlatform } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import { formatCreditCostLabel, useServiceCreditCost, useServiceCredits } from '../../../../context/ServiceCreditsContext'
import type { SocialContentSettings } from './socialContent.types'
import { getDefaultTopicBrief, platformDescriptions, platformLabels } from './socialContent.types'
import SocialContentPostPreview from './SocialContentPostPreview'

type SocialContentComposeTabProps = {
  service: Service
  settings: SocialContentSettings | null
  onSettingsSaved: (settings: SocialContentSettings) => void
}

export default function SocialContentComposeTab({
  service,
  settings,
  onSettingsSaved,
}: SocialContentComposeTabProps) {
  const { user, token, refreshUser } = useAuth()
  const { refreshCreditCosts } = useServiceCredits()
  const creditCost = useServiceCreditCost(service.id)
  const creditCostLabel = formatCreditCostLabel(creditCost)
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState<SocialPlatform>(settings?.default_platform ?? 'linkedin')
  const [generating, setGenerating] = useState(false)
  const [togglingActive, setTogglingActive] = useState(false)
  const [generatedPost, setGeneratedPost] = useState<SocialContentPostDetail | null>(null)
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
      const response = await socialContentApi.saveSettings(token, { enabled: !settings.enabled })
      onSettingsSaved(response.settings)
      setSuccess(response.settings.enabled ? 'Social content activated' : 'Social content deactivated')
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
    setGeneratedPost(null)

    try {
      const response = await socialContentApi.generatePost(token, {
        topic: topic.trim(),
        platform,
      })
      setGeneratedPost(response.post)
      setSuccess(response.message)
      await refreshUser()
      await refreshCreditCosts()
      window.setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to generate social post')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Compose</h2>
          <p>Turn a topic or brief into a platform-native social post with hooks and hashtags.</p>
        </div>

        <label className="service-active-toggle">
          <span>Social content</span>
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
          Add your AI API key in <Link to="?tab=settings">Settings</Link> before generating posts.
        </p>
      )}

      {settings && !settings.enabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Social content is inactive. Turn it on using the switch above or enable it in Settings.
        </p>
      )}

      {!hasCredits && hasApiKey && isActive && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          You need at least {creditCostLabel} to generate a post.{' '}
          <Link to="/account/billing">Buy credits</Link>
        </p>
      )}

      <form className="service-social-compose-form" onSubmit={handleGenerate}>
        <div className="service-social-compose-grid">
          <label className="service-settings-field service-settings-field--full">
            <span>Topic or brief</span>
            <textarea
              className="account-settings-input"
              rows={4}
              value={topic}
              placeholder={exampleTopicBrief}
              onChange={(event) => setTopic(event.target.value)}
            />
            <span className="service-field-hint">
              Example: {exampleTopicBrief}
            </span>
          </label>

          <label className="service-settings-field">
            <span>Platform</span>
            <select
              className="account-settings-input"
              value={platform}
              onChange={(event) => setPlatform(event.target.value as SocialPlatform)}
            >
              {(Object.keys(platformLabels) as SocialPlatform[]).map((value) => (
                <option key={value} value={value}>
                  {platformLabels[value]}
                </option>
              ))}
            </select>
          </label>

          <div className="service-settings-field">
            <span>Platform notes</span>
            <p className="service-social-platform-note">{platformDescriptions[platform]}</p>
          </div>
        </div>

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
            <FontAwesomeIcon icon={generating ? faSpinner : faPenToSquare} spin={generating} aria-hidden="true" />
            {generating ? 'Generating...' : `Generate post (${creditCostLabel})`}
          </button>
        </div>
      </form>

      {generatedPost && (
        <SocialContentPostPreview post={generatedPost} onClose={() => setGeneratedPost(null)} />
      )}
    </div>
  )
}
