import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, socialContentApi } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import {
  DEFAULT_BRAND_VOICE,
  DEFAULT_TOPIC_BRIEF,
  platformLabels,
  postImageProviderLabels,
  postImageProviderModels,
  providerModels,
  toneLabels,
  type SocialContentSettings,
  type SocialPlatform,
} from './socialContent.types'

type SocialContentSettingsTabProps = {
  onSettingsSaved: (settings: SocialContentSettings) => void
}

export default function SocialContentSettingsTab({ onSettingsSaved }: SocialContentSettingsTabProps) {
  const { token } = useAuth()
  const [settings, setSettings] = useState<SocialContentSettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [postImageApiKey, setPostImageApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      if (!token) return

      setLoading(true)
      setError('')

      try {
        const response = await socialContentApi.getSettings(token)
        setSettings(response.settings)
        onSettingsSaved(response.settings)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Unable to load settings')
      } finally {
        setLoading(false)
      }
    }

    void loadSettings()
  }, [token, onSettingsSaved])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!token || !settings) return

    setSaving(true)
    setError('')

    try {
      const response = await socialContentApi.saveSettings(token, {
        enabled: settings.enabled,
        aiProvider: settings.ai_provider,
        aiModel: settings.ai_model,
        apiKey: apiKey.trim() || undefined,
        brandVoice: settings.brand_voice,
        defaultTopicBrief: settings.default_topic_brief,
        contentLanguage: settings.content_language,
        contentTone: settings.content_tone,
        defaultPlatform: settings.default_platform,
        generationTemperature: settings.generation_temperature,
        generationMaxTokens: settings.generation_max_tokens,
        includeHashtags: settings.include_hashtags,
        includeHook: settings.include_hook,
        postImageEnabled: settings.post_image_enabled,
        postImageAiProvider: settings.post_image_ai_provider,
        postImageAiModel: settings.post_image_ai_model,
        postImageApiKey: postImageApiKey.trim() || undefined,
      })
      setSettings(response.settings)
      onSettingsSaved(response.settings)
      setApiKey('')
      setPostImageApiKey('')
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!token) return

    setSaving(true)
    setError('')

    try {
      const response = await socialContentApi.saveSettings(token, {
        clearApiKey: true,
        clearPostImageApiKey: true,
        enabled: true,
        aiProvider: 'openai',
        aiModel: 'gpt-4o',
        brandVoice: DEFAULT_BRAND_VOICE,
        defaultTopicBrief: DEFAULT_TOPIC_BRIEF,
        contentLanguage: 'en',
        contentTone: 'professional',
        defaultPlatform: 'linkedin',
        generationTemperature: 0.7,
        generationMaxTokens: 2000,
        includeHashtags: true,
        includeHook: true,
        postImageEnabled: false,
        postImageAiProvider: 'openai',
        postImageAiModel: 'dall-e-3',
      })

      setSettings(response.settings)
      onSettingsSaved(response.settings)
      setApiKey('')
      setPostImageApiKey('')
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to reset settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="service-tab-panel">
        <p className="service-empty-state-hint">Loading settings...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="service-tab-panel">
        <p className="service-workspace-alert service-workspace-alert--warning">
          {error || 'Unable to load settings.'}
        </p>
      </div>
    )
  }

  const models = providerModels[settings.ai_provider] ?? []
  const postImageModels =
    postImageProviderModels[settings.post_image_ai_provider] ?? []
  const topicBriefPreview = settings.default_topic_brief.trim()
    ? `${settings.default_topic_brief.trim().slice(0, 48)}${settings.default_topic_brief.length > 48 ? '…' : ''}`
    : DEFAULT_TOPIC_BRIEF.slice(0, 48)

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Settings</h2>
          <p>
            Saved to your account — configure AI connection, generation, content style, and post images.
          </p>
        </div>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}

      <form
        className="service-workspace-form service-settings-form service-settings-form--wide"
        onSubmit={handleSubmit}
      >
        <div className="service-settings-accordion">
          <details className="service-settings-section" open>
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">AI connection</span>
                <span className="service-settings-section-meta">
                  {settings.enabled ? settings.ai_provider : 'Disabled'} · {settings.ai_model}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body service-settings-section-body--connection">
              <div className="service-settings-field-group service-settings-field-group--toggle">
                <label className="service-toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(event) =>
                      setSettings((current) => current && { ...current, enabled: event.target.checked })
                    }
                  />
                  <span className="service-toggle-label">
                    Enable social media content generation for this account
                  </span>
                </label>
              </div>

              <fieldset className="service-settings-field-group" disabled={!settings.enabled}>
                <div className="service-settings-grid">
                  <label htmlFor="social-provider">
                    Provider
                    <select
                      id="social-provider"
                      value={settings.ai_provider}
                      onChange={(event) => {
                        const provider = event.target.value as SocialContentSettings['ai_provider']
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                ai_provider: provider,
                                ai_model: providerModels[provider][0],
                              }
                            : current,
                        )
                      }}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                      <option value="deepseek">DeepSeek</option>
                    </select>
                  </label>

                  <label htmlFor="social-model">
                    Model
                    <select
                      id="social-model"
                      value={settings.ai_model}
                      onChange={(event) =>
                        setSettings((current) =>
                          current ? { ...current, ai_model: event.target.value } : current,
                        )
                      }
                    >
                      {models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label htmlFor="social-settings-api-key">
                  API key
                  <input
                    id="social-settings-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder={settings.hasApiKey ? 'Saved — enter a new key to replace' : 'Your AI provider API key'}
                    autoComplete="off"
                  />
                  <span className="service-field-hint">
                    Stored securely in your account settings. Leave blank to keep the current key.
                  </span>
                </label>
              </fieldset>
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Generation</span>
                <span className="service-settings-section-meta">
                  temp {settings.generation_temperature} · {settings.generation_max_tokens} tokens
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <div className="service-settings-grid">
                  <label className="service-settings-grid-span-2" htmlFor="social-temperature">
                    Temperature ({settings.generation_temperature})
                    <input
                      id="social-temperature"
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.generation_temperature}
                      onChange={(event) =>
                        setSettings((current) =>
                          current && { ...current, generation_temperature: Number(event.target.value) },
                        )
                      }
                    />
                  </label>

                  <label htmlFor="social-max-tokens">
                    Max tokens
                    <input
                      id="social-max-tokens"
                      type="number"
                      min="300"
                      max="8000"
                      value={settings.generation_max_tokens}
                      onChange={(event) =>
                        setSettings((current) =>
                          current && { ...current, generation_max_tokens: Number(event.target.value) },
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Content & brand</span>
                <span className="service-settings-section-meta">
                  {platformLabels[settings.default_platform]} · {toneLabels[settings.content_tone]} ·{' '}
                  {settings.content_language}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <div className="service-settings-grid">
                  <label htmlFor="social-default-platform">
                    Default platform
                    <select
                      id="social-default-platform"
                      value={settings.default_platform}
                      onChange={(event) =>
                        setSettings((current) =>
                          current
                            ? { ...current, default_platform: event.target.value as SocialPlatform }
                            : current,
                        )
                      }
                    >
                      {(Object.keys(platformLabels) as SocialPlatform[]).map((platform) => (
                        <option key={platform} value={platform}>
                          {platformLabels[platform]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label htmlFor="social-content-tone">
                    Tone
                    <select
                      id="social-content-tone"
                      value={settings.content_tone}
                      onChange={(event) =>
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                content_tone: event.target.value as SocialContentSettings['content_tone'],
                              }
                            : current,
                        )
                      }
                    >
                      {(Object.keys(toneLabels) as SocialContentSettings['content_tone'][]).map((tone) => (
                        <option key={tone} value={tone}>
                          {toneLabels[tone]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="service-settings-input-narrow" htmlFor="social-content-language">
                  Content language
                  <input
                    id="social-content-language"
                    type="text"
                    value={settings.content_language}
                    onChange={(event) =>
                      setSettings((current) =>
                        current ? { ...current, content_language: event.target.value } : current,
                      )
                    }
                    placeholder="en"
                  />
                </label>
              </div>

              <div className="service-settings-field-group">
                <label htmlFor="social-brand-voice">
                  Brand voice & niche
                  <textarea
                    id="social-brand-voice"
                    rows={5}
                    value={settings.brand_voice}
                    onChange={(event) =>
                      setSettings((current) =>
                        current ? { ...current, brand_voice: event.target.value } : current,
                      )
                    }
                    placeholder={DEFAULT_BRAND_VOICE}
                  />
                  <span className="service-field-hint">
                    Guides post tone and AI topic generation. Pair with categories on the Categories tab
                    for organized topic queues.
                  </span>
                </label>

                <div className="service-settings-actions service-settings-actions--inline">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setSettings((current) =>
                        current ? { ...current, brand_voice: DEFAULT_BRAND_VOICE } : current,
                      )
                    }
                  >
                    Restore default brand voice
                  </button>
                </div>
              </div>
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Topics & examples</span>
                <span className="service-settings-section-meta">{topicBriefPreview}</span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <label htmlFor="social-default-topic-brief">
                  Default topic or brief
                  <textarea
                    id="social-default-topic-brief"
                    rows={3}
                    value={settings.default_topic_brief}
                    onChange={(event) =>
                      setSettings((current) =>
                        current ? { ...current, default_topic_brief: event.target.value } : current,
                      )
                    }
                    placeholder={DEFAULT_TOPIC_BRIEF}
                  />
                  <span className="service-field-hint">
                    Shown as the example in Compose and when adding topics manually. Use a short
                    prompt your team can reuse or edit.
                  </span>
                </label>

                <div className="service-settings-actions service-settings-actions--inline">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setSettings((current) =>
                        current ? { ...current, default_topic_brief: DEFAULT_TOPIC_BRIEF } : current,
                      )
                    }
                  >
                    Restore default topic brief
                  </button>
                </div>
              </div>
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Post format</span>
                <span className="service-settings-section-meta">
                  {settings.include_hook ? 'Hook on' : 'Hook off'}
                  {settings.include_hashtags ? ' · Hashtags on' : ' · Hashtags off'}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group service-settings-field-group--stack">
                <label className="service-toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.include_hook}
                    onChange={(event) =>
                      setSettings((current) =>
                        current && { ...current, include_hook: event.target.checked },
                      )
                    }
                  />
                  <span className="service-toggle-label">
                    Include a hook — short attention-grabbing opening line
                  </span>
                </label>

                <label className="service-toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.include_hashtags}
                    onChange={(event) =>
                      setSettings((current) =>
                        current && { ...current, include_hashtags: event.target.checked },
                      )
                    }
                  />
                  <span className="service-toggle-label">
                    Include hashtags — 3–8 relevant tags per post
                  </span>
                </label>
              </div>
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Post image</span>
                <span className="service-settings-section-meta">
                  {settings.post_image_enabled
                    ? `${postImageProviderLabels[settings.post_image_ai_provider]} · ${settings.post_image_ai_model}`
                    : 'Disabled'}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body service-settings-section-body--connection">
              <div className="service-settings-field-group service-settings-field-group--toggle">
                <label className="service-toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.post_image_enabled}
                    onChange={(event) =>
                      setSettings((current) =>
                        current && { ...current, post_image_enabled: event.target.checked },
                      )
                    }
                  />
                  <span className="service-toggle-label">
                    Generate a post image when creating social content
                  </span>
                </label>
                <p className="service-field-hint">
                  After enabling, click Save settings. Images use OpenAI or Google only. If your
                  content provider is Anthropic or DeepSeek, add a separate image API key below.
                </p>
                {settings.post_image_enabled && settings.postImageKeyError ? (
                  <p className="service-workspace-alert service-workspace-alert--error">
                    {settings.postImageKeyError}
                  </p>
                ) : null}
              </div>

              <fieldset className="service-settings-field-group" disabled={!settings.post_image_enabled}>
                <div className="service-settings-grid">
                  <label htmlFor="social-post-image-provider">
                    Image provider
                    <select
                      id="social-post-image-provider"
                      value={settings.post_image_ai_provider}
                      onChange={(event) => {
                        const provider = event.target.value as SocialContentSettings['post_image_ai_provider']
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                post_image_ai_provider: provider,
                                post_image_ai_model: postImageProviderModels[provider][0],
                              }
                            : current,
                        )
                      }}
                    >
                      <option value="openai">{postImageProviderLabels.openai}</option>
                      <option value="google">{postImageProviderLabels.google}</option>
                    </select>
                  </label>

                  <label htmlFor="social-post-image-model">
                    Image model
                    <select
                      id="social-post-image-model"
                      value={settings.post_image_ai_model}
                      onChange={(event) =>
                        setSettings((current) =>
                          current && { ...current, post_image_ai_model: event.target.value },
                        )
                      }
                    >
                      {postImageModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label htmlFor="social-post-image-api-key">
                  Post image API key
                  <input
                    id="social-post-image-api-key"
                    type="password"
                    value={postImageApiKey}
                    onChange={(event) => setPostImageApiKey(event.target.value)}
                    placeholder={
                      settings.hasPostImageApiKey
                        ? 'Saved — enter a new key to replace'
                        : settings.post_image_ai_provider === 'openai'
                          ? 'OpenAI API key for DALL·E'
                          : 'Google AI API key for Gemini / Imagen'
                    }
                    autoComplete="off"
                  />
                  <span className="service-field-hint">
                    Required when image provider differs from content provider. Reuses your content
                    OpenAI/Google key when both use the same provider.
                  </span>
                </label>
              </fieldset>
            </div>
          </details>
        </div>

        {saved && (
          <p className="service-workspace-alert service-workspace-alert--success">
            Settings saved to your account.
          </p>
        )}

        <div className="service-settings-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => void handleReset()} disabled={saving}>
            Reset defaults
          </button>
        </div>
      </form>
    </div>
  )
}
