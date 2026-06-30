import { PROMPT_SHORTCODE_DEFINITIONS } from './promptShortcodes'

type PromptShortcodeReferenceProps = {
  title?: string
}

export default function PromptShortcodeReference({
  title = 'Dynamic shortcodes',
}: PromptShortcodeReferenceProps) {
  return (
    <details className="service-shortcode-reference">
      <summary className="service-shortcode-reference-summary">
        <span className="service-shortcode-reference-title">{title}</span>
        <span className="service-shortcode-reference-meta">
          {PROMPT_SHORTCODE_DEFINITIONS.length} placeholders
        </span>
      </summary>

      <div className="service-shortcode-reference-body">
        <p className="service-field-hint service-shortcode-reference-hint">
          Hover a tag for details. Replaced automatically when generating.
        </p>
        <div className="service-shortcode-grid service-shortcode-grid--compact">
          {PROMPT_SHORTCODE_DEFINITIONS.map((shortcode) => (
            <code
              key={shortcode.key}
              className="service-shortcode-chip"
              title={`${shortcode.label} · ${shortcode.description} · e.g. ${shortcode.example}`}
            >
              {`{${shortcode.key}}`}
            </code>
          ))}
        </div>
      </div>
    </details>
  )
}
