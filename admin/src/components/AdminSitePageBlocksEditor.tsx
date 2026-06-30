import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faArrowUp,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import type { SitePageBlock } from '../lib/api'
import { resolveContactSidebarFields } from '../data/contactSidebarDefaults'
import {
  SITE_PAGE_BLOCK_TYPES,
  createEmptyBlock,
  type SitePageBlockType,
} from '../lib/sitePageBlocks'

const SITE_PAGE_BLOCK_TYPE_OPTIONS = SITE_PAGE_BLOCK_TYPES

type AdminSitePageBlocksEditorProps = {
  pageKey: string
  blocks: SitePageBlock[]
  contentActive: boolean
  saving: boolean
  resetting: boolean
  onBlocksChange: (blocks: SitePageBlock[]) => void
  onContentActiveChange: (active: boolean) => void
  onSave: () => void
  onReset: () => void
}

function blockTypeLabel(type: SitePageBlockType): string {
  return SITE_PAGE_BLOCK_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type
}

function moveBlock(blocks: SitePageBlock[], index: number, direction: -1 | 1): SitePageBlock[] {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= blocks.length) return blocks
  const copy = [...blocks]
  const [item] = copy.splice(index, 1)
  copy.splice(nextIndex, 0, item)
  return copy
}

function updateBlock(blocks: SitePageBlock[], index: number, nextBlock: SitePageBlock): SitePageBlock[] {
  return blocks.map((block, blockIndex) => (blockIndex === index ? nextBlock : block))
}

function getCtaField(block: SitePageBlock, key: string) {
  const value = block[key]
  if (value && typeof value === 'object') {
    return value as { label: string; to: string }
  }
  return { label: '', to: '' }
}

