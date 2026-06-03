/** Convert a picked `PrefillOption` into the `PrefillSource` we persist. */
import type { PrefillOption, PrefillSource } from './prefillTypes'

export const optionToSource = (option: PrefillOption): PrefillSource => ({
  providerId: option.providerId,
  sourceId: option.id,
  label: option.label,
  valuePath: option.valuePath,
  metadata: option.metadata,
})
