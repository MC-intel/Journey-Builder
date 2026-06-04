/**
 * Shared test fixtures.
 *
 * `rawBlueprintFixture` is a minimal but realistic raw API payload. It
 * deliberately includes a node whose `component_id` has no matching form, so
 * tests can assert the adapter degrades gracefully.
 */
import type { RawBlueprintGraphResponse } from '../api/blueprintTypes'
import type { FormNode, GraphEdge } from '../domain/graph/graphTypes'
import type { PrefillSourceContext } from '../domain/prefill/prefillTypes'

export const rawBlueprintFixture: RawBlueprintGraphResponse = {
  id: 'bp_test',
  tenant_id: 'tenant_test',
  name: 'Test Blueprint',
  nodes: [
    {
      id: 'form-a',
      type: 'form',
      data: {
        id: 'node-a',
        component_key: 'form-a',
        component_type: 'form',
        component_id: 'f_a',
        name: 'Form A',
        prerequisites: [],
      },
    },
    {
      id: 'form-b',
      type: 'form',
      data: {
        id: 'node-b',
        component_key: 'form-b',
        component_type: 'form',
        component_id: 'f_b',
        name: 'Form B',
        prerequisites: ['form-a'],
      },
    },
    {
      // Intentionally references a missing form to test graceful degradation.
      id: 'form-orphan',
      type: 'form',
      data: {
        id: 'node-orphan',
        component_key: 'form-orphan',
        component_type: 'form',
        component_id: 'f_missing',
        name: 'Orphan Form',
        prerequisites: [],
      },
    },
  ],
  edges: [{ source: 'form-a', target: 'form-b' }],
  forms: [
    {
      id: 'f_a',
      name: 'Form A',
      field_schema: {
        type: 'object',
        properties: {
          email: { type: 'string', avantos_type: 'email', title: 'Email' },
          // No title -> adapter should fall back to the property key.
          first_name: { type: 'string', avantos_type: 'short-text' },
        },
        required: ['email'],
      },
    },
    {
      id: 'f_b',
      name: 'Form B',
      field_schema: {
        type: 'object',
        properties: {
          phone: { type: 'string', avantos_type: 'short-text', title: 'Phone' },
        },
      },
    },
  ],
}

/**
 * A normalized graph for provider/UI tests, encoding the canonical DAG:
 *
 *   A -> B -> D
 *   A -> C -> D
 *   E -> D
 */
export const normalizedForms: FormNode[] = [
  {
    id: 'A',
    name: 'Form A',
    fieldSchema: [
      { id: 'email', name: 'Email', type: 'email' },
      { id: 'company', name: 'Company', type: 'short-text' },
    ],
  },
  {
    id: 'B',
    name: 'Form B',
    fieldSchema: [
      { id: 'email', name: 'Email', type: 'email' },
      { id: 'first_name', name: 'First Name', type: 'short-text' },
    ],
  },
  {
    id: 'C',
    name: 'Form C',
    fieldSchema: [{ id: 'phone', name: 'Phone', type: 'short-text' }],
  },
  {
    id: 'D',
    name: 'Form D',
    fieldSchema: [
      { id: 'email', name: 'Email', type: 'email' },
      { id: 'notes', name: 'Notes', type: 'multi-line-text' },
    ],
  },
  {
    id: 'E',
    name: 'Form E',
    fieldSchema: [{ id: 'account_id', name: 'Account ID', type: 'short-text' }],
  },
]

export const normalizedEdges: GraphEdge[] = [
  { source: 'A', target: 'B' },
  { source: 'A', target: 'C' },
  { source: 'B', target: 'D' },
  { source: 'C', target: 'D' },
  { source: 'E', target: 'D' },
]

const formsById = Object.fromEntries(
  normalizedForms.map((form) => [form.id, form]),
)

/** Build a provider context for a given selected form. */
export const buildContext = (selectedFormId: string): PrefillSourceContext => ({
  selectedFormId,
  formsById,
  edges: normalizedEdges,
})
