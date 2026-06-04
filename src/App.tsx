import { AppShell } from './components/AppShell'
import { PrefillWorkspace } from './components/PrefillWorkspace'
import { useBlueprintGraph } from './hooks/useBlueprintGraph'

/** Top level: load the graph, then hand the ready graph to the workspace. */
export default function App() {
  const graph = useBlueprintGraph()

  return (
    <AppShell>
      {graph.status === 'loading' && (
        <p className="status-panel">Loading blueprint…</p>
      )}

      {graph.status === 'error' && (
        <div className="status-panel status-error">
          <p>Could not load the blueprint graph.</p>
          <p className="status-detail">{graph.message}</p>
          <button type="button" className="field-action" onClick={graph.reload}>
            Retry
          </button>
        </div>
      )}

      {graph.status === 'ready' && <PrefillWorkspace graph={graph.graph} />}
    </AppShell>
  )
}
