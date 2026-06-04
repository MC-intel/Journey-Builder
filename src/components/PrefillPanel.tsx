import type { FormField, FormNode } from '../domain/graph/graphTypes'
import type { PrefillSource } from '../domain/prefill/prefillTypes'
import { FieldMappingRow } from './FieldMappingRow'

type PrefillPanelProps = {
  form: FormNode
  getMapping: (fieldId: string) => PrefillSource | undefined
  onSelectField: (field: FormField) => void
  onClearField: (field: FormField) => void
}

/** Shows the selected form's fields and their prefill mappings. */
export function PrefillPanel({
  form,
  getMapping,
  onSelectField,
  onClearField,
}: PrefillPanelProps) {
  return (
    <section className="prefill-panel" aria-label={`Fields for ${form.name}`}>
      <h2 className="section-heading">
        {form.name}
        <span className="section-subheading">Field prefill mappings</span>
      </h2>

      {form.fieldSchema.length === 0 ? (
        <p className="empty-state">This form has no fields.</p>
      ) : (
        <ul className="field-rows">
          {form.fieldSchema.map((field) => (
            <FieldMappingRow
              key={field.id}
              field={field}
              mapping={getMapping(field.id)}
              onSelectSource={() => onSelectField(field)}
              onClearSource={() => onClearField(field)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
