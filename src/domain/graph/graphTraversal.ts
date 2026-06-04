/**
 * Pure graph-traversal utilities over `GraphEdge[]`.
 *
 * An edge `source -> target` means "target depends on source", so a node's
 * parents are the sources of edges pointing at it. All functions are defensive
 * against malformed cyclic data even though a blueprint is expected to be a DAG.
 */
import type { GraphEdge } from './graphTypes'

/** Build a child -> parents adjacency map once, for repeated lookups. */
const buildParentMap = (edges: GraphEdge[]): Map<string, string[]> => {
  const parentsByChild = new Map<string, string[]>()

  for (const { source, target } of edges) {
    const parents = parentsByChild.get(target) ?? []
    if (!parents.includes(source)) {
      parents.push(source)
    }
    parentsByChild.set(target, parents)
  }

  return parentsByChild
}

/** Immediate parents of a node (its direct dependencies). */
export const getDirectParentIds = (
  nodeId: string,
  edges: GraphEdge[],
): string[] => buildParentMap(edges).get(nodeId) ?? []

/**
 * Every upstream ancestor of a node, in breadth-first order. Visited tracking
 * makes this safe against cycles in malformed data.
 */
export const getAllAncestorIds = (
  nodeId: string,
  edges: GraphEdge[],
): string[] => {
  const parentsByChild = buildParentMap(edges)
  const ancestors: string[] = []
  const visited = new Set<string>([nodeId])
  const queue = [...(parentsByChild.get(nodeId) ?? [])]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue

    visited.add(current)
    ancestors.push(current)
    queue.push(...(parentsByChild.get(current) ?? []))
  }

  return ancestors
}

/**
 * Upstream ancestors excluding direct parents. This is the project's explicit
 * definition of "transitive": for `A -> B -> D`, D's transitive ancestor is A
 * (B is a direct parent, so it is excluded).
 */
export const getTransitiveAncestorIds = (
  nodeId: string,
  edges: GraphEdge[],
): string[] => {
  const directParents = new Set(getDirectParentIds(nodeId, edges))
  return getAllAncestorIds(nodeId, edges).filter(
    (ancestorId) => !directParents.has(ancestorId),
  )
}
