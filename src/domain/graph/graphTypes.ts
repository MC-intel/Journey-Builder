/**
 * Internal, normalized graph types.
 *
 * These are the shapes the rest of the app depends on. The raw API response
 * (see `api/blueprintTypes.ts`) is adapted into these by `blueprintAdapter`,
 * so no raw API structure ever leaks past the API layer.
 */

/** A single field on a form. */
export type FormField = {
  /** Stable identifier, unique within its form (the JSON-schema property key). */
  id: string
  /** Human-readable label. */
  name: string
  /** Optional semantic type (e.g. "email", "short-text", "checkbox-group"). */
  type?: string
}

/** A form node in the DAG. */
export type FormNode = {
  /** Graph node id — this is what edges reference. */
  id: string
  /** Display name (e.g. "Form A"). */
  name: string
  /** The fields belonging to this form. */
  fieldSchema: FormField[]
}

/**
 * A directed edge. `source` is the upstream (prerequisite) node and `target`
 * is the downstream node, i.e. `source -> target` means "target depends on
 * source".
 */
export type GraphEdge = {
  source: string
  target: string
}

/** The fully normalized blueprint graph the app renders from. */
export type BlueprintGraph = {
  forms: FormNode[]
  edges: GraphEdge[]
}