function BlockFields({
  block,
  onChange,
}: {
  block: SitePageBlock
  onChange: (block: SitePageBlock) => void
}) {
  if (block.type === 'hero') {
    const primary = getCtaField(block, 'primaryButton')
    const secondary = getCtaField(block, 'secondaryButton')
    const checklist = Array.isArray(block.checklist) ? (block.checklist as string[]) : []

    return (
      <div className="admin-form-grid admin-site-seo-form-grid">
        <label className="admin-field">
          <span>Layout</span>
          <select
            className="admin-input"
            value={String(block.layout ?? 'marketing')}
            onChange={(event) => onChange({ ...block, layout: event.target.value })}
          >
            <option value="marketing">Marketing (no breadcrumb)</option>
            <option value="static">Static page (with breadcrumb)</option>
          </select>
        </label>
        {block.layout === 'static' ? (
          <label className="admin-field">
            <span>Breadcrumb label</span>
            <input
              className="admin-input"
              value={String(block.breadcrumb ?? '')}
              onChange={(event) => onChange({ ...block, breadcrumb: event.target.value })}
            />
          </label>
        ) : null}
        <label className="admin-field">
          <span>Eyebrow</span>
          <input
            className="admin-input"
            value={String(block.eyebrow ?? '')}
            onChange={(event) => onChange({ ...block, eyebrow: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Title</span>
          <input
            className="admin-input"
            value={String(block.title ?? '')}
            onChange={(event) => onChange({ ...block, title: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Lead</span>
          <textarea
            className="admin-input admin-textarea"
            rows={3}
            value={String(block.lead ?? '')}
            onChange={(event) => onChange({ ...block, lead: event.target.value })}
          />
        </label>
        <label className="admin-field">
          <span>Primary button label</span>
          <input
            className="admin-input"
            value={primary.label}
            onChange={(event) =>
              onChange({ ...block, primaryButton: { ...primary, label: event.target.value } })
            }
          />
        </label>
        <label className="admin-field">
          <span>Primary button link</span>
          <input
            className="admin-input"
            value={primary.to}
            onChange={(event) => onChange({ ...block, primaryButton: { ...primary, to: event.target.value } })}
          />
        </label>
        <label className="admin-field">
          <span>Secondary button label</span>
          <input
            className="admin-input"
            value={secondary.label}
            onChange={(event) =>
              onChange({ ...block, secondaryButton: { ...secondary, label: event.target.value } })
            }
          />
        </label>
        <label className="admin-field">
          <span>Secondary button link</span>
          <input
            className="admin-input"
            value={secondary.to}
            onChange={(event) =>
              onChange({ ...block, secondaryButton: { ...secondary, to: event.target.value } })
            }
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Checklist items (one per line)</span>
          <textarea
            className="admin-input admin-textarea"
            rows={3}
            value={checklist.join('\n')}
            onChange={(event) =>
              onChange({
                ...block,
                checklist: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Updated note (optional)</span>
          <input
            className="admin-input"
            value={String(block.updated ?? '')}
            onChange={(event) => onChange({ ...block, updated: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <label className="admin-switch-row">
            <span className="admin-switch-label">Show hero visual mockup (home page)</span>
            <input
              type="checkbox"
              checked={Boolean(block.showVisual)}
              onChange={(event) => onChange({ ...block, showVisual: event.target.checked })}
            />
          </label>
        </label>
      </div>
    )
  }

  if (block.type === 'section') {
    const paragraphs = Array.isArray(block.paragraphs) ? (block.paragraphs as string[]) : []
    const list = Array.isArray(block.list) ? (block.list as string[]) : []

    return (
      <div className="admin-form-grid admin-site-seo-form-grid">
        <label className="admin-field">
          <span>Eyebrow (optional)</span>
          <input
            className="admin-input"
            value={String(block.eyebrow ?? '')}
            onChange={(event) => onChange({ ...block, eyebrow: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Heading</span>
          <input
            className="admin-input"
            value={String(block.heading ?? '')}
            onChange={(event) => onChange({ ...block, heading: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Description (optional)</span>
          <textarea
            className="admin-input admin-textarea"
            rows={2}
            value={String(block.description ?? '')}
            onChange={(event) => onChange({ ...block, description: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Paragraphs (one per line)</span>
          <textarea
            className="admin-input admin-textarea"
            rows={5}
            value={paragraphs.join('\n')}
            onChange={(event) =>
              onChange({
                ...block,
                paragraphs: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>List items (one per line)</span>
          <textarea
            className="admin-input admin-textarea"
            rows={4}
            value={list.join('\n')}
            onChange={(event) =>
              onChange({
                ...block,
                list: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
      </div>
    )
  }

  if (block.type === 'statusList' || block.type === 'guideLinks') {
    return (
      <label className="admin-field admin-field--wide">
        <span>{block.type === 'statusList' ? 'Status items' : 'Guide links'} (JSON array)</span>
        <textarea
          className="admin-input admin-textarea admin-textarea--tall"
          rows={10}
          value={JSON.stringify(block.items ?? [], null, 2)}
          onChange={(event) => {
            try {
              const items = JSON.parse(event.target.value)
              onChange({ ...block, items })
            } catch {
              // allow invalid JSON while typing
            }
          }}
        />
      </label>
    )
  }

  if (
    block.type === 'stats' ||
    block.type === 'featureGrid' ||
    block.type === 'steps' ||
    block.type === 'serviceCards'
  ) {
    return (
      <>
        <div className="admin-form-grid admin-site-seo-form-grid">
          <label className="admin-field">
            <span>Eyebrow (optional)</span>
            <input
              className="admin-input"
              value={String(block.eyebrow ?? '')}
              onChange={(event) => onChange({ ...block, eyebrow: event.target.value })}
            />
          </label>
          <label className="admin-field admin-field--wide">
            <span>Heading</span>
            <input
              className="admin-input"
              value={String(block.heading ?? '')}
              onChange={(event) => onChange({ ...block, heading: event.target.value })}
            />
          </label>
          <label className="admin-field admin-field--wide">
            <span>Description</span>
            <textarea
              className="admin-input admin-textarea"
              rows={2}
              value={String(block.description ?? '')}
              onChange={(event) => onChange({ ...block, description: event.target.value })}
            />
          </label>
        </div>
        <label className="admin-field admin-field--wide">
          <span>Items (JSON array)</span>
          <textarea
            className="admin-input admin-textarea admin-textarea--tall"
            rows={12}
            value={JSON.stringify(block.items ?? [], null, 2)}
            onChange={(event) => {
              try {
                const items = JSON.parse(event.target.value)
                onChange({ ...block, items })
              } catch {
                // allow invalid JSON while typing
              }
            }}
          />
        </label>
      </>
    )
  }

  if (block.type === 'trustBand') {
    const items = Array.isArray(block.items) ? (block.items as string[]) : []
    return (
      <div className="admin-form-grid admin-site-seo-form-grid">
        <label className="admin-field admin-field--wide">
          <span>Label</span>
          <input
            className="admin-input"
            value={String(block.label ?? '')}
            onChange={(event) => onChange({ ...block, label: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Items (one per line)</span>
          <textarea
            className="admin-input admin-textarea"
            rows={4}
            value={items.join('\n')}
            onChange={(event) =>
              onChange({
                ...block,
                items: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
      </div>
    )
  }

  if (block.type === 'featuredSpotlight') {
    const features = Array.isArray(block.features) ? (block.features as string[]) : []
    const cta = getCtaField(block, 'cta')
    return (
      <div className="admin-form-grid admin-site-seo-form-grid">
        <label className="admin-field">
          <span>Eyebrow</span>
          <input
            className="admin-input"
            value={String(block.eyebrow ?? '')}
            onChange={(event) => onChange({ ...block, eyebrow: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Title</span>
          <input
            className="admin-input"
            value={String(block.title ?? '')}
            onChange={(event) => onChange({ ...block, title: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Description</span>
          <textarea
            className="admin-input admin-textarea"
            rows={3}
            value={String(block.description ?? '')}
            onChange={(event) => onChange({ ...block, description: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Features (one per line)</span>
          <textarea
            className="admin-input admin-textarea"
            rows={4}
            value={features.join('\n')}
            onChange={(event) =>
              onChange({
                ...block,
                features: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="admin-field">
          <span>CTA label</span>
          <input
            className="admin-input"
            value={cta.label}
            onChange={(event) => onChange({ ...block, cta: { ...cta, label: event.target.value } })}
          />
        </label>
        <label className="admin-field">
          <span>CTA link</span>
          <input
            className="admin-input"
            value={cta.to}
            onChange={(event) => onChange({ ...block, cta: { ...cta, to: event.target.value } })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Panel (JSON object, optional)</span>
          <textarea
            className="admin-input admin-textarea admin-textarea--tall"
            rows={8}
            value={JSON.stringify(block.panel ?? {}, null, 2)}
            onChange={(event) => {
              try {
                const panel = JSON.parse(event.target.value)
                onChange({ ...block, panel })
              } catch {
                // allow invalid JSON while typing
              }
            }}
          />
        </label>
      </div>
    )
  }

  if (block.type === 'pricingPlans') {
    return (
      <label className="admin-field admin-field--wide">
        <span>Pricing plans (JSON array)</span>
        <textarea
          className="admin-input admin-textarea admin-textarea--tall"
          rows={14}
          value={JSON.stringify(block.plans ?? [], null, 2)}
          onChange={(event) => {
            try {
              const plans = JSON.parse(event.target.value)
              onChange({ ...block, plans })
            } catch {
              // allow invalid JSON while typing
            }
          }}
        />
      </label>
    )
  }

  if (block.type === 'faqList') {
    return (
      <>
        <label className="admin-field admin-field--wide">
          <span>Heading</span>
          <input
            className="admin-input"
            value={String(block.heading ?? '')}
            onChange={(event) => onChange({ ...block, heading: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>FAQ categories (JSON array)</span>
          <textarea
            className="admin-input admin-textarea admin-textarea--tall"
            rows={14}
            value={JSON.stringify(block.categories ?? [], null, 2)}
            onChange={(event) => {
              try {
                const categories = JSON.parse(event.target.value)
                onChange({ ...block, categories })
              } catch {
                // allow invalid JSON while typing
              }
            }}
          />
        </label>
      </>
    )
  }

  if (block.type === 'contactForm') {
    return (
      <div className="admin-form-grid admin-site-seo-form-grid">
        <label className="admin-field admin-field--wide">
          <span>Form heading</span>
          <input className="admin-input" value={String(block.heading ?? '')} onChange={(event) => onChange({ ...block, heading: event.target.value })} />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Form description</span>
          <textarea className="admin-input admin-textarea" rows={2} value={String(block.description ?? '')} onChange={(event) => onChange({ ...block, description: event.target.value })} />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Submit note</span>
          <textarea className="admin-input admin-textarea" rows={2} value={String(block.note ?? '')} onChange={(event) => onChange({ ...block, note: event.target.value })} />
        </label>
        <label className="admin-field">
          <span>Submit button label</span>
          <input className="admin-input" value={String(block.submitLabel ?? '')} onChange={(event) => onChange({ ...block, submitLabel: event.target.value })} />
        </label>
      </div>
    )
  }

  if (block.type === 'contactSidebar') {
    const sidebar = resolveContactSidebarFields(block)

    return (
      <div className="admin-form-grid admin-site-seo-form-grid">
        <label className="admin-field admin-field--wide">
          <span>Contact methods (JSON array)</span>
          <textarea
            className="admin-input admin-textarea admin-textarea--tall"
            rows={12}
            value={JSON.stringify(sidebar.methods, null, 2)}
            onChange={(event) => {
              try {
                const nextMethods = JSON.parse(event.target.value)
                onChange({ ...block, methods: nextMethods })
              } catch {
                // allow invalid JSON while typing
              }
            }}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Help topics (one per line)</span>
          <textarea
            className="admin-input admin-textarea"
            rows={4}
            value={sidebar.reasons.join('\n')}
            onChange={(event) =>
              onChange({
                ...block,
                reasons: event.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Reasons heading</span>
          <input className="admin-input" value={sidebar.reasonsHeading} onChange={(event) => onChange({ ...block, reasonsHeading: event.target.value })} />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Accent card title</span>
          <input className="admin-input" value={sidebar.accentTitle} onChange={(event) => onChange({ ...block, accentTitle: event.target.value })} />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Accent card description</span>
          <textarea className="admin-input admin-textarea" rows={2} value={sidebar.accentDescription} onChange={(event) => onChange({ ...block, accentDescription: event.target.value })} />
        </label>
        <label className="admin-field">
          <span>Accent button label</span>
          <input className="admin-input" value={sidebar.accentButtonLabel} onChange={(event) => onChange({ ...block, accentButtonLabel: event.target.value })} />
        </label>
        <label className="admin-field">
          <span>Accent button link</span>
          <input className="admin-input" value={sidebar.accentButtonLink} onChange={(event) => onChange({ ...block, accentButtonLink: event.target.value })} />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Office note</span>
          <input className="admin-input" value={sidebar.officeNote} onChange={(event) => onChange({ ...block, officeNote: event.target.value })} />
        </label>
      </div>
    )
  }

  if (
    block.type === 'serviceOverview' ||
    block.type === 'serviceDetails' ||
    block.type === 'creditExamples' ||
    block.type === 'heroPanel' ||
    block.type === 'storyQuote' ||
    block.type === 'audienceGrid' ||
    block.type === 'timeline' ||
    block.type === 'statusBanner' ||
    block.type === 'statusMetrics' ||
    block.type === 'statusGroups' ||
    block.type === 'statusIncidents'
  ) {
    return (
      <label className="admin-field admin-field--wide">
        <span>Block data (JSON)</span>
        <textarea
          className="admin-input admin-textarea admin-textarea--tall"
          rows={16}
          value={JSON.stringify(block, null, 2)}
          onChange={(event) => {
            try {
              const nextBlock = JSON.parse(event.target.value) as SitePageBlock
              onChange({ ...nextBlock, id: block.id, type: block.type })
            } catch {
              // allow invalid JSON while typing
            }
          }}
        />
      </label>
    )
  }

  if (block.type === 'blogListing') {
    return (
      <div className="admin-form-grid admin-site-seo-form-grid">
        <label className="admin-field admin-field--wide">
          <span>Heading</span>
          <input
            className="admin-input"
            value={String(block.heading ?? '')}
            onChange={(event) => onChange({ ...block, heading: event.target.value })}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span>Description</span>
          <textarea
            className="admin-input admin-textarea"
            rows={2}
            value={String(block.description ?? '')}
            onChange={(event) => onChange({ ...block, description: event.target.value })}
          />
        </label>
        <p className="admin-site-seo-help admin-field--wide">
          Blog posts are loaded dynamically from the CMS when this block is rendered.
        </p>
      </div>
    )
  }

  if (block.type !== 'cta') {
    return null
  }

  const primary =
    block.primary && typeof block.primary === 'object'
      ? (block.primary as { label: string; to: string })
      : { label: '', to: '' }
  const secondary =
    block.secondary && typeof block.secondary === 'object'
      ? (block.secondary as { label: string; to: string })
      : undefined

  return (
    <div className="admin-form-grid admin-site-seo-form-grid">
      <label className="admin-field admin-field--wide">
        <span>Title</span>
        <input
          className="admin-input"
          value={String(block.title ?? '')}
          onChange={(event) => onChange({ ...block, title: event.target.value })}
        />
      </label>
      <label className="admin-field admin-field--wide">
        <span>Description</span>
        <textarea
          className="admin-input admin-textarea"
          rows={3}
          value={String(block.description ?? '')}
          onChange={(event) => onChange({ ...block, description: event.target.value })}
        />
      </label>
      <label className="admin-field">
        <span>Primary label</span>
        <input
          className="admin-input"
          value={primary.label}
          onChange={(event) => onChange({ ...block, primary: { ...primary, label: event.target.value } })}
        />
      </label>
      <label className="admin-field">
        <span>Primary link</span>
        <input
          className="admin-input"
          value={primary.to}
          onChange={(event) => onChange({ ...block, primary: { ...primary, to: event.target.value } })}
        />
      </label>
      <label className="admin-field">
        <span>Secondary label</span>
        <input
          className="admin-input"
          value={secondary?.label ?? ''}
          onChange={(event) =>
            onChange({
              ...block,
              secondary: event.target.value
                ? { label: event.target.value, to: secondary?.to ?? '/contact' }
                : undefined,
            })
          }
        />
      </label>
      <label className="admin-field">
        <span>Secondary link</span>
        <input
          className="admin-input"
          value={secondary?.to ?? ''}
          onChange={(event) =>
            onChange({
              ...block,
              secondary: secondary
                ? { ...secondary, to: event.target.value }
                : { label: 'Learn more', to: event.target.value },
            })
          }
        />
      </label>
    </div>
  )
}

export default function AdminSitePageBlocksEditor({
  pageKey,
  blocks,
  contentActive,
  saving,
  resetting,
  onBlocksChange,
  onContentActiveChange,
  onSave,
  onReset,
}: AdminSitePageBlocksEditorProps) {
  const [newBlockType, setNewBlockType] = useState<SitePageBlockType>('section')

  function handleAddBlock() {
    onBlocksChange([...blocks, createEmptyBlock(newBlockType, pageKey, blocks.length)])
  }

  return (
    <div className="admin-site-page-blocks-editor">
      <div className="admin-site-seo-toggle-grid">
        <div className="admin-payment-field-group admin-payment-field-group--toggle">
          <label className="admin-switch-row">
            <span className="admin-switch-label">Use block content on public site</span>
            <input
              type="checkbox"
              checked={contentActive}
              onChange={(event) => onContentActiveChange(event.target.checked)}
            />
          </label>
          <p className="admin-site-seo-help">
            When enabled, the website renders these blocks instead of the built-in static page code.
          </p>
        </div>
      </div>

      <div className="admin-site-blocks-toolbar">
        <label className="admin-field admin-site-blocks-add-field">
          <span>Add block</span>
          <select
            className="admin-input"
            value={newBlockType}
            onChange={(event) => setNewBlockType(event.target.value as SitePageBlockType)}
          >
            {SITE_PAGE_BLOCK_TYPE_OPTIONS.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={handleAddBlock}>
          <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
          Add block
        </button>
      </div>

      {blocks.length === 0 ? (
        <div className="admin-staff-empty">
          <p>No content blocks yet</p>
          <span>Add a hero block first, then sections, guide links, status list, or CTA blocks.</span>
        </div>
      ) : (
        <div className="admin-site-blocks-list">
          {blocks.map((block, index) => (
            <details key={block.id} className="admin-site-block-card" open={index === 0}>
              <summary>
                <span className="admin-site-block-card-title">
                  {index + 1}. {blockTypeLabel(block.type as SitePageBlockType)}
                </span>
                <span className="admin-site-block-card-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    aria-label="Move block up"
                    disabled={index === 0}
                    onClick={(event) => {
                      event.preventDefault()
                      onBlocksChange(moveBlock(blocks, index, -1))
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowUp} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    aria-label="Move block down"
                    disabled={index === blocks.length - 1}
                    onClick={(event) => {
                      event.preventDefault()
                      onBlocksChange(moveBlock(blocks, index, 1))
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowDown} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--danger"
                    aria-label="Delete block"
                    onClick={(event) => {
                      event.preventDefault()
                      onBlocksChange(blocks.filter((_, blockIndex) => blockIndex !== index))
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" />
                  </button>
                </span>
              </summary>
              <div className="admin-site-block-card-body">
                <BlockFields
                  block={block}
                  onChange={(nextBlock) => onBlocksChange(updateBlock(blocks, index, nextBlock))}
                />
              </div>
            </details>
          ))}
        </div>
      )}

      <div className="admin-site-seo-edit-actions">
        <button type="button" className="admin-btn admin-btn--primary" disabled={saving} onClick={onSave}>
          {saving ? 'Saving...' : 'Save content blocks'}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={resetting}
          onClick={onReset}
        >
          {resetting ? 'Resetting...' : 'Reset content to defaults'}
        </button>
      </div>
    </div>
  )
}
