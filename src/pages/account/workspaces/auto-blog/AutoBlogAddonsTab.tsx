import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, autoBlogApi } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import type { AutoBlogLivePublish, AutoBlogLivePublishPlatform } from './autoBlog.types'
import WordPressRestApiGuide from './WordPressRestApiGuide'
import WebhookPayloadGuide from './WebhookPayloadGuide'

type AutoBlogAddonsTabProps = {
  settingsEnabled: boolean
}

export default function AutoBlogAddonsTab({ settingsEnabled }: AutoBlogAddonsTabProps) {
  const { token } = useAuth()
  const [addons, setAddons] = useState<AutoBlogLivePublish | null>(null)
  const [platforms, setPlatforms] = useState<
    Array<{ id: AutoBlogLivePublishPlatform; label: string; description: string; live: boolean }>
  >([])
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadAddons() {
      if (!token) return

      setLoading(true)
      setError('')

      try {
        const response = await autoBlogApi.getAddons(token)
        setAddons(response.addons)
        setPlatforms(response.platforms)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Unable to load add-ons')
      } finally {
        setLoading(false)
      }
    }

    void loadAddons()
  }, [token])

  function flashSuccess(message: string) {
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 2500)
  }

  function buildSavePayload() {
    if (!addons) return null

    return {
      enabled: addons.enabled,
      platform: addons.platform,
      siteUrl: addons.siteUrl,
      username: addons.username,
      apiKey:
        apiKey.trim() === ''
          ? undefined
          : addons.platform === 'wordpress'
            ? apiKey.trim().replace(/\s+/g, '')
            : apiKey.trim(),
      webhookUrl: addons.webhookUrl,
      remoteStatus: addons.remoteStatus,
      remoteCategoryId: addons.remoteCategoryId,
    }
  }

  async function persistAddons() {
    if (!token || !addons) {
      throw new Error('Unable to save add-ons')
    }

    const payload = buildSavePayload()
    if (!payload) {
      throw new Error('Unable to save add-ons')
    }

    const response = await autoBlogApi.saveAddons(token, payload)
    setAddons(response.addons)
    setApiKey('')
    return response.addons
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token || !addons) return

    setSaving(true)
    setError('')

    try {
      await persistAddons()
      flashSuccess('Add-on settings saved successfully')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save add-ons')
    } finally {
      setSaving(false)
    }
  }

  async function handleTestConnection() {
    if (!token || !addons) return

    setTesting(true)
    setError('')

    try {
      const saved = await persistAddons()

      if (
        (saved.platform === 'wordpress' ||
          saved.platform === 'ghost' ||
          saved.platform === 'webflow' ||
          saved.platform === 'shopify') &&
        !saved.hasApiKey
      ) {
        throw new Error('Enter and save your API credentials before testing the connection.')
      }

      if ((saved.platform === 'custom_webhook' || saved.platform === 'nextjs') && !saved.webhookUrl.trim()) {
        throw new Error('Enter your API route / webhook URL before testing.')
      }

      if (saved.platform === 'webflow' && !saved.remoteCategoryId.trim()) {
        throw new Error('Enter your Webflow CMS collection ID before testing.')
      }

      if (saved.platform === 'shopify' && !saved.siteUrl.trim()) {
        throw new Error('Enter your Shopify shop domain before testing.')
      }

      if (saved.platform === 'shopify' && !saved.username.trim()) {
        throw new Error('Enter your Shopify Client ID before testing.')
      }

      if (saved.platform === 'shopify' && !saved.hasApiKey) {
        throw new Error('Enter your Shopify Client secret before testing.')
      }

      const response = await autoBlogApi.testAddonsConnection(token)
      setAddons(response.addons)
      flashSuccess(response.message)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Connection test failed')
      }

      if (token) {
        try {
          const response = await autoBlogApi.getAddons(token)
          setAddons(response.addons)
        } catch {
          // Keep existing form state if refresh fails.
        }
      }
    } finally {
      setTesting(false)
    }
  }

  const selectedPlatform = platforms.find((platform) => platform.id === addons?.platform)
  const isWebhook = addons?.platform === 'custom_webhook'
  const isNextJs = addons?.platform === 'nextjs'
  const isHeadlessWebhook = isWebhook || isNextJs
  const isWordPress = addons?.platform === 'wordpress'
  const isWebflow = addons?.platform === 'webflow'
  const isShopify = addons?.platform === 'shopify'
  const showSiteUrl = !isHeadlessWebhook
  const showApiKey = !isHeadlessWebhook || isNextJs || isWebhook

  const showLastConnectionTest =
    Boolean(addons?.lastTestedAt) &&
    (isWordPress || !/wordpress/i.test(addons?.lastTestMessage ?? ''))

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
            Connect your website framework and auto-publish generated blogs live when a post is
            created.
          </p>
        </div>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}
      {success && <p className="service-workspace-alert service-workspace-alert--success">{success}</p>}

      {!settingsEnabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Turn on Auto blog in Settings before enabling live publishing.
        </p>
      )}

      <form className="service-workspace-form service-settings-form service-settings-form--wide" onSubmit={(event) => void handleSubmit(event)}>
        <section className="service-settings-section service-settings-section--open">
          <div className="service-settings-section-body">
            <fieldset className="service-settings-field-group service-settings-field-group--toggle">
              <legend className="service-settings-field-group-title">Live publish</legend>
              <label className="service-toggle-row">
                <span className="service-toggle-label">
                  <strong>Auto publish to website</strong>
                  <span className="service-field-hint">
                    When enabled, each successfully generated blog is sent to your connected site.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={addons.enabled}
                  disabled={!settingsEnabled}
                  onChange={(event) =>
                    setAddons((current) =>
                      current ? { ...current, enabled: event.target.checked } : current,
                    )
                  }
                />
              </label>
            </fieldset>

            <fieldset className="service-settings-field-group">
              <legend className="service-settings-field-group-title">Website platform</legend>
              <div className="service-addon-platform-grid">
                {platforms.map((platform) => {
                  const isSelected = addons.platform === platform.id

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      className={`service-addon-platform-card${isSelected ? ' service-addon-platform-card--active' : ''}`}
                      onClick={() =>
                        setAddons((current) => {
                          if (!current) return current
                          if (current.platform === platform.id) return current

                          return {
                            ...current,
                            platform: platform.id,
                            lastTestedAt: null,
                            lastTestStatus: null,
                            lastTestMessage: '',
                          }
                        })
                      }
                    >
                      <span className="service-addon-platform-card-title">{platform.label}</span>
                      <span className="service-addon-platform-card-copy">{platform.description}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {selectedPlatform?.live && (
              <fieldset className="service-settings-field-group service-settings-field-group--connection">
                <legend className="service-settings-field-group-title">Connection</legend>

                {isWordPress && <WordPressRestApiGuide siteUrl={addons.siteUrl} />}

                {isHeadlessWebhook && (
                  <WebhookPayloadGuide platform={isNextJs ? 'nextjs' : 'custom_webhook'} />
                )}

                {showSiteUrl && (
                  <label>
                    <span>
                      {isShopify
                        ? 'Shop domain'
                        : isWebflow
                          ? 'Public site URL (optional)'
                          : 'Site URL'}
                    </span>
                    <input
                      type={isShopify ? 'text' : 'url'}
                      value={addons.siteUrl}
                      placeholder={
                        isShopify
                          ? 'mystore.myshopify.com'
                          : isWebflow
                            ? 'https://yourwebsite.com'
                            : 'https://yourwebsite.com'
                      }
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, siteUrl: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      {isWordPress
                        ? 'WordPress site root only — no /wp-admin or trailing path.'
                        : isShopify
                          ? 'Your myshopify.com domain. App must be installed on this store.'
                          : isWebflow
                            ? 'Used to build public post links after publish. REST API uses Webflow directly.'
                            : 'Your live website address — Ghost root URL.'}
                    </span>
                  </label>
                )}

                {isNextJs && (
                  <label>
                    <span>Public site URL (optional)</span>
                    <input
                      type="url"
                      value={addons.siteUrl}
                      placeholder="https://yourwebsite.com"
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, siteUrl: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      Frontend base URL for fallback links when your API route does not return one.
                    </span>
                  </label>
                )}

                {isHeadlessWebhook && (
                  <label>
                    <span>{isNextJs ? 'Next.js API route URL' : 'Webhook URL'}</span>
                    <input
                      type="url"
                      value={addons.webhookUrl}
                      placeholder={
                        isNextJs
                          ? 'https://yourwebsite.com/api/content-ai/publish'
                          : 'https://yourwebsite.com/api/content-ai/webhook'
                      }
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, webhookUrl: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      {isNextJs
                        ? 'Your Route Handler receives JSON with title, HTML, slug, SEO fields, and platform: nextjs.'
                        : 'Your endpoint receives JSON with title, HTML content, SEO fields, and slug.'}
                    </span>
                  </label>
                )}

                {isWordPress && (
                  <label>
                    <span>WordPress username</span>
                    <input
                      type="text"
                      value={addons.username}
                      autoComplete="username"
                      placeholder="editor or admin username"
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, username: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      Login name of the WordPress user who will publish posts (Editor or Administrator).
                    </span>
                  </label>
                )}

                {isWebflow && (
                  <label>
                    <span>CMS collection ID</span>
                    <input
                      type="text"
                      value={addons.remoteCategoryId}
                      placeholder="e.g. 64abc123def456..."
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, remoteCategoryId: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      From Webflow → Site settings → CMS → your blog collection → Collection ID.
                    </span>
                  </label>
                )}

                {isWebflow && (
                  <label>
                    <span>Body field slug</span>
                    <input
                      type="text"
                      value={addons.username}
                      placeholder="post-body"
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, username: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      Rich text field slug in your Webflow CMS collection. Default: <code>post-body</code>.
                    </span>
                  </label>
                )}

                {isShopify && (
                  <label>
                    <span>Client ID</span>
                    <input
                      type="text"
                      value={addons.username}
                      placeholder="From Shopify Dev Dashboard → your app"
                      autoComplete="off"
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, username: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      App Client ID from Shopify Dev Dashboard. Used with Client secret to fetch an
                      access token automatically.
                    </span>
                  </label>
                )}

                {isShopify && (
                  <label>
                    <span>Blog ID (optional)</span>
                    <input
                      type="text"
                      value={addons.remoteCategoryId}
                      className="service-settings-input-narrow"
                      placeholder="Auto-detect first blog"
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, remoteCategoryId: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      Leave empty to publish to your store&apos;s first blog.
                    </span>
                  </label>
                )}

                {showApiKey && (
                  <label>
                    <span>
                      {isWebhook || isNextJs
                        ? 'API secret (optional)'
                        : isWordPress
                          ? 'Application password'
                          : isWebflow
                            ? 'Webflow API token'
                            : isShopify
                              ? 'Client secret'
                              : 'Admin API key'}
                    </span>
                    <input
                      type="password"
                      value={apiKey}
                      placeholder={addons.hasApiKey ? 'Saved — enter new value to replace' : 'Enter API key or password'}
                      autoComplete="new-password"
                      onChange={(event) => setApiKey(event.target.value)}
                    />
                    <span className="service-field-hint">
                      {isWordPress
                        ? 'WordPress → Users → Profile → Application Passwords.'
                        : isWebflow
                          ? 'Webflow → Site settings → Apps & integrations → Generate API token (cms:write).'
                          : isShopify
                            ? 'Shopify Dev Dashboard → your app → Client secret. Content AI exchanges this with Client ID for a 24-hour Admin API token.'
                            : isNextJs || isWebhook
                              ? 'Sent as X-Content-AI-Secret header when provided.'
                              : 'Ghost Admin API key in id:secret format from Settings → Integrations.'}
                    </span>
                  </label>
                )}

                {isWordPress && (
                  <label>
                    <span>WordPress category ID (optional)</span>
                    <input
                      type="text"
                      value={addons.remoteCategoryId}
                      className="service-settings-input-narrow"
                      placeholder="e.g. 12"
                      onChange={(event) =>
                        setAddons((current) =>
                          current ? { ...current, remoteCategoryId: event.target.value } : current,
                        )
                      }
                    />
                    <span className="service-field-hint">
                      Numeric category ID from your site&apos;s{' '}
                      <code>/wp-json/wp/v2/categories</code> endpoint.
                    </span>
                  </label>
                )}

                <label>
                  <span>Publish on remote site as</span>
                  <select
                    value={addons.remoteStatus}
                    onChange={(event) =>
                      setAddons((current) =>
                        current
                          ? {
                              ...current,
                              remoteStatus: event.target.value as AutoBlogLivePublish['remoteStatus'],
                            }
                          : current,
                      )
                    }
                  >
                    <option value="publish">Published (live)</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>

                {showLastConnectionTest && (
                  <p
                    className={`service-workspace-alert ${
                      addons.lastTestStatus === 'success'
                        ? 'service-workspace-alert--success'
                        : 'service-workspace-alert--warning'
                    }`}
                  >
                    Last connection test: {addons.lastTestMessage}
                  </p>
                )}

                {isWordPress && addons.lastTestStatus === 'failed' && showLastConnectionTest && (
                  <p className="service-field-hint">
                    Open the setup guide above for application password steps and LiteSpeed or Cloudflare
                    Authorization header fixes.
                  </p>
                )}

                <div className="service-settings-actions service-settings-actions--inline">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={testing || saving}
                    onClick={() => void handleTestConnection()}
                  >
                    {testing ? 'Testing...' : 'Test connection'}
                  </button>
                  {isWordPress && (
                    <span className="service-field-hint service-setup-guide-test-note">
                      Test saves your settings first, then checks login via the REST API.
                    </span>
                  )}
                  {!isWordPress && (
                    <span className="service-field-hint service-setup-guide-test-note">
                      Test saves your settings first, then verifies the connection.
                    </span>
                  )}
                </div>
              </fieldset>
            )}
          </div>
        </section>

        <div className="service-settings-actions service-settings-actions--footer">
          <button type="submit" className="btn btn-primary" disabled={saving || !settingsEnabled}>
            {saving ? 'Saving...' : 'Save add-ons'}
          </button>
        </div>
      </form>
    </div>
  )
}
