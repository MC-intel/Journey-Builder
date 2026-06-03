import { useMemo, useState } from 'react'
import type { BlueprintGraph, FormField } from '../domain/graph/graphTypes'
import type {
  PrefillSource,
  PrefillSourceContext,
} from '../domain/prefill/prefillTypes'
import { prefillSourceProviders } from '../dataSources'
import { usePrefillMappings } from '../hooks/usePrefillMappings'
import { FormList } from './FormList'
import { PrefillPanel } from './PrefillPanel'
import { SourcePickerModal } from './SourcePickerModal'

/**
 * The feature workspace: form selection on the left, the selected form's field
 * mappings on the right, and the source picker modal. All wiring lives here so
 * the leaf components stay presentational.
 */
export function PrefillWorkspace({ graph }: { graph: BlueprintGraph }) {
  const formsById = useMemo(
    () => Object.fromEntries(graph.forms.map((form) => [form.id, form])),
    [graph.forms],
  )

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const selectedFormId = selectedId ?? graph.forms[0]?.id
  const selectedForm = selectedFormId ? formsById[selectedFormId] : undefined

  const { setMapping, clearMapping, getMapping } = usePrefillMappings()
  const [pickerField, setPickerField] = useState<FormField | null>(null)

  const providerContext: PrefillSourceContext | undefined = selectedFormId
    ? { selectedFormId, formsById, edges: graph.edges }
    : undefined

  const selectField = (field: FormField) => setPickerField(field)

  const clearField = (field: FormField) => {
    if (selectedFormId) clearMapping(selectedFormId, field.id)
  }

  const pickSource = (source: PrefillSource) => {
    if (selectedFormId && pickerField) {
      setMapping(selectedFormId, pickerField.id, source)
    }
    setPickerField(null)
  }

  return (
    <div className="workspace">
      <FormList
        forms={graph.forms}
        selectedFormId={selectedFormId}
        onSelectForm={(id) => {
          setSelectedId(id)
          setPickerField(null)
        }}
      />

      {selectedForm ? (
        <PrefillPanel
          form={selectedForm}
          getMapping={(fieldId) => getMapping(selectedForm.id, fieldId)}
          onSelectField={selectField}
          onClearField={clearField}
        />
      ) : (
        <p className="empty-state">No forms in this blueprint.</p>
      )}

      {providerContext && (
        <SourcePickerModal
          isOpen={pickerField !== null}
          targetFieldLabel={pickerField?.name ?? ''}
          providers={prefillSourceProviders}
          context={providerContext}
          onSelect={pickSource}
          onClose={() => setPickerField(null)}
        />
      )}
    </div>
  )
}
