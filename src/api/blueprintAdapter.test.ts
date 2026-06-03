import { describe, it, expect } from 'vitest'
import {
  isRawBlueprintGraphResponse,
  normalizeBlueprintGraph,
} from './blueprintAdapter'
import { rawBlueprintFixture } from '../test/fixtures'

describe('normalizeBlueprintGraph', () => {
  const graph = normalizeBlueprintGraph(rawBlueprintFixture)

  it('produces one form node per graph node, keyed by node id', () => {
    expect(graph.forms.map((form) => form.id)).toEqual([
      'form-a',
      'form-b',
      'form-orphan',
    ])
  })

  it('uses the node display name, not the linked form id', () => {
    const formA = graph.forms.find((form) => form.id === 'form-a')
    expect(formA?.name).toBe('Form A')
  })

  it('flattens JSON-schema properties into a field list', () => {
    const formA = graph.forms.find((form) => form.id === 'form-a')
    expect(formA?.fieldSchema).toEqual([
      { id: 'email', name: 'Email', type: 'email' },
      { id: 'first_name', name: 'first_name', type: 'short-text' },
    ])
  })

  it('falls back to the property key when a field has no title', () => {
    const formA = graph.forms.find((form) => form.id === 'form-a')
    const firstName = formA?.fieldSchema.find((field) => field.id === 'first_name')
    expect(firstName?.name).toBe('first_name')
  })

  it('yields an empty field list when the node has no matching form', () => {
    const orphan = graph.forms.find((form) => form.id === 'form-orphan')
    expect(orphan?.fieldSchema).toEqual([])
  })

  it('preserves edges as source/target node-id pairs', () => {
    expect(graph.edges).toEqual([{ source: 'form-a', target: 'form-b' }])
  })

  it('does not leak raw API structures into the normalized graph', () => {
    const formA = graph.forms.find((form) => form.id === 'form-a')
    expect(formA).not.toHaveProperty('data')
    expect(formA).not.toHaveProperty('field_schema')
  })
})

describe('isRawBlueprintGraphResponse', () => {
  it('accepts a well-formed response', () => {
    expect(isRawBlueprintGraphResponse(rawBlueprintFixture)).toBe(true)
  })

  it('rejects null and non-objects', () => {
    expect(isRawBlueprintGraphResponse(null)).toBe(false)
    expect(isRawBlueprintGraphResponse('nope')).toBe(false)
  })

  it('rejects objects missing the required arrays', () => {
    expect(isRawBlueprintGraphResponse({ nodes: [], edges: [] })).toBe(false)
  })
})
