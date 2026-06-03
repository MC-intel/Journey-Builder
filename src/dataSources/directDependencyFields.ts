/** Provider: fields from forms that connect directly into the selected form. */
import type { PrefillSourceProvider } from '../domain/prefill/prefillTypes'
import { getDirectParentIds } from '../domain/graph/graphTraversal'
import { buildFormFieldOptions } from './formFieldOptions'

const PROVIDER_ID = 'direct-form-fields'

export const directDependencyProvider: PrefillSourceProvider = {
  id: PROVIDER_ID,
  label: 'Direct Dependencies',
  getOptions: (context) => {
    const parentIds = getDirectParentIds(context.selectedFormId, context.edges)
    return buildFormFieldOptions(parentIds, context, PROVIDER_ID)
  },
}
