import type { PrefillOption } from '../domain/prefill/prefillTypes'

type SourceSectionProps = {
  title: string
  options: PrefillOption[]
  onSelect: (option: PrefillOption) => void
}

/**
 * Renders a single provider's section of options. It knows nothing about where
 * the options came from — it just lists normalized `PrefillOption`s.
 */
export function SourceSection({ title, options, onSelect }: SourceSectionProps) {
  return (
    <section className="source-section">
      <h3 className="source-section-title">{title}</h3>
      {options.length === 0 ? (
        <p className="empty-state">No options available.</p>
      ) : (
        <ul className="source-options">
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="source-option"
                onClick={() => onSelect(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
