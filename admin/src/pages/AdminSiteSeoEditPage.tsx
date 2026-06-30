import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRotateLeft,
  faArrowUpRightFromSquare,
  faCode,
  faGlobe,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import AdminContentCard from '../components/AdminContentCard'
import AdminSitePageBlocksEditor from '../components/AdminSitePageBlocksEditor'
import { useAdminAuth } from '../context/AdminAuthContext'
import { appUrl } from '../data/adminNav'
import { adminApi, type SitePageBlock, type SitePageSeoRecord } from '../lib/api'

type FormState = {
  metaTitle: string
  metaDescription: string
  keywordsText: string
  h1: string
  ogType: 'website' | 'article'
  ogImage: string
  noindex: boolean
  schemaTypesText: string
  schemaJsonText: string
  isActive: boolean
}

function toFormState(page: SitePageSeoRecord): FormState {
  return {
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    keywordsText: page.keywords.join('\n'),
    h1: page.h1,
    ogType: page.ogType,
    ogImage: page.ogImage,
    noindex: page.noindex,
    schemaTypesText: page.schemaTypes.join(', '),
    schemaJsonText: page.schemaJson ? JSON.stringify(page.schemaJson, null, 2) : '',
    isActive: page.isActive,
  }
}

function parseKeywords(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseSchemaTypes(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseSchemaJson(value: string): Record<string, unknown>[] | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = JSON.parse(trimmed) as unknown
  if (Array.isArray(parsed)) {
    return parsed as Record<string, unknown>[]
  }
  return [parsed as Record<string, unknown>]
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type CharMeterProps = {
  length: number
  min: number
  max: number
}

function CharMeter({ length, min, max }: CharMeterProps) {
  const status =
    length >= min && length <= max ? 'good' : length === 0 ? 'empty' : 'warn'

  return (
    <span className={`admin-seo-char-meter admin-seo-char-meter--${status}`}>
      {length} chars · ideal {min}–{max}
    </span>
  )
}

export default function AdminSiteSeoEditPage() {
  const { pageKey } = useParams()
  const { token } = useAdminAuth()
  const [page, setPage] = useState<SitePageSeoRecord | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [savingContent, setSavingContent] = useState(false)
  const [resettingContent, setResettingContent] = useState(false)
  const [activeTab, setActiveTab] = useState<'seo' | 'content'>('seo')
  const [contentBlocks, setContentBlocks] = useState<SitePageBlock[]>([])
  const [contentActive, setContentActive] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !pageKey) return

    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await adminApi.getSiteSeoPage(token!, pageKey!)
        setPage(response.page)
        setForm(toFormState(response.page))
        setContentBlocks(response.page.contentBlocks ?? [])
        setContentActive(response.page.contentActive)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page SEO record')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [token, pageKey])

  const preview = useMemo(() => {
    if (!form || !page) return null

    const title = form.metaTitle.trim() || page.pageName
    const description = form.metaDescription.trim() || 'Add a meta description for search results.'
    const keywords = parseKeywords(form.keywordsText)
    const schemaTypes = parseSchemaTypes(form.schemaTypesText)
    const liveUrl = `${appUrl}${page.path}`

    let schemaBlockCount = 0
    if (form.schemaJsonText.trim()) {
      try {
        const parsed = parseSchemaJson(form.schemaJsonText)
        schemaBlockCount = parsed?.length ?? 0
      } catch {
        schemaBlockCount = 0
      }
    }

    return {
      title,
      description,
      keywords,
      schemaTypes,
      schemaBlockCount,
      liveUrl,
      displayUrl: liveUrl.replace(/^https?:\/\//, ''),
    }
  }, [form, page])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token || !pageKey || !form) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const schemaJson = parseSchemaJson(form.schemaJsonText)
      const response = await adminApi.updateSiteSeoPage(token, pageKey, {
        metaTitle: form.metaTitle.trim(),
        metaDescription: form.metaDescription.trim(),
        keywords: parseKeywords(form.keywordsText),
        h1: form.h1.trim(),
        ogType: form.ogType,
        ogImage: form.ogImage.trim(),
        noindex: form.noindex,
        schemaTypes: parseSchemaTypes(form.schemaTypesText),
        schemaJson,
        isActive: form.isActive,
      })
      setPage(response.page)
      setForm(toFormState(response.page))
      setContentBlocks(response.page.contentBlocks ?? [])
      setContentActive(response.page.contentActive)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page SEO')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!token || !pageKey) return
    if (!window.confirm('Reset this page to default SEO values?')) return

    setResetting(true)
    setError('')
    setMessage('')

    try {
      const response = await adminApi.resetSiteSeoPage(token, pageKey)
      setPage(response.page)
      setForm(toFormState(response.page))
      setContentBlocks(response.page.contentBlocks ?? [])
      setContentActive(response.page.contentActive)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset page SEO')
    } finally {
      setResetting(false)
    }
  }

  async function handleSaveContent() {
    if (!token || !pageKey) return

    setSavingContent(true)
    setError('')
    setMessage('')

    try {
      const response = await adminApi.updateSiteSeoPage(token, pageKey, {
        contentBlocks,
        contentActive,
      })
      setPage(response.page)
      setContentBlocks(response.page.contentBlocks ?? [])
      setContentActive(response.page.contentActive)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page content blocks')
    } finally {
      setSavingContent(false)
    }
  }

  async function handleResetContent() {
    if (!token || !pageKey) return
    if (!window.confirm('Reset page content blocks to defaults?')) return

    setResettingContent(true)
    setError('')
    setMessage('')

    try {
      const response = await adminApi.resetSiteSeoContent(token, pageKey)
      setPage(response.page)
      setContentBlocks(response.page.contentBlocks ?? [])
      setContentActive(response.page.contentActive)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset page content blocks')
    } finally {
      setResettingContent(false)
    }
  }

  const liveUrl = page ? `${appUrl}${page.path}` : null

  return (
    <div className="admin-page admin-site-seo-edit-page">
      <header className="admin-page-header admin-page-header--dashboard">
        <div>
          <p className="admin-page-eyebrow">Website SEO</p>
          <h1>{page?.pageName ?? 'Edit page SEO'}</h1>
          <p className="admin-page-lead">
            Manage search and social metadata for{' '}
            <code className="admin-site-seo-path-chip">{page?.path ?? '/…'}</code>
          </p>
          {page && form ? (
            <div className="admin-site-seo-header-badges">
              <span className="admin-users-badge">{page.pageCategory}</span>
              {form.noindex ? (
                <span className="admin-users-badge">Noindex</span>
              ) : (
                <span className="admin-users-badge admin-users-badge--success">Indexable</span>
              )}
              {form.isActive ? (
                <span className="admin-users-badge admin-users-badge--success">Active</span>
              ) : (
                <span className="admin-users-badge admin-users-badge--danger">Inactive</span>
              )}
              <span className="admin-site-seo-updated">Updated {formatDateTime(page.updatedAt)}</span>
            </div>
          ) : null}
        </div>
        <div className="admin-page-header-actions">
          <Link to="/site-seo" className="admin-btn admin-btn--ghost">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            Back to list
          </Link>
          {liveUrl ? (
            <a href={liveUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
              View live
            </a>
          ) : null}
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {message && <p className="admin-alert admin-alert--success">{message}</p>}

      {!loading && page && form ? (
        <nav className="admin-site-seo-tabs" aria-label="Page editor sections">
          <button
            type="button"
            className={`admin-site-seo-tab${activeTab === 'seo' ? ' admin-site-seo-tab--active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO & schema
          </button>
          <button
            type="button"
            className={`admin-site-seo-tab${activeTab === 'content' ? ' admin-site-seo-tab--active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Content blocks
            {contentBlocks.length > 0 ? (
              <span className="admin-site-seo-tab-count">{contentBlocks.length}</span>
            ) : null}
          </button>
        </nav>
      ) : null}

      {loading || !form || !page ? (
        <p className="admin-content-loading">Loading page SEO...</p>
      ) : activeTab === 'content' ? (
        <AdminContentCard
          className="admin-site-seo-edit-card"
          title="Page content blocks"
          description="Build the public page section by section. Hero, sections, guide links, status list, and CTA blocks are supported."
        >
          <AdminSitePageBlocksEditor
            pageKey={page.pageKey}
            blocks={contentBlocks}
            contentActive={contentActive}
            saving={savingContent}
            resetting={resettingContent}
            onBlocksChange={setContentBlocks}
            onContentActiveChange={setContentActive}
            onSave={() => void handleSaveContent()}
            onReset={() => void handleResetContent()}
          />
        </AdminContentCard>
      ) : !preview ? (
        <p className="admin-content-loading">Loading page SEO...</p>
      ) : (
        <div className="admin-site-seo-edit-layout">
          <AdminContentCard
            className="admin-site-seo-edit-card"
            title="SEO settings"
            description="Changes apply to the public website when this record is active."
          >
            <form className="admin-site-seo-edit-form" onSubmit={handleSubmit}>
              <section className="admin-site-seo-section">
                <div className="admin-site-seo-section-head">
                  <h3>Page details</h3>
                  <p>Read-only identifiers for this managed route.</p>
                </div>
                <div className="admin-site-seo-meta-grid">
                  <div className="admin-site-seo-meta-item">
                    <span>Page key</span>
                    <strong>{page.pageKey}</strong>
                  </div>
                  <div className="admin-site-seo-meta-item">
                    <span>URL path</span>
                    <strong>{page.path}</strong>
                  </div>
                  <div className="admin-site-seo-meta-item">
                    <span>Category</span>
                    <strong>{page.pageCategory}</strong>
                  </div>
                  <div className="admin-site-seo-meta-item">
                    <span>Public URL</span>
                    <a href={preview.liveUrl} target="_blank" rel="noreferrer">
                      {preview.displayUrl}
                    </a>
                  </div>
                </div>
              </section>

              <section className="admin-site-seo-section">
                <div className="admin-site-seo-section-head">
                  <h3>Meta tags</h3>
                  <p>Title and description shown in search results and browser tabs.</p>
                </div>
                <div className="admin-form-grid admin-site-seo-form-grid">
                  <label className="admin-field admin-field--wide">
                    <span className="admin-site-seo-field-label">
                      Meta title
                      <CharMeter length={form.metaTitle.length} min={50} max={60} />
                    </span>
                    <input
                      className="admin-input"
                      value={form.metaTitle}
                      required
                      maxLength={500}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, metaTitle: event.target.value } : current,
                        )
                      }
                    />
                  </label>

                  <label className="admin-field admin-field--wide">
                    <span className="admin-site-seo-field-label">
                      Meta description
                      <CharMeter length={form.metaDescription.length} min={150} max={160} />
                    </span>
                    <textarea
                      className="admin-input admin-textarea admin-site-seo-textarea"
                      value={form.metaDescription}
                      required
                      maxLength={320}
                      rows={4}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, metaDescription: event.target.value } : current,
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="admin-site-seo-section">
                <div className="admin-site-seo-section-head">
                  <h3>Content & keywords</h3>
                  <p>Primary heading reference and keyword targets for this page.</p>
                </div>
                <div className="admin-form-grid admin-site-seo-form-grid">
                  <label className="admin-field admin-field--wide">
                    <span>H1 heading</span>
                    <input
                      className="admin-input"
                      value={form.h1}
                      maxLength={500}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, h1: event.target.value } : current,
                        )
                      }
                    />
                  </label>

                  <label className="admin-field admin-field--wide">
                    <span>Keywords (one per line)</span>
                    <textarea
                      className="admin-input admin-textarea admin-site-seo-textarea"
                      value={form.keywordsText}
                      rows={5}
                      placeholder={'content credits used\nAI content activity\nContent AI usage'}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, keywordsText: event.target.value } : current,
                        )
                      }
                    />
                    <p className="admin-site-seo-help">
                      {preview.keywords.length} keyword{preview.keywords.length === 1 ? '' : 's'}{' '}
                      configured
                    </p>
                  </label>
                </div>
              </section>

              <section className="admin-site-seo-section">
                <div className="admin-site-seo-section-head">
                  <h3>Open Graph</h3>
                  <p>Social sharing metadata for link previews on Facebook, LinkedIn, and others.</p>
                </div>
                <div className="admin-form-grid admin-site-seo-form-grid">
                  <label className="admin-field">
                    <span>OG type</span>
                    <select
                      className="admin-input"
                      value={form.ogType}
                      onChange={(event) =>
                        setForm((current) =>
                          current
                            ? { ...current, ogType: event.target.value as FormState['ogType'] }
                            : current,
                        )
                      }
                    >
                      <option value="website">website</option>
                      <option value="article">article</option>
                    </select>
                  </label>

                  <label className="admin-field admin-field--wide">
                    <span>OG image URL</span>
                    <input
                      className="admin-input"
                      value={form.ogImage}
                      placeholder="https://example.com/og-image.jpg"
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, ogImage: event.target.value } : current,
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="admin-site-seo-section">
                <div className="admin-site-seo-section-head">
                  <h3>Structured data</h3>
                  <p>JSON-LD schema blocks injected in the page head when saved.</p>
                </div>
                <div className="admin-form-grid admin-site-seo-form-grid">
                  <label className="admin-field admin-field--wide">
                    <span>Schema types (comma separated)</span>
                    <input
                      className="admin-input"
                      value={form.schemaTypesText}
                      placeholder="BreadcrumbList, WebPage"
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, schemaTypesText: event.target.value } : current,
                        )
                      }
                    />
                  </label>

                  <label className="admin-field admin-field--wide">
                    <span>Schema JSON-LD</span>
                    <textarea
                      className="admin-input admin-textarea admin-textarea--tall admin-site-seo-json"
                      value={form.schemaJsonText}
                      rows={14}
                      spellCheck={false}
                      placeholder={'[\n  {\n    "@context": "https://schema.org",\n    "@type": "WebPage",\n    "name": "Usage Dashboard"\n  }\n]'}
                      onChange={(event) =>
                        setForm((current) =>
                          current ? { ...current, schemaJsonText: event.target.value } : current,
                        )
                      }
                    />
                    <p className="admin-site-seo-help">
                      Leave empty to use breadcrumb schema from the page component.
                    </p>
                  </label>
                </div>
              </section>

              <section className="admin-site-seo-section">
                <div className="admin-site-seo-section-head">
                  <h3>Visibility</h3>
                  <p>Control whether admin values are used and if search engines should index this page.</p>
                </div>
                <div className="admin-site-seo-toggle-grid">
                  <div className="admin-payment-field-group admin-payment-field-group--toggle">
                    <label className="admin-switch-row">
                      <span className="admin-switch-label">Use admin SEO on public site</span>
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) =>
                          setForm((current) =>
                            current ? { ...current, isActive: event.target.checked } : current,
                          )
                        }
                      />
                    </label>
                    <p className="admin-site-seo-help">
                      When off, the site falls back to static defaults from code.
                    </p>
                  </div>

                  <div className="admin-payment-field-group admin-payment-field-group--toggle">
                    <label className="admin-switch-row">
                      <span className="admin-switch-label">Noindex (hide from search engines)</span>
                      <input
                        type="checkbox"
                        checked={form.noindex}
                        onChange={(event) =>
                          setForm((current) =>
                            current ? { ...current, noindex: event.target.checked } : current,
                          )
                        }
                      />
                    </label>
                    <p className="admin-site-seo-help">
                      Recommended for account and auth pages that should not appear in Google.
                    </p>
                  </div>
                </div>
              </section>

              <div className="admin-site-seo-edit-actions">
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  disabled={resetting}
                  onClick={() => void handleReset()}
                >
                  <FontAwesomeIcon icon={faArrowRotateLeft} aria-hidden="true" />
                  {resetting ? 'Resetting...' : 'Reset to defaults'}
                </button>
              </div>
            </form>
          </AdminContentCard>

          <aside className="admin-site-seo-preview-panel" aria-label="SEO previews">
            <div className="admin-site-seo-preview-card">
              <div className="admin-site-seo-preview-card-head">
                <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
                <div>
                  <h2>Search preview</h2>
                  <p>Approximate Google result appearance</p>
                </div>
              </div>
              <div className="admin-site-seo-serp">
                <p className="admin-site-seo-serp-title">{preview.title}</p>
                <p className="admin-site-seo-serp-url">{preview.displayUrl}</p>
                <p className="admin-site-seo-serp-desc">{preview.description}</p>
              </div>
            </div>

            <div className="admin-site-seo-preview-card">
              <div className="admin-site-seo-preview-card-head">
                <FontAwesomeIcon icon={faGlobe} aria-hidden="true" />
                <div>
                  <h2>Social preview</h2>
                  <p>Open Graph card for link sharing</p>
                </div>
              </div>
              <div className="admin-site-seo-og">
                {form.ogImage.trim() ? (
                  <div
                    className="admin-site-seo-og-image"
                    style={{ backgroundImage: `url(${form.ogImage.trim()})` }}
                  />
                ) : (
                  <div className="admin-site-seo-og-image admin-site-seo-og-image--empty">
                    No OG image set
                  </div>
                )}
                <div className="admin-site-seo-og-copy">
                  <p className="admin-site-seo-og-site">{preview.displayUrl}</p>
                  <p className="admin-site-seo-og-title">{preview.title}</p>
                  <p className="admin-site-seo-og-desc">{preview.description}</p>
                </div>
              </div>
            </div>

            <div className="admin-site-seo-preview-card">
              <div className="admin-site-seo-preview-card-head">
                <FontAwesomeIcon icon={faCode} aria-hidden="true" />
                <div>
                  <h2>Schema summary</h2>
                  <p>Structured data configured for this page</p>
                </div>
              </div>
              <dl className="admin-site-seo-schema-summary">
                <div>
                  <dt>Types</dt>
                  <dd>
                    {preview.schemaTypes.length > 0
                      ? preview.schemaTypes.join(', ')
                      : 'BreadcrumbList (fallback)'}
                  </dd>
                </div>
                <div>
                  <dt>JSON-LD blocks</dt>
                  <dd>{preview.schemaBlockCount > 0 ? preview.schemaBlockCount : 'Using page fallback'}</dd>
                </div>
                <div>
                  <dt>Index status</dt>
                  <dd>{form.noindex ? 'Noindex, nofollow' : 'Indexable'}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
