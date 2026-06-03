/**
 * Prefill domain types.
 *
 * A `PrefillOption` is the normalized, source-agnostic shape every provider
 * emits. A `PrefillSource` is the concrete choice a user committed to for a
 * field. Keeping these separate means the UI renders options uniformly and
 * never has to branch on where an option came from.
 */
import type { FormNode, GraphEdge } from '../graph/graphTypes'

/**
 * A selectable prefill source, normalized across all providers. The source
 * picker renders these without knowing or caring about their origin.
 */
export type PrefillOption = {
  /** Unique within a provider's output (e.g. "formNodeId.fieldId"). */
  id: string
  /** Which provider produced this option. */
  providerId: string
  /** What the user sees in the picker. */
  label: string
  /** Dot path describing where the value resolves from at runtime. */
  valuePath: string
  /** Optional sub-grouping within a provider section (e.g. a form name). */
  groupLabel?: string
  /** Provider-specific extra data (e.g. formId/fieldId). */
  metadata?: Record<string, unknown>
}

/** The source a user committed to for a specific target field. */
export type PrefillSource = {
  providerId: string
  /** Identifies the chosen option within its provider. */
  sourceId: string
  label: string
  valuePath: string
  metadata?: Record<string, unknown>
}

/** A resolved mapping from a target field to its prefill source. */
export type PrefillMapping = {
  targetFormId: string
  targetFieldId: string
  source: PrefillSource
}

/** Read-only context handed to every provider when computing its options. */
export type PrefillSourceContext = {
  selectedFormId: string
  formsById: Record<string, FormNode>
  edges: GraphEdge[]
}

/**
 * A pluggable prefill source. New source types (CRM, user profile, org
 * properties, …) are added by implementing this and registering it — no UI
 * changes required.
 */
export type PrefillSourceProvider = {
  id: string
  label: string
  getOptions: (context: PrefillSourceContext) => PrefillOption[]
}
