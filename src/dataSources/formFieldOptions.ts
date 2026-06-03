/**
 * Shared helper for providers that expose form fields as prefill options.
 *
 * Both the direct and transitive providers turn a set of upstream form ids into
 * normalized `PrefillOption`s — only the id-selection strategy differs — so the
 * mapping lives here once.
 */
import type {
  PrefillOption,
  PrefillSourceContext,
} from '../domain/prefill/prefillTypes'

export const buildFormFieldOptions = (
  formIds: string[],
  context: PrefillSourceContext,
  providerId: string,
): PrefillOption[] =>
  formIds.flatMap((formId) => {
    const form = context.formsById[formId]
    if (!form) return []

    return form.fieldSchema.map((field) => ({
      id: `${form.id}.${field.id}`,
      providerId,
      label: `${form.name} — ${field.name}`,
      valuePath: `forms.${form.id}.fields.${field.id}`,
      groupLabel: form.name,
      metadata: {
        formId: form.id,
        fieldId: field.id,
        fieldName: field.name,
      },
    }))
  })
