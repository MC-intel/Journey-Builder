/**
 * Adapts the raw `action-blueprint-graph-get` response into the app's clean
 * `BlueprintGraph`. This is the only place that understands the raw shape.
 */
import type {
  BlueprintGraph,
  FormField,
  FormNode,
  GraphEdge,
} from '../domain/graph/graphTypes'
import type {
  RawBlueprintGraphResponse,
  RawEdge,
  RawFieldSchema,
  RawForm,
  RawNode,
} from './blueprintTypes'

/** Turn a form's JSON-schema `properties` map into an ordered field list. */
const toFormFields = (schema: RawFieldSchema | undefined): FormField[] => {
  if (!schema?.properties) return []

  return Object.entries(schema.properties).map(([fieldId, property]) => ({
    id: fieldId,
    name: property.title ?? fieldId,
    type: property.avantos_type ?? property.type,
  }))
}

/** Resolve a node to its normalized form, pulling fields from its linked form. */
const toFormNode = (
  node: RawNode,
  formsByComponentId: Record<string, RawForm>,
): FormNode => {
  const linkedForm = formsByComponentId[node.data.component_id]

  return {
    id: node.id,
    name: node.data.name,
    fieldSchema: toFormFields(linkedForm?.field_schema),
  }
}

const toGraphEdge = (edge: RawEdge): GraphEdge => ({
  source: edge.source,
  target: edge.target,
})

const indexFormsByComponentId = (
  forms: RawForm[],
): Record<string, RawForm> => {
  const index: Record<string, RawForm> = {}
  for (const form of forms) {
    index[form.id] = form
  }
  return index
}

/** Narrowing guard so callers fail loud on an unexpected payload. */
export const isRawBlueprintGraphResponse = (
  value: unknown,
): value is RawBlueprintGraphResponse => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<RawBlueprintGraphResponse>
  return (
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges) &&
    Array.isArray(candidate.forms)
  )
}

/** Normalize a raw response into the internal `BlueprintGraph`. */
export const normalizeBlueprintGraph = (
  raw: RawBlueprintGraphResponse,
): BlueprintGraph => {
  const formsByComponentId = indexFormsByComponentId(raw.forms)

  return {
    forms: raw.nodes.map((node) => toFormNode(node, formsByComponentId)),
    edges: raw.edges.map(toGraphEdge),
  }
}
