/**
 * Raw `action-blueprint-graph-get` response types.
 *
 * These mirror the shape the Avantos mock server actually returns and are
 * intentionally messier than our internal model:
 *
 *  - Graph topology lives in `nodes` + `edges` (node ids look like
 *    "form-<uuid>").
 *  - Field definitions live in a *separate* `forms` array, keyed by a
 *    `component_id` that a node points at via `data.component_id`.
 *  - Fields are JSON-schema `properties` (a keyed object), not a list.
 *
 * Nothing outside the API layer should import these. `blueprintAdapter`
 * collapses them into the clean `BlueprintGraph`.
 */

/** A node's embedded metadata. */
export type RawNodeData = {
  id: string
  /** Matches the owning node's `id`. */
  component_key: string
  /** "form" for form nodes. */
  component_type: string
  /** Foreign key into the top-level `forms` array (`RawForm.id`). */
  component_id: string
  /** Display name, e.g. "Form A". */
  name: string
  /** Upstream node ids this node depends on. */
  prerequisites: string[]
  [extra: string]: unknown
}

/** A graph node. */
export type RawNode = {
  id: string
  type: string
  position?: { x: number; y: number }
  data: RawNodeData
}

/** A directed edge between node ids (`source -> target`). */
export type RawEdge = {
  source: string
  target: string
}

/** A single JSON-schema property describing one field. */
export type RawFieldProperty = {
  type?: string
  /** Avantos' semantic field type, e.g. "email", "checkbox-group". */
  avantos_type?: string
  title?: string
  [extra: string]: unknown
}

/** A form's field schema, keyed by field name. */
export type RawFieldSchema = {
  type: string
  properties: Record<string, RawFieldProperty>
  required?: string[]
}

/** A form definition (fields), referenced by nodes via `component_id`. */
export type RawForm = {
  id: string
  name: string
  field_schema: RawFieldSchema
  [extra: string]: unknown
}

/** The full response body. */
export type RawBlueprintGraphResponse = {
  id: string
  tenant_id?: string
  name?: string
  category?: string
  nodes: RawNode[]
  edges: RawEdge[]
  forms: RawForm[]
}
