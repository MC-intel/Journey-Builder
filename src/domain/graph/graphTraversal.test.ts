import { describe, it, expect } from 'vitest'
import type { GraphEdge } from './graphTypes'
import {
  getAllAncestorIds,
  getDirectParentIds,
  getTransitiveAncestorIds,
} from './graphTraversal'

/**
 *   A -> B -> D
 *   A -> C -> D
 *   E -> D
 *
 * For D: direct parents = B, C, E; all ancestors = A, B, C, E; transitive = A.
 */
const edges: GraphEdge[] = [
  { source: 'A', target: 'B' },
  { source: 'A', target: 'C' },
  { source: 'B', target: 'D' },
  { source: 'C', target: 'D' },
  { source: 'E', target: 'D' },
]

const sorted = (ids: string[]) => [...ids].sort()

describe('getDirectParentIds', () => {
  it('returns immediate parents of a node', () => {
    expect(sorted(getDirectParentIds('D', edges))).toEqual(['B', 'C', 'E'])
  })

  it('returns an empty array for a node with no parents', () => {
    expect(getDirectParentIds('A', edges)).toEqual([])
  })
})

describe('getAllAncestorIds', () => {
  it('returns every upstream ancestor of a node', () => {
    expect(sorted(getAllAncestorIds('D', edges))).toEqual(['A', 'B', 'C', 'E'])
  })

  it('returns an empty array for a root node', () => {
    expect(getAllAncestorIds('A', edges)).toEqual([])
  })
})

describe('getTransitiveAncestorIds', () => {
  it('excludes direct parents, keeping only deeper ancestors', () => {
    expect(getTransitiveAncestorIds('D', edges)).toEqual(['A'])
  })

  it('returns an empty array when all ancestors are direct parents', () => {
    expect(getTransitiveAncestorIds('B', edges)).toEqual([])
  })
})

describe('cycle safety', () => {
  // Malformed: A -> B -> C -> A (a cycle) plus C -> D.
  const cyclic: GraphEdge[] = [
    { source: 'A', target: 'B' },
    { source: 'B', target: 'C' },
    { source: 'C', target: 'A' },
    { source: 'C', target: 'D' },
  ]

  it('terminates and does not repeat nodes when data is cyclic', () => {
    expect(sorted(getAllAncestorIds('D', cyclic))).toEqual(['A', 'B', 'C'])
  })
})
