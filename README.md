# Journey Builder Prefill Challenge

A small React app for the Avantos Journey Builder challenge. It fetches a
blueprint DAG of forms, lets you pick a form, and configure where each field's
**prefill** value comes from — a direct dependency, a transitive ancestor, or
global data. New source types plug in without touching the UI.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # run the test suite once
npm run build    # typecheck + production build
```

The app ships with a bundled mock response (`public/action-blueprint-graph-get.json`),
so it runs with no extra server. To point at the real Avantos mock server,
set the endpoint:

```bash
VITE_BLUEPRINT_URL="http://localhost:3000/.../graph" npm run dev
```

## What it does

- Fetches the `action-blueprint-graph-get` response and **normalizes** it into clean domain types.
- Renders the forms as a list (no node canvas — the prompt says it isn't required).
- Lets you select a form and see its fields.
- Shows each field's current prefill mapping, or "Not configured".
- Set a mapping by picking a source; clear it with one click.
- Sources come from three providers today: **direct dependencies**, **transitive
  dependencies**, and **global data** — all rendered identically.

## Architecture

The app is split so domain logic never lives inside React components.

```
 API            Domain                     React
 ───            ──────                     ─────
 blueprintClient ─► normalizeBlueprintGraph ─► useBlueprintGraph ─► App
                    graphTraversal           │
                    prefill providers ───────┤   PrefillWorkspace
                    prefillReducer ──────────┘     ├─ FormList
                                                   ├─ PrefillPanel ─► FieldMappingRow
                                                   └─ SourcePickerModal ─► SourceSection
```

| Layer | Where | Responsibility |
|-------|-------|----------------|
| API | `src/api/` | Fetch the raw response, validate it, adapt it to internal types. |
| Graph | `src/domain/graph/` | Pure traversal: direct parents, all ancestors, transitive ancestors. |
| Prefill | `src/domain/prefill/` | Provider/option/source types, the mapping reducer, option→source. |
| Data sources | `src/dataSources/` | The pluggable providers + the registry. |
| Hooks | `src/hooks/` | Thin React bindings (`useBlueprintGraph`, `usePrefillMappings`). |
| Components | `src/components/` | Presentational; `PrefillWorkspace` does the wiring. |

### The key decision: normalized sources

Every source — a parent form field, an ancestor field, a piece of global data,
or a future CRM field — is exposed as the same `PrefillOption` shape. The source
picker iterates a list of providers and renders each generically. **It never
branches on where an option came from.** That's what makes new sources cheap.

### Raw vs. internal types

The raw API (`api/blueprintTypes.ts`) keeps topology in `nodes`/`edges` and
fields in a separate `forms[]` array as JSON-schema `properties`. The adapter
(`api/blueprintAdapter.ts`) collapses that into a clean `BlueprintGraph`. Raw
shapes never leak past the API layer.

## Adding a new data source

1. Implement a provider:

   ```ts
   export const crmContactProvider: PrefillSourceProvider = {
     id: 'crm-contact',
     label: 'CRM Contact',
     getOptions: (context) => [
       {
         id: 'crm.contact.email',
         providerId: 'crm-contact',
         label: 'CRM Contact Email',
         valuePath: 'crm.contact.email',
       },
     ],
   }
   ```

2. Register it in `src/dataSources/index.ts`:

   ```ts
   export const prefillSourceProviders = [
     directDependencyProvider,
     transitiveDependencyProvider,
     globalDataProvider,
     crmContactProvider, // ← that's it
   ]
   ```

No component changes. The picker picks it up automatically.

## Tests

```bash
npm test
```

- `graphTraversal.test.ts` — direct/all/transitive ancestors, roots, and cycle safety.
- `prefillSources.test.ts` — each provider's output and the shared normalized shape.
- `prefillReducer.test.ts` — set, clear, replace, and isolation between fields.
- `blueprintAdapter.test.ts` — raw→internal normalization and graceful degradation.
- `PrefillWorkspace.test.tsx` — full UI loop: select form → pick source → clear.

## Tradeoffs

- **UI is intentionally plain.** The challenge prioritizes architecture; a node
  canvas was explicitly out of scope.
- **Mappings are client-side only.** No persistence layer — the reducer is the
  source of truth and is trivially swappable for a server-backed store.
- **"Transitive" = ancestors minus direct parents**, matching the challenge's
  Form A / Form B language. Both definitions are one filter apart if that ever changes.
- **Cycle-safe traversal** even though a blueprint should be a DAG — cheap
  insurance against malformed data.
