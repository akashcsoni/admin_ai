import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faListUl,
  faPen,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { ApiError, autoBlogApi, type CategoryConcept } from '../../../../lib/api'
import { useAuth } from '../../../../context/AuthContext'
import type { AutoBlogCategory, AutoBlogSettings } from './autoBlog.types'
import PromptShortcodeReference from './PromptShortcodeReference'
import { DEFAULT_CATEGORY_PROMPT } from './promptShortcodes'

type AutoBlogCategoriesTabProps = {
  settings: AutoBlogSettings | null
}

type CategoryDraft = {
  name: string
  description: string
  prompt: string
  enabled: boolean
}

const emptyDraft = (): CategoryDraft => ({
  name: '',
  description: '',
  prompt: '',
  enabled: true,
})

export default function AutoBlogCategoriesTab({ settings }: AutoBlogCategoriesTabProps) {
  const { token } = useAuth()
  const [categories, setCategories] = useState<AutoBlogCategory[]>([])
  const [drafts, setDrafts] = useState<Record<string, CategoryDraft>>({})
  const [newCategory, setNewCategory] = useState<CategoryDraft>(emptyDraft())
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [concepts, setConcepts] = useState<CategoryConcept[]>([])
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  const [importingConcept, setImportingConcept] = useState(false)
  const [categoryView, setCategoryView] = useState<'table' | 'accordion'>('table')
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasApiKey = settings?.hasApiKey ?? false
  const isActive = settings?.enabled ?? false

  const loadCategories = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const response = await autoBlogApi.listCategories(token)
      setCategories(response.categories)
      setDrafts(
        Object.fromEntries(
          response.categories.map((category) => [
            category.id,
            {
              name: category.name,
              description: category.description,
              prompt: category.prompt,
              enabled: category.enabled,
            },
          ]),
        ),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to load categories')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    async function loadConcepts() {
      if (!token) return

      try {
        const response = await autoBlogApi.listCategoryConcepts(token)
        setConcepts(response.concepts)
      } catch {
        // Non-blocking — manual category create still works
      }
    }

    void loadConcepts()
  }, [token])

  const selectedConcept = concepts.find((concept) => concept.id === selectedConceptId) ?? null

  function flashSuccess(message: string) {
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 2500)
  }

  function updateDraft(categoryId: string, patch: Partial<CategoryDraft>) {
    setDrafts((current) => ({
      ...current,
      [categoryId]: { ...current[categoryId], ...patch },
    }))
  }

  async function handleSaveCategory(categoryId: string) {
    if (!token) return

    const draft = drafts[categoryId]
    if (!draft?.name.trim()) return

    setSavingId(categoryId)
    setError('')

    try {
      await autoBlogApi.updateCategory(token, categoryId, {
        name: draft.name.trim(),
        description: draft.description.trim(),
        prompt: draft.prompt.trim(),
        enabled: draft.enabled,
      })
      await loadCategories()
      flashSuccess('Category saved')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save category')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!token) return

    setError('')
    try {
      await autoBlogApi.deleteCategory(token, categoryId)
      await loadCategories()
      flashSuccess('Category deleted')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to delete category')
    }
  }

  async function handleCreateCategory() {
    if (!token || !newCategory.name.trim()) return

    setCreating(true)
    setError('')

    try {
      await autoBlogApi.createCategory(token, {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        prompt: newCategory.prompt.trim(),
        enabled: newCategory.enabled,
      })
      setNewCategory(emptyDraft())
      await loadCategories()
      flashSuccess('Category created')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to create category')
    } finally {
      setCreating(false)
    }
  }

  async function handleImportConcept() {
    if (!token || !selectedConceptId) return

    setImportingConcept(true)
    setError('')

    try {
      const response = await autoBlogApi.importCategoryConcept(token, {
        conceptId: selectedConceptId,
        count: 10,
      })
      await loadCategories()
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to import categories')
    } finally {
      setImportingConcept(false)
    }
  }

  async function handleGenerateTopics(categoryId: string) {
    if (!token) return

    setGeneratingId(categoryId)
    setError('')

    try {
      const response = await autoBlogApi.generateTopics(token, { count: 10, categoryId })
      await loadCategories()
      flashSuccess(response.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to generate topics')
    } finally {
      setGeneratingId(null)
    }
  }

  function openCategoryEditor(categoryId: string) {
    setCategoryView('accordion')
    setOpenCategoryId(categoryId)
  }

  function renderCategoryEditor(category: AutoBlogCategory) {
    const draft = drafts[category.id]
    if (!draft) return null

    return (
      <details
        key={category.id}
        className="service-settings-section service-settings-section--nested"
        open={openCategoryId === category.id}
        onToggle={(event) => {
          const details = event.currentTarget
          setOpenCategoryId(details.open ? category.id : null)
        }}
      >
        <summary>
          <span className="service-settings-section-summary-main">
            <span className="service-settings-section-title">{draft.name || category.name}</span>
            <span className="service-settings-section-meta">
              {draft.enabled ? 'Active' : 'Inactive'} · {category.pendingTopicCount} pending ·{' '}
              {category.topicCount} topics
            </span>
          </span>
        </summary>

        <div className="service-settings-section-body">
          <div className="service-settings-field-group">
            <p className="service-settings-field-group-title">Category details</p>
            <div className="service-settings-grid">
              <label htmlFor={`category-name-${category.id}`}>
                Name
                <input
                  id={`category-name-${category.id}`}
                  type="text"
                  value={draft.name}
                  onChange={(event) => updateDraft(category.id, { name: event.target.value })}
                />
              </label>

              <label htmlFor={`category-description-${category.id}`}>
                Description
                <input
                  id={`category-description-${category.id}`}
                  type="text"
                  value={draft.description}
                  onChange={(event) => updateDraft(category.id, { description: event.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="service-settings-field-group">
            <p className="service-settings-field-group-title">Content prompt</p>
            <label htmlFor={`category-prompt-${category.id}`}>
              Prompt instructions
              <textarea
                id={`category-prompt-${category.id}`}
                rows={5}
                value={draft.prompt}
                onChange={(event) => updateDraft(category.id, { prompt: event.target.value })}
                placeholder={DEFAULT_CATEGORY_PROMPT}
              />
              <span className="service-field-hint">
                Shortcodes: {'{category_name}'}, {'{current_year}'}, {'{topic_niche}'}
              </span>
            </label>

            <div className="service-settings-actions service-settings-actions--inline service-settings-actions--group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => updateDraft(category.id, { prompt: DEFAULT_CATEGORY_PROMPT })}
              >
                Restore default prompt
              </button>
            </div>
          </div>

          <div className="service-settings-field-group service-settings-field-group--toggle">
            <label className="service-toggle-row">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(event) => updateDraft(category.id, { enabled: event.target.checked })}
              />
              <span className="service-toggle-label">Category active</span>
            </label>
          </div>

          <div className="service-settings-actions service-settings-actions--footer">
            <button
              type="button"
              className="btn btn-primary"
              disabled={savingId === category.id}
              onClick={() => void handleSaveCategory(category.id)}
            >
              {savingId === category.id ? 'Saving...' : 'Save category'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!hasApiKey || !isActive || generatingId === category.id}
              onClick={() => void handleGenerateTopics(category.id)}
            >
              {generatingId === category.id ? 'Generating...' : 'Generate 10 topics'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void handleDeleteCategory(category.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </details>
    )
  }

  return (
    <div className="service-tab-panel">
      <div className="service-tab-toolbar">
        <div>
          <h2>Categories</h2>
          <p>
            Each category has its own content prompt. Topics and blog posts use that prompt when
            assigned to the category.
          </p>
        </div>
      </div>

      {error && <p className="service-workspace-alert service-workspace-alert--warning">{error}</p>}
      {success && <p className="service-workspace-alert service-workspace-alert--success">{success}</p>}

      {!hasApiKey && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Add your AI API key in <Link to="?tab=settings">Settings</Link> before generating topics.
        </p>
      )}

      {settings && !settings.enabled && (
        <p className="service-workspace-alert service-workspace-alert--warning">
          Auto blog is inactive. Activate it on the Topic queue tab to generate category topics or import packs.
        </p>
      )}

      <div className="service-settings-accordion service-settings-accordion--categories">
        <details className="service-settings-section">
          <summary>
            <span className="service-settings-section-summary-main">
              <span className="service-settings-section-title">Import category pack</span>
              <span className="service-settings-section-meta">
                {selectedConcept
                  ? `${selectedConcept.label} · 10 categories`
                  : `${concepts.length || 26} concepts`}
              </span>
            </span>
          </summary>

          <div className="service-settings-section-body">
            <div className="service-settings-field-group">
              <p className="service-settings-field-group-title">Site concept</p>
              <p className="service-field-hint service-category-import-hint">
                AI creates 10 categories with prompts using your niche and language from Settings.
              </p>

              <div className="service-concept-grid service-concept-grid--compact">
                {concepts.map((concept) => (
                  <button
                    key={concept.id}
                    type="button"
                    title={concept.description}
                    className={`service-concept-chip${selectedConceptId === concept.id ? ' is-selected' : ''}`}
                    onClick={() => setSelectedConceptId(concept.id)}
                  >
                    {concept.label}
                  </button>
                ))}
              </div>

              {selectedConcept && (
                <p className="service-category-concept-selected">{selectedConcept.description}</p>
              )}

              <div className="service-settings-actions service-settings-actions--inline service-settings-actions--group">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selectedConceptId || importingConcept || !hasApiKey || !isActive}
                  onClick={() => void handleImportConcept()}
                >
                  {importingConcept ? 'Importing...' : 'Import 10 categories'}
                </button>
              </div>
            </div>
          </div>
        </details>

        <details className="service-settings-section service-settings-section--add">
          <summary>
            <span className="service-settings-section-summary-main">
              <span className="service-settings-section-title">Add category</span>
              <span className="service-settings-section-meta">Manual setup</span>
            </span>
          </summary>

          <div className="service-settings-section-body">
            <div className="service-settings-field-group">
              <p className="service-settings-field-group-title">Category details</p>
              <div className="service-settings-grid">
                <label htmlFor="new-category-name">
                  Name
                  <input
                    id="new-category-name"
                    type="text"
                    value={newCategory.name}
                    onChange={(event) => setNewCategory((current) => ({ ...current, name: event.target.value }))}
                    placeholder="e.g. SEO Tips"
                  />
                </label>

                <label htmlFor="new-category-description">
                  Description
                  <input
                    id="new-category-description"
                    type="text"
                    value={newCategory.description}
                    onChange={(event) =>
                      setNewCategory((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Short summary for this category"
                  />
                </label>
              </div>
            </div>

            <div className="service-settings-field-group">
              <p className="service-settings-field-group-title">Content prompt</p>
              <label htmlFor="new-category-prompt">
                Prompt instructions
                <textarea
                  id="new-category-prompt"
                  rows={4}
                  value={newCategory.prompt}
                  onChange={(event) => setNewCategory((current) => ({ ...current, prompt: event.target.value }))}
                  placeholder={DEFAULT_CATEGORY_PROMPT}
                />
                <span className="service-field-hint">
                  Shortcodes: {'{category_name}'}, {'{current_year}'}, {'{topic_niche}'}
                </span>
              </label>

              <PromptShortcodeReference title="Shortcodes for category prompts" />

              <div className="service-settings-actions service-settings-actions--inline service-settings-actions--group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setNewCategory((current) => ({ ...current, prompt: DEFAULT_CATEGORY_PROMPT }))
                  }
                >
                  Use default prompt
                </button>
              </div>
            </div>

            <div className="service-settings-field-group service-settings-field-group--toggle">
              <label className="service-toggle-row">
                <input
                  type="checkbox"
                  checked={newCategory.enabled}
                  onChange={(event) =>
                    setNewCategory((current) => ({ ...current, enabled: event.target.checked }))
                  }
                />
                <span className="service-toggle-label">Category active</span>
              </label>
            </div>

            <div className="service-settings-actions service-settings-actions--footer">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!newCategory.name.trim() || creating}
                onClick={() => void handleCreateCategory()}
              >
                {creating ? 'Creating...' : 'Create category'}
              </button>
            </div>
          </div>
        </details>

      {loading ? (
        <p className="service-empty-state-hint service-settings-accordion-empty">Loading categories...</p>
      ) : (
        <details className="service-settings-section service-settings-section--catalog" open={categories.length > 0}>
          <summary>
            <span className="service-settings-section-summary-main">
              <span className="service-settings-section-title">All categories</span>
              <span className="service-settings-section-meta">
                {categories.length === 0
                  ? 'No categories yet'
                  : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
              </span>
            </span>
          </summary>

          <div className="service-settings-section-body">
            {categories.length === 0 ? (
              <div className="service-empty-state service-empty-state--compact">
                <h3>No categories yet</h3>
                <p>Import a pack or add a category above, then manage them here.</p>
              </div>
            ) : (
              <>
                <div className="service-category-view-toolbar">
                  <div className="service-category-view-toggle" role="tablist" aria-label="Category view">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={categoryView === 'table'}
                      className={categoryView === 'table' ? 'active' : ''}
                      onClick={() => setCategoryView('table')}
                    >
                      Table
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={categoryView === 'accordion'}
                      className={categoryView === 'accordion' ? 'active' : ''}
                      onClick={() => setCategoryView('accordion')}
                    >
                      List accordion
                    </button>
                  </div>
                  <span className="service-field-hint">
                    {categoryView === 'table'
                      ? 'Overview of all categories. Click Edit to open the list accordion.'
                      : 'Expand a category to edit details and prompts.'}
                  </span>
                </div>

                {categoryView === 'table' ? (
                  <div className="service-blog-table-wrap">
                    <table className="service-blog-table service-category-table">
                      <thead>
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Description</th>
                          <th scope="col">Status</th>
                          <th scope="col">Topics</th>
                          <th scope="col">Pending</th>
                          <th scope="col">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category.id}>
                            <td className="service-category-table-name">{category.name}</td>
                            <td className="service-blog-meta service-category-table-desc">
                              {category.description || '—'}
                            </td>
                            <td>
                              <span
                                className={`service-blog-status ${
                                  category.enabled
                                    ? 'service-blog-status--published'
                                    : 'service-blog-status--used'
                                }`}
                              >
                                {category.enabled ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="service-blog-meta">{category.topicCount}</td>
                            <td className="service-blog-meta">{category.pendingTopicCount}</td>
                            <td>
                              <div className="service-table-actions">
                                <button
                                  type="button"
                                  className="service-table-action service-table-action--primary"
                                  onClick={() => openCategoryEditor(category.id)}
                                >
                                  <FontAwesomeIcon icon={faPen} aria-hidden="true" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="service-table-action"
                                  disabled={!hasApiKey || !isActive || generatingId === category.id}
                                  onClick={() => void handleGenerateTopics(category.id)}
                                >
                                  <FontAwesomeIcon
                                    icon={generatingId === category.id ? faSpinner : faListUl}
                                    spin={generatingId === category.id}
                                    aria-hidden="true"
                                  />
                                  {generatingId === category.id ? 'Generating...' : 'Topics'}
                                </button>
                                <button
                                  type="button"
                                  className="service-table-action"
                                  onClick={() => void handleDeleteCategory(category.id)}
                                >
                                  <FontAwesomeIcon icon={faTrash} aria-hidden="true" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="service-category-accordion-list">
                    {categories.map((category) => renderCategoryEditor(category))}
                  </div>
                )}
              </>
            )}
          </div>
        </details>
      )}
      </div>
    </div>
  )
}
