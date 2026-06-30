import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, autoBlogApi } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import {
  contentLengthPresets,
  contentPromptTypes,
  featuredImageProviderLabels,
  featuredImageProviderModels,
  multiStepSlugs,
  providerModels,
  type AutoBlogSettings,
  type MultiStepSlug,
} from './autoBlog.types'
import PromptShortcodeReference from './PromptShortcodeReference'
import { DEFAULT_TOPIC_NICHE_PROMPT } from './promptShortcodes'

type AutoBlogSettingsTabProps = {
  onSettingsSaved: (settings: AutoBlogSettings) => void
}

export default function AutoBlogSettingsTab({ onSettingsSaved }: AutoBlogSettingsTabProps) {
  const { token } = useAuth()
  const [settings, setSettings] = useState<AutoBlogSettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [featuredImageApiKey, setFeaturedImageApiKey] = useState('')
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
        const response = await autoBlogApi.getSettings(token)
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
      const response = await autoBlogApi.saveSettings(token, {
        enabled: settings.enabled,
        aiProvider: settings.ai_provider,
        aiModel: settings.ai_model,
        apiKey: apiKey.trim() || undefined,
        generationMode: settings.generation_mode,
        generationTemperature: settings.generation_temperature,
        generationMaxTokens: settings.generation_max_tokens,
        contentLength: settings.content_length,
        contentMinWords: settings.content_min_words,
        contentMaxWords: settings.content_max_words,
        contentPromptType: settings.content_prompt_type,
        systemPrompt: settings.system_prompt,
        contentLanguage: settings.content_language,
        publishStatus: settings.publish_status,
        seoEnabled: settings.seo_enabled,
        featuredImageEnabled: settings.featured_image_enabled,
        featuredImageAiProvider: settings.featured_image_ai_provider,
        featuredImageAiModel: settings.featured_image_ai_model,
        featuredImageApiKey: featuredImageApiKey.trim() || undefined,
        multiStepPrompts: settings.multi_step_prompts,
        topicNiche: settings.topic_niche,
      })

      setSettings(response.settings)
      onSettingsSaved(response.settings)
      setApiKey('')
      setFeaturedImageApiKey('')
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
      const response = await autoBlogApi.saveSettings(token, {
        clearApiKey: true,
        aiProvider: 'openai',
        aiModel: 'gpt-4o',
        generationMode: 'single',
        generationTemperature: 0.7,
        generationMaxTokens: 4000,
        contentLength: 'medium',
        contentMinWords: 800,
        contentMaxWords: 1200,
        contentPromptType: 'news_article',
        systemPrompt: '',
        contentLanguage: 'en',
        publishStatus: 'draft',
        seoEnabled: true,
        featuredImageEnabled: false,
        featuredImageAiProvider: 'openai',
        featuredImageAiModel: 'dall-e-3',
        clearFeaturedImageApiKey: true,
        enabled: true,
        multiStepPrompts: undefined,
        topicNiche: DEFAULT_TOPIC_NICHE_PROMPT,
      })

      setSettings(response.settings)
      onSettingsSaved(response.settings)
      setApiKey('')
      setFeaturedImageApiKey('')
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
  const featuredImageModels =
    featuredImageProviderModels[settings.featured_image_ai_provider] ?? []
  const isMultiStep = settings.generation_mode === 'multi_step'

  function updateStepField(
    slug: MultiStepSlug,
    field: 'prompt' | 'instruction' | 'max_tokens',
    value: string | number,
  ) {
    setSettings((current) => {
      if (!current) return current

      return {
        ...current,
        multi_step_prompts: {
          ...current.multi_step_prompts,
          [slug]: {
            ...current.multi_step_prompts[slug],
            [field]: value,
          },
        },
      }
    })
  }

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Settings</h2>
          <p>
            Saved to your account — same structure as Newswoven AI (provider, generation, content, publishing, SEO).
          </p>
        </div>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}

      <form className="service-workspace-form service-settings-form service-settings-form--wide" onSubmit={handleSubmit}>
        <div className="service-settings-accordion">
          <details className="service-settings-section">
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
                  <span className="service-toggle-label">Enable auto blog generation for this account</span>
                </label>
              </div>

              <fieldset className="service-settings-field-group" disabled={!settings.enabled}>
                <div className="service-settings-grid">
                  <label htmlFor="blog-provider">
                    Provider
                    <select
                      id="blog-provider"
                      value={settings.ai_provider}
                      onChange={(event) => {
                        const provider = event.target.value as AutoBlogSettings['ai_provider']
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

                  <label htmlFor="blog-model">
                    Model
                    <select
                      id="blog-model"
                      value={settings.ai_model}
                      onChange={(event) =>
                        setSettings((current) => current && { ...current, ai_model: event.target.value })
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

                <label htmlFor="blog-settings-api-key">
                  API key
                  <input
                    id="blog-settings-api-key"
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder={settings.hasApiKey ? 'Saved — enter a new key to replace' : 'sk-...'}
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
                  {isMultiStep ? 'Multi-step · 6 calls' : 'Single call'} · temp {settings.generation_temperature}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <label htmlFor="blog-generation-mode">
                  Generation mode
                  <select
                    id="blog-generation-mode"
                    value={settings.generation_mode}
                    onChange={(event) =>
                      setSettings((current) =>
                        current && {
                          ...current,
                          generation_mode: event.target.value as AutoBlogSettings['generation_mode'],
                        },
                      )
                    }
                  >
                    <option value="single">Single call</option>
                    <option value="multi_step" disabled>
                      Multi-step (6 AI calls) — coming soon
                    </option>
                  </select>
                </label>
                {isMultiStep && (
                  <p className="service-workspace-alert service-workspace-alert--warning">
                    Multi-step mode is not available yet. Switch to <strong>Single call</strong> — posts
                    currently generate with one AI request.
                  </p>
                )}
              </div>

              <div className="service-settings-field-group">
                <div className="service-settings-grid">
                  <label className="service-settings-grid-span-2" htmlFor="blog-temperature">
                    Temperature ({settings.generation_temperature})
                    <input
                      id="blog-temperature"
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

                  {!isMultiStep && (
                    <label htmlFor="blog-max-tokens">
                      Max tokens
                      <input
                        id="blog-max-tokens"
                        type="number"
                        min="500"
                        max="16000"
                        value={settings.generation_max_tokens}
                        onChange={(event) =>
                          setSettings((current) =>
                            current && { ...current, generation_max_tokens: Number(event.target.value) },
                          )
                        }
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </details>

          {!isMultiStep && (
          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Content</span>
                <span className="service-settings-section-meta">
                  {contentPromptTypes[settings.content_prompt_type].label} · {settings.content_language}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <div className="service-settings-grid">
                  <label htmlFor="blog-content-type">
                    Content type
                    <select
                      id="blog-content-type"
                      value={settings.content_prompt_type}
                      onChange={(event) =>
                        setSettings((current) =>
                          current && {
                            ...current,
                            content_prompt_type: event.target.value as AutoBlogSettings['content_prompt_type'],
                          },
                        )
                      }
                    >
                      {Object.entries(contentPromptTypes).map(([value, meta]) => (
                        <option key={value} value={value}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label htmlFor="blog-content-length">
                    Content length
                    <select
                      id="blog-content-length"
                      value={settings.content_length}
                      onChange={(event) => {
                        const contentLength = event.target.value as AutoBlogSettings['content_length']
                        const preset = contentLengthPresets[contentLength]
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                content_length: contentLength,
                                content_min_words: preset.min,
                                content_max_words: preset.max,
                              }
                            : current,
                        )
                      }}
                    >
                      {Object.entries(contentLengthPresets).map(([value, meta]) => (
                        <option key={value} value={value}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {settings.content_length === 'custom' && (
                  <div className="service-settings-grid">
                    <label htmlFor="blog-min-words">
                      Min words
                      <input
                        id="blog-min-words"
                        type="number"
                        min="200"
                        max="5000"
                        value={settings.content_min_words}
                        onChange={(event) =>
                          setSettings((current) =>
                            current && { ...current, content_min_words: Number(event.target.value) },
                          )
                        }
                      />
                    </label>
                    <label htmlFor="blog-max-words">
                      Max words
                      <input
                        id="blog-max-words"
                        type="number"
                        min="200"
                        max="8000"
                        value={settings.content_max_words}
                        onChange={(event) =>
                          setSettings((current) =>
                            current && { ...current, content_max_words: Number(event.target.value) },
                          )
                        }
                      />
                    </label>
                  </div>
                )}

                <label className="service-settings-input-narrow" htmlFor="blog-language">
                  Content language
                  <input
                    id="blog-language"
                    type="text"
                    value={settings.content_language}
                    onChange={(event) =>
                      setSettings((current) => current && { ...current, content_language: event.target.value })
                    }
                    placeholder="en"
                  />
                </label>
              </div>

              {settings.content_prompt_type === 'custom' && (
                <div className="service-settings-field-group">
                  <label htmlFor="blog-system-prompt">
                    Custom system prompt
                    <textarea
                      id="blog-system-prompt"
                      rows={6}
                      value={settings.system_prompt}
                      onChange={(event) =>
                        setSettings((current) => current && { ...current, system_prompt: event.target.value })
                      }
                    />
                  </label>
                  <PromptShortcodeReference />
                </div>
              )}
            </div>
          </details>
          )}

          {isMultiStep && (
          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Multi-step content</span>
                <span className="service-settings-section-meta">
                  6 steps · {settings.content_language} · {settings.content_min_words}–{settings.content_max_words} words
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <div className="service-form-section">
                  <h4>Step prompts</h4>
                  <p>
                    Each step runs as a separate AI call. Expand a step to edit its prompt, instruction, and max
                    tokens.
                  </p>
                </div>

                <div className="service-settings-grid">
                  <label htmlFor="blog-multi-content-length">
                    Content length
                    <select
                      id="blog-multi-content-length"
                      value={settings.content_length}
                      onChange={(event) => {
                        const contentLength = event.target.value as AutoBlogSettings['content_length']
                        const preset = contentLengthPresets[contentLength]
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                content_length: contentLength,
                                content_min_words: preset.min,
                                content_max_words: preset.max,
                              }
                            : current,
                        )
                      }}
                    >
                      {Object.entries(contentLengthPresets).map(([value, meta]) => (
                        <option key={value} value={value}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label htmlFor="blog-multi-language">
                    Content language
                    <input
                      id="blog-multi-language"
                      type="text"
                      value={settings.content_language}
                      onChange={(event) =>
                        setSettings((current) => current && { ...current, content_language: event.target.value })
                      }
                      placeholder="en"
                    />
                  </label>
                </div>

                {settings.content_length === 'custom' && (
                  <div className="service-settings-grid">
                    <label htmlFor="blog-multi-min-words">
                      Min words
                      <input
                        id="blog-multi-min-words"
                        type="number"
                        min="200"
                        max="5000"
                        value={settings.content_min_words}
                        onChange={(event) =>
                          setSettings((current) =>
                            current && { ...current, content_min_words: Number(event.target.value) },
                          )
                        }
                      />
                    </label>
                    <label htmlFor="blog-multi-max-words">
                      Max words
                      <input
                        id="blog-multi-max-words"
                        type="number"
                        min="200"
                        max="8000"
                        value={settings.content_max_words}
                        onChange={(event) =>
                          setSettings((current) =>
                            current && { ...current, content_max_words: Number(event.target.value) },
                          )
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="service-settings-field-group service-settings-field-group--flush">
                <div className="service-multi-step-accordion">
                {multiStepSlugs.map((slug, index) => {
                  const step = settings.multi_step_prompts[slug]
                  if (!step) return null

                  return (
                    <details
                      key={slug}
                      className="service-multi-step-item"
                      open={index === 0}
                    >
                      <summary>
                        <span className="service-multi-step-summary-badge" aria-hidden="true">
                          {index + 1}
                        </span>
                        <span className="service-multi-step-summary-main">
                          <span className="service-multi-step-title">{step.label}</span>
                          <span className="service-multi-step-summary-desc">{step.description}</span>
                        </span>
                        <span className="service-multi-step-summary-aside">
                          <span className="service-multi-step-summary-meta">
                            {step.max_tokens.toLocaleString()} tokens
                          </span>
                        </span>
                      </summary>

                      <div className="service-multi-step-item-body">
                        <p className="service-multi-step-description">{step.description}</p>
                        {step.placeholders?.length > 0 && (
                          <p className="service-field-hint">
                            Placeholders: {step.placeholders.join(', ')}
                          </p>
                        )}

                        <label htmlFor={`step-${slug}-prompt`}>
                          Step prompt
                          <textarea
                            id={`step-${slug}-prompt`}
                            rows={5}
                            value={step.prompt}
                            onChange={(event) => updateStepField(slug, 'prompt', event.target.value)}
                          />
                        </label>

                        <label htmlFor={`step-${slug}-instruction`}>
                          Step instruction
                          <textarea
                            id={`step-${slug}-instruction`}
                            rows={3}
                            value={step.instruction}
                            onChange={(event) =>
                              updateStepField(slug, 'instruction', event.target.value)
                            }
                          />
                        </label>

                        <label htmlFor={`step-${slug}-max-tokens`}>
                          Max tokens
                          <input
                            id={`step-${slug}-max-tokens`}
                            type="number"
                            min="500"
                            max="16000"
                            value={step.max_tokens}
                            onChange={(event) =>
                              updateStepField(slug, 'max_tokens', Number(event.target.value))
                            }
                          />
                        </label>
                      </div>
                    </details>
                  )
                })}
                </div>
              </div>
            </div>
          </details>
          )}

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Topics & niche</span>
                <span className="service-settings-section-meta">
                  {settings.topic_niche.trim()
                    ? `${settings.topic_niche.trim().slice(0, 48)}${settings.topic_niche.length > 48 ? '…' : ''}`
                    : 'Set your niche for AI topic ideas'}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <label htmlFor="blog-topic-niche">
                  Site / niche description
                  <textarea
                    id="blog-topic-niche"
                    rows={5}
                    value={settings.topic_niche}
                    onChange={(event) =>
                      setSettings((current) => current && { ...current, topic_niche: event.target.value })
                    }
                    placeholder={DEFAULT_TOPIC_NICHE_PROMPT}
                  />
                  <span className="service-field-hint">
                    Default template includes dynamic shortcodes like {'{current_year}'} and {'{content_language}'}.
                    Replaced automatically when generating topics or posts.
                  </span>
                </label>

                <div className="service-settings-actions service-settings-actions--inline">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setSettings((current) =>
                        current ? { ...current, topic_niche: DEFAULT_TOPIC_NICHE_PROMPT } : current,
                      )
                    }
                  >
                    Restore default template
                  </button>
                </div>
              </div>

              <PromptShortcodeReference title="Available shortcodes for prompts" />
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Publishing & SEO</span>
                <span className="service-settings-section-meta">
                  {settings.publish_status === 'published' ? 'Publish immediately' : 'Save as draft'}
                  {settings.seo_enabled ? ' · SEO on' : ' · SEO off'}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-field-group">
                <label className="service-settings-input-narrow" htmlFor="blog-publish-status">
                  Default publish status
                  <select
                    id="blog-publish-status"
                    value={settings.publish_status}
                    onChange={(event) =>
                      setSettings((current) =>
                        current && {
                          ...current,
                          publish_status: event.target.value as AutoBlogSettings['publish_status'],
                        },
                      )
                    }
                  >
                    <option value="draft">Save as draft</option>
                    <option value="published">Publish immediately</option>
                  </select>
                </label>
              </div>

              <div className="service-settings-field-group service-settings-field-group--stack">
                <label className="service-toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.seo_enabled}
                    onChange={(event) =>
                      setSettings((current) => current && { ...current, seo_enabled: event.target.checked })
                    }
                  />
                  <span className="service-toggle-label">
                    Generate SEO title, meta description, and focus keyword
                  </span>
                </label>
              </div>
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Featured image</span>
                <span className="service-settings-section-meta">
                  {settings.featured_image_enabled
                    ? `${featuredImageProviderLabels[settings.featured_image_ai_provider]} · ${settings.featured_image_ai_model}`
                    : 'Disabled'}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body service-settings-section-body--connection">
              <div className="service-settings-field-group service-settings-field-group--toggle">
                <label className="service-toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.featured_image_enabled}
                    onChange={(event) =>
                      setSettings((current) =>
                        current && { ...current, featured_image_enabled: event.target.checked },
                      )
                    }
                  />
                  <span className="service-toggle-label">
                    Generate a featured image for each new blog post
                  </span>
                </label>
                <p className="service-field-hint">
                  After enabling, click Save settings. Images use OpenAI or Google only. If your
                  content provider is Anthropic or DeepSeek, add a separate image API key below.
                </p>
                {settings.featured_image_enabled && settings.featuredImageKeyError ? (
                  <p className="service-workspace-alert service-workspace-alert--error">
                    {settings.featuredImageKeyError}
                  </p>
                ) : null}
              </div>

              <fieldset className="service-settings-field-group" disabled={!settings.featured_image_enabled}>
                <div className="service-settings-grid">
                  <label htmlFor="blog-featured-provider">
                    Image provider
                    <select
                      id="blog-featured-provider"
                      value={settings.featured_image_ai_provider}
                      onChange={(event) => {
                        const provider = event.target.value as AutoBlogSettings['featured_image_ai_provider']
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                featured_image_ai_provider: provider,
                                featured_image_ai_model: featuredImageProviderModels[provider][0],
                              }
                            : current,
                        )
                      }}
                    >
                      <option value="openai">{featuredImageProviderLabels.openai}</option>
                      <option value="google">{featuredImageProviderLabels.google}</option>
                    </select>
                  </label>

                  <label htmlFor="blog-featured-model">
                    Image model
                    <select
                      id="blog-featured-model"
                      value={settings.featured_image_ai_model}
                      onChange={(event) =>
                        setSettings((current) =>
                          current && { ...current, featured_image_ai_model: event.target.value },
                        )
                      }
                    >
                      {featuredImageModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label htmlFor="blog-featured-api-key">
                  Featured image API key
                  <input
                    id="blog-featured-api-key"
                    type="password"
                    value={featuredImageApiKey}
                    onChange={(event) => setFeaturedImageApiKey(event.target.value)}
                    placeholder={
                      settings.hasFeaturedImageApiKey
                        ? 'Saved — enter a new key to replace'
                        : settings.featured_image_ai_provider === 'openai'
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
