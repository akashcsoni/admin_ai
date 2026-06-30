import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, emailNewsletterApi } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import {
  DEFAULT_BRAND_VOICE,
  DEFAULT_FOOTER_TEXT,
  DEFAULT_TOPIC_BRIEF,
  defaultBrandVoiceForFormat,
  emailImageProviderLabels,
  emailImageProviderModels,
  newsletterFormatDescriptions,
  newsletterFormatLabels,
  providerModels,
  templateStyleLabels,
  templateStyleDescriptions,
  toneLabels,
  type EmailNewsletterSettings,
} from './emailNewsletter.types'

type EmailNewsletterSettingsTabProps = {
  onSettingsSaved: (settings: EmailNewsletterSettings) => void
}

export default function EmailNewsletterSettingsTab({ onSettingsSaved }: EmailNewsletterSettingsTabProps) {
  const { token } = useAuth()
  const [settings, setSettings] = useState<EmailNewsletterSettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [emailImageApiKey, setEmailImageApiKey] = useState('')
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
        const response = await emailNewsletterApi.getSettings(token)
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
      const response = await emailNewsletterApi.saveSettings(token, {
        enabled: settings.enabled,
        aiProvider: settings.ai_provider,
        aiModel: settings.ai_model,
        apiKey: apiKey.trim() || undefined,
        brandVoice: settings.brand_voice,
        companyName: settings.company_name,
        fromName: settings.from_name,
        defaultTopicBrief: settings.default_topic_brief,
        contentLanguage: settings.content_language,
        contentTone: settings.content_tone,
        newsletterFormat: settings.newsletter_format,
        emailTemplateStyle: settings.email_template_style,
        includeCta: settings.include_cta,
        defaultCtaText: settings.default_cta_text,
        defaultCtaUrl: settings.default_cta_url,
        footerText: settings.footer_text,
        generationTemperature: settings.generation_temperature,
        generationMaxTokens: settings.generation_max_tokens,
        emailImageEnabled: settings.email_image_enabled,
        emailImageAiProvider: settings.email_image_ai_provider,
        emailImageAiModel: settings.email_image_ai_model,
        emailImageApiKey: emailImageApiKey.trim() || undefined,
      })
      setSettings(response.settings)
      onSettingsSaved(response.settings)
      setApiKey('')
      setEmailImageApiKey('')
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
      const response = await emailNewsletterApi.saveSettings(token, {
        clearApiKey: true,
        enabled: true,
        aiProvider: 'openai',
        aiModel: 'gpt-4o',
        brandVoice: DEFAULT_BRAND_VOICE,
        newsletterFormat: 'content_email',
        companyName: 'Your Company',
        fromName: 'Your Team',
        defaultTopicBrief: DEFAULT_TOPIC_BRIEF,
        contentLanguage: 'en',
        contentTone: 'professional',
        emailTemplateStyle: 'classic',
        includeCta: true,
        defaultCtaText: 'Read more',
        defaultCtaUrl: 'https://example.com',
        footerText: DEFAULT_FOOTER_TEXT,
        generationTemperature: 0.7,
        generationMaxTokens: 6000,
        emailImageEnabled: false,
        emailImageAiProvider: 'openai',
        emailImageAiModel: 'dall-e-3',
      })

      setSettings(response.settings)
      onSettingsSaved(response.settings)
      setApiKey('')
      setEmailImageApiKey('')
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
  const emailImageModels = emailImageProviderModels[settings.email_image_ai_provider] ?? []

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Settings</h2>
          <p>Configure AI connection, brand details, email template style, and CTA defaults for HTML newsletters.</p>
        </div>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}
      {saved && <p className="service-workspace-alert service-workspace-alert--success">Settings saved</p>}

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
                    Enable email newsletter generation for this account
                  </span>
                </label>
              </div>

              <fieldset className="service-settings-field-group" disabled={!settings.enabled}>
                <div className="service-settings-grid">
                  <label htmlFor="newsletter-provider">
                    Provider
                    <select
                      id="newsletter-provider"
                      value={settings.ai_provider}
                      onChange={(event) => {
                        const provider = event.target.value as EmailNewsletterSettings['ai_provider']
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

                  <label htmlFor="newsletter-model">
                    Model
                    <select
                      id="newsletter-model"
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

                <label htmlFor="newsletter-settings-api-key">
                  API key
                  <input
                    id="newsletter-settings-api-key"
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
              <div className="service-settings-grid">
                <label className="service-settings-grid-span-2" htmlFor="newsletter-temperature">
                  Temperature ({settings.generation_temperature})
                  <input
                    id="newsletter-temperature"
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

                <label htmlFor="newsletter-max-tokens">
                  Max tokens
                  <input
                    id="newsletter-max-tokens"
                    type="number"
                    min="1000"
                    max="16000"
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
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Brand & email style</span>
                <span className="service-settings-section-meta">
                  {newsletterFormatLabels[settings.newsletter_format]} · {settings.company_name}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <div className="service-settings-grid">
                <label htmlFor="newsletter-company-name">
                  Company name
                  <input
                    id="newsletter-company-name"
                    type="text"
                    value={settings.company_name}
                    onChange={(event) =>
                      setSettings((current) =>
                        current ? { ...current, company_name: event.target.value } : current,
                      )
                    }
                  />
                </label>

                <label htmlFor="newsletter-from-name">
                  From name
                  <input
                    id="newsletter-from-name"
                    type="text"
                    value={settings.from_name}
                    onChange={(event) =>
                      setSettings((current) =>
                        current ? { ...current, from_name: event.target.value } : current,
                      )
                    }
                  />
                </label>

                <label htmlFor="newsletter-content-tone">
                  Tone
                  <select
                    id="newsletter-content-tone"
                    value={settings.content_tone}
                    onChange={(event) =>
                      setSettings((current) =>
                        current
                          ? {
                              ...current,
                              content_tone: event.target.value as EmailNewsletterSettings['content_tone'],
                            }
                          : current,
                      )
                    }
                  >
                    {(Object.keys(toneLabels) as EmailNewsletterSettings['content_tone'][]).map((tone) => (
                      <option key={tone} value={tone}>
                        {toneLabels[tone]}
                      </option>
                    ))}
                  </select>
                </label>

                <label htmlFor="newsletter-template-style">
                  Template style
                  <select
                    id="newsletter-template-style"
                    value={settings.email_template_style}
                    onChange={(event) =>
                      setSettings((current) =>
                        current
                          ? {
                              ...current,
                              email_template_style: event.target.value as EmailNewsletterSettings['email_template_style'],
                            }
                          : current,
                      )
                    }
                  >
                    {(Object.keys(templateStyleLabels) as EmailNewsletterSettings['email_template_style'][]).map(
                      (style) => (
                        <option key={style} value={style}>
                          {templateStyleLabels[style]}
                        </option>
                      ),
                    )}
                  </select>
                  <span className="service-settings-hint">
                    {templateStyleDescriptions[settings.email_template_style]}
                  </span>
                </label>
              </div>

              <label className="service-settings-input-narrow" htmlFor="newsletter-content-language">
                Content language
                <input
                  id="newsletter-content-language"
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

              <label htmlFor="newsletter-format">
                Newsletter format
                <select
                  id="newsletter-format"
                  value={settings.newsletter_format}
                  onChange={(event) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            newsletter_format: event.target.value as EmailNewsletterSettings['newsletter_format'],
                          }
                        : current,
                    )
                  }
                >
                  {(Object.keys(newsletterFormatLabels) as EmailNewsletterSettings['newsletter_format'][]).map(
                    (format) => (
                      <option key={format} value={format}>
                        {newsletterFormatLabels[format]}
                      </option>
                    ),
                  )}
                </select>
                <span className="service-field-hint">
                  {newsletterFormatDescriptions[settings.newsletter_format]}
                </span>
              </label>

              <label htmlFor="newsletter-brand-voice">
                Brand voice
                <textarea
                  id="newsletter-brand-voice"
                  rows={4}
                  value={settings.brand_voice}
                  placeholder={defaultBrandVoiceForFormat(settings.newsletter_format)}
                  onChange={(event) =>
                    setSettings((current) =>
                      current ? { ...current, brand_voice: event.target.value } : current,
                    )
                  }
                />
                <span className="service-field-hint">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setSettings((current) =>
                        current
                          ? {
                              ...current,
                              brand_voice: defaultBrandVoiceForFormat(current.newsletter_format),
                            }
                          : current,
                      )
                    }
                  >
                    Use suggested brand voice
                  </button>
                </span>
              </label>

              <label htmlFor="newsletter-default-topic-brief">
                Default topic brief (Compose placeholder)
                <textarea
                  id="newsletter-default-topic-brief"
                  rows={3}
                  value={settings.default_topic_brief}
                  onChange={(event) =>
                    setSettings((current) =>
                      current ? { ...current, default_topic_brief: event.target.value } : current,
                    )
                  }
                />
              </label>
            </div>
          </details>

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">Email image</span>
                <span className="service-settings-section-meta">
                  {settings.email_image_enabled
                    ? `${emailImageProviderLabels[settings.email_image_ai_provider]} · ${settings.email_image_ai_model}`
                    : 'Disabled'}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body service-settings-section-body--connection">
              <div className="service-settings-field-group service-settings-field-group--toggle">
                <label className="service-toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.email_image_enabled}
                    onChange={(event) =>
                      setSettings((current) =>
                        current && { ...current, email_image_enabled: event.target.checked },
                      )
                    }
                  />
                  <span className="service-toggle-label">
                    Generate a hero image when creating email newsletters
                  </span>
                </label>
                <p className="service-field-hint">
                  When enabled, AI generates a hero banner and embeds it in the HTML email. Images
                  use OpenAI or Google only. If your content provider is Anthropic or DeepSeek, add
                  a separate image API key below.
                </p>
                {settings.email_image_enabled && settings.emailImageKeyError ? (
                  <p className="service-workspace-alert service-workspace-alert--error">
                    {settings.emailImageKeyError}
                  </p>
                ) : null}
              </div>

              <fieldset className="service-settings-field-group" disabled={!settings.email_image_enabled}>
                <div className="service-settings-grid">
                  <label htmlFor="newsletter-email-image-provider">
                    Image provider
                    <select
                      id="newsletter-email-image-provider"
                      value={settings.email_image_ai_provider}
                      onChange={(event) => {
                        const provider = event.target.value as EmailNewsletterSettings['email_image_ai_provider']
                        setSettings((current) =>
                          current
                            ? {
                                ...current,
                                email_image_ai_provider: provider,
                                email_image_ai_model: emailImageProviderModels[provider][0],
                              }
                            : current,
                        )
                      }}
                    >
                      <option value="openai">{emailImageProviderLabels.openai}</option>
                      <option value="google">{emailImageProviderLabels.google}</option>
                    </select>
                  </label>

                  <label htmlFor="newsletter-email-image-model">
                    Image model
                    <select
                      id="newsletter-email-image-model"
                      value={settings.email_image_ai_model}
                      onChange={(event) =>
                        setSettings((current) =>
                          current && { ...current, email_image_ai_model: event.target.value },
                        )
                      }
                    >
                      {emailImageModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label htmlFor="newsletter-email-image-api-key">
                  Email image API key
                  <input
                    id="newsletter-email-image-api-key"
                    type="password"
                    value={emailImageApiKey}
                    onChange={(event) => setEmailImageApiKey(event.target.value)}
                    placeholder={
                      settings.hasEmailImageApiKey
                        ? 'Saved — enter a new key to replace'
                        : settings.email_image_ai_provider === 'openai'
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

          <details className="service-settings-section">
            <summary>
              <span className="service-settings-section-summary-main">
                <span className="service-settings-section-title">CTA & footer</span>
                <span className="service-settings-section-meta">
                  {settings.include_cta ? settings.default_cta_text : 'No CTA'}
                </span>
              </span>
            </summary>

            <div className="service-settings-section-body">
              <label className="service-toggle-row">
                <input
                  type="checkbox"
                  checked={settings.include_cta}
                  onChange={(event) =>
                    setSettings((current) => current && { ...current, include_cta: event.target.checked })
                  }
                />
                <span className="service-toggle-label">Include a primary call-to-action button in emails</span>
              </label>

              <div className="service-settings-grid">
                <label htmlFor="newsletter-cta-text">
                  CTA button text
                  <input
                    id="newsletter-cta-text"
                    type="text"
                    value={settings.default_cta_text}
                    disabled={!settings.include_cta}
                    onChange={(event) =>
                      setSettings((current) =>
                        current ? { ...current, default_cta_text: event.target.value } : current,
                      )
                    }
                  />
                </label>

                <label htmlFor="newsletter-cta-url">
                  CTA URL
                  <input
                    id="newsletter-cta-url"
                    type="url"
                    value={settings.default_cta_url}
                    disabled={!settings.include_cta}
                    onChange={(event) =>
                      setSettings((current) =>
                        current ? { ...current, default_cta_url: event.target.value } : current,
                      )
                    }
                  />
                </label>
              </div>

              <label htmlFor="newsletter-footer-text">
                Footer text
                <textarea
                  id="newsletter-footer-text"
                  rows={3}
                  value={settings.footer_text}
                  onChange={(event) =>
                    setSettings((current) =>
                      current ? { ...current, footer_text: event.target.value } : current,
                    )
                  }
                />
              </label>
            </div>
          </details>
        </div>

        <div className="service-settings-actions">
          <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => void handleReset()}>
            Reset defaults
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
