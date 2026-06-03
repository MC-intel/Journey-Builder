import type { FormField } from '../domain/graph/graphTypes'
import type { PrefillSource } from '../domain/prefill/prefillTypes'

type FieldMappingRowProps = {
  field: FormField
  mapping?: PrefillSource
  onSelectSource: () => void
  onClearSource: () => void
}

/** One field's row: its name, current mapping (if any), and actions. */
export function FieldMappingRow({
  field,
  mapping,
  onSelectSource,
  onClearSource,
}: FieldMappingRowProps) {
  const isMapped = Boolean(mapping)

  return (
    <li className="field-row">
      <div className="field-info">
        <span className="field-name">{field.name}</span>
        {field.type && <span className="field-type">{field.type}</span>}
      </div>

      <button
        type="button"
        className={`field-source${isMapped ? ' is-mapped' : ''}`}
        onClick={onSelectSource}
        title={isMapped ? 'Change prefill source' : 'Select prefill source'}
      >
        {isMapped ? mapping!.label : 'Not configured'}
      </button>

      {isMapped ? (
        <button
          type="button"
          className="field-action field-clear"
          onClick={onClearSource}
          aria-label={`Clear prefill source for ${field.name}`}
        >
          Clear
        </button>
      ) : (
        <button
          type="button"
          className="field-action"
          onClick={onSelectSource}
        >
          Select
        </button>
      )}
    </li>
  )
}
