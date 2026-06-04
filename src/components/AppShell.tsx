import type { ReactNode } from 'react'

/** Page chrome: title bar plus a centered content area. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Journey Builder Prefill</h1>
        <p className="app-subtitle">
          Map form fields to upstream sources across the workflow graph.
        </p>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
