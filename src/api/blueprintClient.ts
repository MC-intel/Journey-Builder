/**
 * Client for the mock `action-blueprint-graph-get` endpoint.
 *
 * Returns a normalized `BlueprintGraph` — callers never see the raw shape.
 *
 * The endpoint URL defaults to a bundled mock served from `public/` so the app
 * runs with no extra server. Point it at the real Avantos mock server by
 * setting `VITE_BLUEPRINT_URL` (see README).
 */
import type { BlueprintGraph } from '../domain/graph/graphTypes'
import {
  isRawBlueprintGraphResponse,
  normalizeBlueprintGraph,
} from './blueprintAdapter'

const DEFAULT_BLUEPRINT_URL = '/action-blueprint-graph-get.json'

const resolveBlueprintUrl = (): string =>
  import.meta.env.VITE_BLUEPRINT_URL ?? DEFAULT_BLUEPRINT_URL

/**
 * Fetch the blueprint graph and return it normalized.
 *
 * @param signal optional AbortSignal so callers (e.g. effects) can cancel.
 * @throws if the request fails or the payload isn't a blueprint response.
 */
export const fetchBlueprintGraph = async (
  signal?: AbortSignal,
): Promise<BlueprintGraph> => {
  const url = resolveBlueprintUrl()
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch blueprint graph: ${response.status} ${response.statusText}`,
    )
  }

  const payload: unknown = await response.json()

  if (!isRawBlueprintGraphResponse(payload)) {
    throw new Error('Unexpected blueprint graph response shape')
  }

  return normalizeBlueprintGraph(payload)
}
