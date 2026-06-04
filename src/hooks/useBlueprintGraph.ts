/**
 * Loads the blueprint graph and exposes it as an explicit state machine:
 * loading -> ready | error. The `reload` function re-runs the fetch (used by
 * the error retry button).
 */
import { useCallback, useEffect, useState } from 'react'
import type { BlueprintGraph } from '../domain/graph/graphTypes'
import { fetchBlueprintGraph } from '../api/blueprintClient'

export type BlueprintGraphState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; graph: BlueprintGraph }

export const useBlueprintGraph = (): BlueprintGraphState & {
  reload: () => void
} => {
  const [state, setState] = useState<BlueprintGraphState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    fetchBlueprintGraph(controller.signal)
      .then((graph) => setState({ status: 'ready', graph }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      })

    return () => controller.abort()
  }, [attempt])

  return { ...state, reload }
}
