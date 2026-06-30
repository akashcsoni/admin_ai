import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ApiError,
  socialContentApi,
  type MetaPageOption,
  type SocialContentAddonsState,
  type SocialContentLivePublish,
  type SocialLivePublishPlatform,
} from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import { platformLabels } from './socialContent.types'

type SocialContentAddonsTabProps = {
  settingsEnabled: boolean
}

type PlatformInfo = {
  id: SocialLivePublishPlatform
  label: string
  description: string
  live: boolean
  oauth: boolean
}

const META_PLATFORMS: SocialLivePublishPlatform[] = ['facebook', 'instagram']

type PlatformSetupStep = {
  id: string
  label: string
  done: boolean
}

function getPlatformStatusLabel(input: {
  isWebhook: boolean
  connection: SocialContentLivePublish
  livePublishEnabled: boolean
}): { label: string; tone: 'muted' | 'warning' | 'success' | 'ready' } {
  const { isWebhook, connection, livePublishEnabled } = input

  if (isWebhook) {
    if (!connection.webhookUrl.trim()) {
      return { label: 'Not configured', tone: 'muted' }
    }
    if (!connection.enabled || !livePublishEnabled) {
      return { label: 'Configured', tone: 'warning' }
    }
    return { label: 'Ready to publish', tone: 'ready' }
  }

  if (!connection.isConnected) {
    return { label: 'Not connected', tone: 'muted' }
  }
  if (!connection.enabled || !livePublishEnabled) {
    return { label: 'Connected', tone: 'warning' }
  }
  if (connection.lastTestStatus === 'success') {
    return { label: 'Ready to publish', tone: 'ready' }
  }
  return { label: 'Connected — test recommended', tone: 'success' }
}

function getPlatformSetupSteps(input: {
  platformId: SocialLivePublishPlatform
  connection: SocialContentLivePublish
  livePublishEnabled: boolean
  metaPagesLoaded?: boolean
}): PlatformSetupStep[] {
  const { platformId, connection, livePublishEnabled, metaPagesLoaded } = input
  const isWebhook = platformId === 'custom_webhook'
  const isMeta = META_PLATFORMS.includes(platformId)

  if (isWebhook) {
    return [
      { id: 'url', label: 'Enter webhook URL', done: Boolean(connection.webhookUrl.trim()) },
      {
        id: 'enable',
        label: 'Turn on Enabled + master live publish',
        done: connection.enabled && livePublishEnabled,
      },
      { id: 'save', label: 'Click Save settings on this card', done: Boolean(connection.webhookUrl.trim()) },
      {
        id: 'test',
        label: 'Click Test connection to verify',
        done: connection.lastTestStatus === 'success',
      },
    ]
  }

  const oauthDone = connection.isConnected || (isMeta && Boolean(metaPagesLoaded))

  const steps: PlatformSetupStep[] = [
    {
      id: 'connect',
      label: isMeta ? 'Connect with Meta OAuth' : `Connect ${platformLabels[platformId]}`,
      done: oauthDone,
    },
  ]

  if (isMeta && !connection.isConnected) {
    steps.push({
      id: 'page',
      label: 'Select your Facebook Page',
      done: connection.isConnected,
    })
  }

  steps.push(
    { id: 'enable', label: 'Turn on Enabled for this platform', done: connection.enabled },
    { id: 'master', label: 'Turn on master Auto publish switch', done: livePublishEnabled },
    {
      id: 'save',
      label: 'Click Save settings after changing Enabled',
      done: connection.enabled && connection.isConnected,
    },
    {
      id: 'test',
      label: 'Click Test connection to verify',
      done: connection.lastTestStatus === 'success',
    },
  )

  return steps
}

