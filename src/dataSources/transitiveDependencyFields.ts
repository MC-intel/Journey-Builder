/** Provider: fields from upstream ancestors that are not direct parents. */
import type { PrefillSourceProvider } from '../domain/prefill/prefillTypes'
import { getTransitiveAncestorIds } from '../domain/graph/graphTraversal'
import { buildFormFieldOptions } from './formFieldOptions'

const PROVIDER_ID = 'transitive-form-fields'

export const transitiveDependencyProvider: PrefillSourceProvider = {
  id: PROVIDER_ID,
  label: 'Transitive Dependencies',
  getOptions: (context) => {
    const ancestorIds = getTransitiveAncestorIds(
      context.selectedFormId,
      context.edges,
    )
    return buildFormFieldOptions(ancestorIds, context, PROVIDER_ID)
  },
}