export default function SocialContentAddonsTab({ settingsEnabled }: SocialContentAddonsTabProps) {
  const { token } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [addons, setAddons] = useState<SocialContentAddonsState | null>(null)
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([])
  const [metaPagesByPlatform, setMetaPagesByPlatform] = useState<
    Partial<Record<'facebook' | 'instagram', MetaPageOption[]>>
  >({})
  const [selectedMetaPageId, setSelectedMetaPageId] = useState<
    Partial<Record<'facebook' | 'instagram', string>>
  >({})
  const [webhookSecrets, setWebhookSecrets] = useState<Partial<Record<SocialLivePublishPlatform, string>>>(
    {},
  )
  const [activeMetaPlatform, setActiveMetaPlatform] = useState<'facebook' | 'instagram' | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingPlatform, setSavingPlatform] = useState<SocialLivePublishPlatform | null>(null)
  const [testingPlatform, setTestingPlatform] = useState<SocialLivePublishPlatform | null>(null)
  const [connectingPlatform, setConnectingPlatform] = useState<SocialLivePublishPlatform | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const connectionsByPlatform = useMemo(() => {
    const map = new Map<SocialLivePublishPlatform, SocialContentLivePublish>()
    for (const connection of addons?.connections ?? []) {
      map.set(connection.platform, connection)
    }
    return map
  }, [addons?.connections])

  const loadAddons = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await socialContentApi.getAddons(token)
      setAddons({
        livePublishEnabled: response.livePublishEnabled,
        connections: response.connections,
      })
      setPlatforms(response.platforms)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load add-ons')
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadMetaPages = useCallback(
    async (platform: 'facebook' | 'instagram') => {
      if (!token) return

      try {
        const response = await socialContentApi.listMetaPages(token, platform)
        setMetaPagesByPlatform((current) => ({ ...current, [platform]: response.pages }))
        const filtered = response.pages.filter((page) =>
          platform === 'instagram' ? Boolean(page.instagramBusinessAccountId) : true,
        )
        if (filtered[0]) {
          setSelectedMetaPageId((current) => ({
            ...current,
            [platform]: current[platform] || filtered[0].pageId,
          }))
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Unable to load Meta pages')
      }
    },
    [token],
  )

  useEffect(() => {
    void loadAddons()
  }, [loadAddons])

  useEffect(() => {
    const oauth = searchParams.get('oauth')
    const message = searchParams.get('message')
    const platform = searchParams.get('platform')

    if (oauth === 'success' && platform) {
      flashSuccess(`${platformLabels[platform as SocialLivePublishPlatform] ?? platform} connected`)
      setSearchParams({ tab: 'addons' }, { replace: true })
      void loadAddons()
    } else if (oauth === 'meta' && (platform === 'facebook' || platform === 'instagram')) {
      flashSuccess('Meta connected — select your Facebook Page below')
      setActiveMetaPlatform(platform)
      setSearchParams({ tab: 'addons' }, { replace: true })
      void loadAddons()
      void loadMetaPages(platform)
    } else if (oauth === 'error') {
      setError(message ? decodeURIComponent(message) : 'OAuth connection failed')
      setSearchParams({ tab: 'addons' }, { replace: true })
    }
  }, [searchParams, setSearchParams, loadAddons, loadMetaPages])

  function flashSuccess(message: string) {
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 3000)
  }

  function updateConnection(platform: SocialLivePublishPlatform, patch: Partial<SocialContentLivePublish>) {
    setAddons((current) => {
      if (!current) return current
      return {
        ...current,
        connections: current.connections.map((connection) =>
          connection.platform === platform ? { ...connection, ...patch } : connection,
        ),
      }
    })
  }

  async function saveMasterToggle(enabled: boolean) {
    if (!token) return

    setSavingPlatform('custom_webhook')
    setError('')

    try {
      const response = await socialContentApi.saveAddons(token, {
        platform: 'custom_webhook',
        livePublishEnabled: enabled,
      })
      setAddons({
        livePublishEnabled: response.livePublishEnabled,
        connections: response.connections,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save live publish setting')
    } finally {
      setSavingPlatform(null)
    }
  }

  async function savePlatform(platform: SocialLivePublishPlatform) {
    if (!token) return

    const connection = connectionsByPlatform.get(platform)
    if (!connection) return

    setSavingPlatform(platform)
    setError('')

    try {
      const response = await socialContentApi.saveAddons(token, {
        platform,
        enabled: connection.enabled,
        webhookUrl: connection.webhookUrl,
        webhookSecret: webhookSecrets[platform]?.trim() || undefined,
      })
      setAddons({
        livePublishEnabled: response.livePublishEnabled,
        connections: response.connections,
      })
      setWebhookSecrets((current) => ({ ...current, [platform]: '' }))
      flashSuccess(`${platformLabels[platform]} settings saved`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save platform settings')
    } finally {
      setSavingPlatform(null)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token || !addons) return

    setSavingPlatform('custom_webhook')
    setError('')

    try {
      await socialContentApi.saveAddons(token, {
        platform: 'custom_webhook',
        livePublishEnabled: addons.livePublishEnabled,
      })

      for (const connection of addons.connections) {
        await socialContentApi.saveAddons(token, {
          platform: connection.platform,
          enabled: connection.enabled,
          webhookUrl: connection.webhookUrl,
          webhookSecret: webhookSecrets[connection.platform]?.trim() || undefined,
        })
      }

      await loadAddons()
      setWebhookSecrets({})
      flashSuccess('All add-on settings saved')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save add-ons')
    } finally {
      setSavingPlatform(null)
    }
  }

  async function handleConnectOAuth(platform: SocialLivePublishPlatform) {
    if (!token || platform === 'custom_webhook') return

    setConnectingPlatform(platform)
    setError('')

    try {
      const response = await socialContentApi.startOAuth(token, platform)
      window.location.href = response.authorizeUrl
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to start OAuth connection')
      setConnectingPlatform(null)
    }
  }

  async function handleDisconnect(platform: SocialLivePublishPlatform) {
    if (!token || platform === 'custom_webhook') return

    setConnectingPlatform(platform)
    setError('')

    try {
      const response = await socialContentApi.disconnectAddons(token, platform)
      setAddons({
        livePublishEnabled: response.livePublishEnabled,
        connections: response.connections,
      })
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to disconnect account')
    } finally {
      setConnectingPlatform(null)
    }
  }

  async function handleSelectMetaPage(platform: 'facebook' | 'instagram') {
    if (!token) return

    const pageId = selectedMetaPageId[platform]
    if (!pageId) return

    setSavingPlatform(platform)
    setError('')

    try {
      const response = await socialContentApi.selectMetaPage(token, { pageId, platform })
      setAddons({
        livePublishEnabled: response.livePublishEnabled,
        connections: response.connections,
      })
      setActiveMetaPlatform(null)
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to connect Meta page')
    } finally {
      setSavingPlatform(null)
    }
  }

  async function handleTestConnection(platform: SocialLivePublishPlatform) {
    if (!token) return

    setTestingPlatform(platform)
    setError('')

    try {
      await savePlatform(platform)
      const response = await socialContentApi.testAddonsConnection(token, platform)
      setAddons({
        livePublishEnabled: response.livePublishEnabled,
        connections: response.connections,
      })
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connection test failed')
      await loadAddons()
    } finally {
      setTestingPlatform(null)
    }
  }

  if (loading) {
    return (
      <div className="service-tab-panel">
        <p className="service-logs-loading">Loading add-ons...</p>
      </div>
    )
  }

  if (!addons) {
    return (
      <div className="service-tab-panel">
        <p className="service-workspace-alert service-workspace-alert--warning">
          Unable to load add-on settings.
        </p>
      </div>
    )
  }

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Add-ons</h2>
          <p>
            Connect multiple social accounts at once. Each generated post auto-publishes to the
            matching platform when that connection is enabled.
          </p>
        </div>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}
      {success && <p className="service-workspace-alert service-workspace-alert--success">{success}</p>}

      {!settingsEnabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Turn on Social Media Content in Settings before enabling live publishing.
        </p>
      )}

      <form
        className="service-workspace-form service-settings-form service-settings-form--wide"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <section className="service-settings-section service-settings-section--open">
          <div className="service-settings-section-body">
            <fieldset className="service-settings-field-group service-settings-field-group--toggle">
              <legend className="service-settings-field-group-title">Live publish</legend>
              <label className="service-toggle-row">
                <span className="service-toggle-label">
                  <strong>Auto publish to social media</strong>
                  <span className="service-field-hint">
                    Master switch for live publishing. Enable individual platforms below.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={addons.livePublishEnabled}
                  disabled={!settingsEnabled || savingPlatform === 'custom_webhook'}
                  onChange={(event) => void saveMasterToggle(event.target.checked)}
                />
              </label>
            </fieldset>

            <fieldset className="service-settings-field-group">
              <legend className="service-settings-field-group-title">Connected platforms</legend>

              <div className="service-social-addon-guide">
                <p className="service-social-addon-guide-title">How Connect and Save work</p>
                <ol className="service-social-addon-guide-steps">
                  <li>
                    <strong>Connect</strong> — signs in with OAuth and links your account (or enter
                    webhook URL). This does not turn on live publishing by itself.
                  </li>
                  <li>
                    <strong>Enabled</strong> — choose which platforms should auto-publish when a post
                    is generated.
                  </li>
                  <li>
                    <strong>Save</strong> — stores your Enabled toggle and webhook settings. Always
                    click Save after changing Enabled or webhook fields.
                  </li>
                  <li>
                    <strong>Test</strong> — checks the connection works before you generate content.
                  </li>
                </ol>
              </div>

              <div className="service-social-addon-list">
                {platforms.map((platformInfo) => {
                  const connection = connectionsByPlatform.get(platformInfo.id)
                  if (!connection) return null

                  const isWebhook = platformInfo.id === 'custom_webhook'
                  const isMeta = META_PLATFORMS.includes(platformInfo.id)
                  const needsMetaPage =
                    isMeta &&
                    activeMetaPlatform === platformInfo.id &&
                    !connection.isConnected
                  const metaPages = isMeta
                    ? metaPagesByPlatform[platformInfo.id as 'facebook' | 'instagram'] ?? []
                    : []
                  const status = getPlatformStatusLabel({
                    isWebhook,
                    connection,
                    livePublishEnabled: addons.livePublishEnabled,
                  })
                  const setupSteps = getPlatformSetupSteps({
                    platformId: platformInfo.id,
                    connection,
                    livePublishEnabled: addons.livePublishEnabled,
                    metaPagesLoaded: Boolean(
                      metaPagesByPlatform[platformInfo.id as 'facebook' | 'instagram']?.length,
                    ),
                  })

                  return (
                    <article key={platformInfo.id} className="service-social-addon-card">
                      <div className="service-social-addon-card-head">
                        <div>
                          <div className="service-social-addon-card-title-row">
                            <h3>{platformInfo.label}</h3>
                            <span
                              className={`service-social-addon-status service-social-addon-status--${status.tone}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="service-field-hint">{platformInfo.description}</p>
                        </div>
                        <label className="service-toggle-row service-toggle-row--compact">
                          <span>Enabled</span>
                          <input
                            type="checkbox"
                            checked={connection.enabled}
                            disabled={!settingsEnabled}
                            onChange={(event) =>
                              updateConnection(platformInfo.id, { enabled: event.target.checked })
                            }
                          />
                        </label>
                      </div>

                      <ul className="service-social-addon-checklist" aria-label={`${platformInfo.label} setup steps`}>
                        {setupSteps.map((step) => (
                          <li
                            key={step.id}
                            className={`service-social-addon-checklist-item${
                              step.done ? ' service-social-addon-checklist-item--done' : ''
                            }`}
                          >
                            <span className="service-social-addon-checklist-marker" aria-hidden="true">
                              {step.done ? '✓' : '○'}
                            </span>
                            {step.label}
                          </li>
                        ))}
                      </ul>

                      {!isWebhook && (
                        <div className="service-social-addon-action-block">
                          <p className="service-social-addon-action-label">1. Connect account</p>
                          <div className="service-addon-connection-status">
                            {connection.isConnected ? (
                              <>
                                <p>
                                  Signed in as{' '}
                                  <strong>{connection.accountName || connection.accountId}</strong>
                                </p>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  disabled={connectingPlatform === platformInfo.id}
                                  onClick={() => void handleDisconnect(platformInfo.id)}
                                >
                                  Disconnect
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={
                                  connectingPlatform === platformInfo.id || !settingsEnabled
                                }
                                onClick={() => void handleConnectOAuth(platformInfo.id)}
                              >
                                {connectingPlatform === platformInfo.id
                                  ? 'Redirecting to sign in...'
                                  : `Connect ${platformInfo.label}`}
                              </button>
                            )}
                          </div>
                          <p className="service-field-hint">
                            Opens OAuth sign-in. You return here when authorization finishes.
                          </p>
                        </div>
                      )}

                      {isMeta && !connection.isConnected && (
                        <div className="service-social-addon-action-block">
                          <p className="service-social-addon-action-label">2. Choose Facebook Page</p>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setActiveMetaPlatform(platformInfo.id as 'facebook' | 'instagram')
                              void loadMetaPages(platformInfo.id as 'facebook' | 'instagram')
                            }}
                          >
                            Load Facebook Pages
                          </button>
                          <p className="service-field-hint">
                            Required after Meta OAuth. Pick the Page that owns your{' '}
                            {platformInfo.id === 'instagram' ? 'Instagram Business' : 'Facebook'} account.
                          </p>
                        </div>
                      )}

                      {isMeta &&
                        (needsMetaPage || activeMetaPlatform === platformInfo.id) &&
                        metaPages.length > 0 && (
                          <div className="service-social-addon-meta-page">
                            <label>
                              <span>Select Facebook Page</span>
                              <select
                                value={
                                  selectedMetaPageId[platformInfo.id as 'facebook' | 'instagram'] ??
                                  ''
                                }
                                onChange={(event) =>
                                  setSelectedMetaPageId((current) => ({
                                    ...current,
                                    [platformInfo.id as 'facebook' | 'instagram']: event.target.value,
                                  }))
                                }
                              >
                                {metaPages
                                  .filter((page) =>
                                    platformInfo.id === 'instagram'
                                      ? Boolean(page.instagramBusinessAccountId)
                                      : true,
                                  )
                                  .map((page) => (
                                    <option key={page.pageId} value={page.pageId}>
                                      {page.pageName}
                                      {page.instagramBusinessAccountId ? ' · Instagram linked' : ''}
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={savingPlatform === platformInfo.id}
                              onClick={() =>
                                void handleSelectMetaPage(platformInfo.id as 'facebook' | 'instagram')
                              }
                            >
                              Connect selected page
                            </button>
                          </div>
                        )}

                      {isWebhook && (
                        <div className="service-social-addon-action-block">
                          <p className="service-social-addon-action-label">1. Webhook endpoint</p>
                          <label>
                            <span>Webhook URL</span>
                            <input
                              type="url"
                              value={connection.webhookUrl}
                              placeholder="https://your-app.com/api/social-publish"
                              onChange={(event) =>
                                updateConnection(platformInfo.id, { webhookUrl: event.target.value })
                              }
                            />
                          </label>
                          <label>
                            <span>Webhook secret (optional)</span>
                            <input
                              type="password"
                              value={webhookSecrets[platformInfo.id] ?? ''}
                              placeholder={
                                connection.hasWebhookSecret
                                  ? 'Saved — enter new value to replace'
                                  : 'Optional secret'
                              }
                              onChange={(event) =>
                                setWebhookSecrets((current) => ({
                                  ...current,
                                  [platformInfo.id]: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <p className="service-field-hint">
                            Fallback when no OAuth connection exists for a post&apos;s platform. Click
                            Save after editing URL or secret.
                          </p>
                        </div>
                      )}

                      <div className="service-social-addon-action-block">
                        <p className="service-social-addon-action-label">
                          {isWebhook ? '2. Save & test' : isMeta ? '3. Save & test' : '2. Save & test'}
                        </p>
                        <div className="service-social-addon-card-actions">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={savingPlatform === platformInfo.id}
                            onClick={() => void savePlatform(platformInfo.id)}
                          >
                            {savingPlatform === platformInfo.id ? 'Saving...' : 'Save settings'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={testingPlatform === platformInfo.id}
                            onClick={() => void handleTestConnection(platformInfo.id)}
                          >
                            {testingPlatform === platformInfo.id ? 'Testing...' : 'Test connection'}
                          </button>
                        </div>
                        <p className="service-field-hint">
                          <strong>Save settings</strong> stores Enabled and webhook changes.{' '}
                          <strong>Test connection</strong> saves first, then verifies publish access.
                        </p>
                        {connection.lastTestedAt && (
                          <p
                            className={`service-field-hint${
                              connection.lastTestStatus === 'success'
                                ? ' service-field-hint--success'
                                : ' service-field-hint--warning'
                            }`}
                          >
                            Last test: {connection.lastTestMessage}
                          </p>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </fieldset>

            <div className="service-settings-actions">
              <button type="submit" className="btn btn-primary" disabled={Boolean(savingPlatform)}>
                Save all add-ons
              </button>
              <p className="service-field-hint service-social-addon-save-all-hint">
                Saves Enabled toggles and webhook settings for every platform at once.
              </p>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
