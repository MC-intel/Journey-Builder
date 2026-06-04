# Design Notes

Why the code is shaped the way it is. The README covers *how to run and extend*;
this covers *why*.

## Goals

The challenge is graded on architecture, not pixels. So the priorities were:

1. Domain logic that lives outside React and is directly testable.
2. A prefill-source design where adding a new source is a registration, not a rewrite.
3. Raw API shapes that never leak past the API layer.

## Layering

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

Data flows one direction: fetch → normalize → traverse/derive → render. Components
are presentational; `PrefillWorkspace` is the only place that wires state to UI.

## Key decisions

### Normalized `PrefillOption` (the big one)

Every prefill source — a direct parent's field, a transitive ancestor's field,
global data, or a future CRM object — is exposed through the same
`PrefillSourceProvider` interface and returns the same `PrefillOption` shape.
The source picker iterates the provider list and renders each section
generically. **No component ever branches on where an option came from.**

This is what makes "easily support future data sources" true rather than
aspirational: a new source is one provider file plus one line in the registry.

### Raw vs. internal types

The `action-blueprint-graph-get` response keeps topology in `nodes`/`edges` and
field definitions in a separate `forms[]` array as JSON-schema `properties`.
That shape is awkward to consume, so `blueprintAdapter` collapses it into a
clean `BlueprintGraph` (forms with `fieldSchema`, edges keyed by form id) at the
boundary. If Avantos changes the wire format, the adapter is the only file that
changes.

The adapter also degrades gracefully: a node referencing a missing form is
dropped, not fatal. There's a test for that.

### "Transitive" = ancestors minus direct parents

The challenge describes Form B as *direct* and Form A as *transitive* for
Form D. I encoded exactly that: `getTransitiveAncestorIds` = all ancestors
excluding direct parents. If a future definition wants "all ancestors," both
sets come from the same traversal — it's a one-filter change.

### Reducer for mapping state

Mappings are a flat `Record<"formId.fieldId", PrefillSource>` managed by a pure
reducer with two actions (`SET_MAPPING`, `CLEAR_MAPPING`). Pure function → cheap
to test, and trivially swappable for a server-backed store later because the
components only see `setMapping`/`clearMapping`/`getMapping` from the hook.

### Cycle-safe traversal

Blueprints should be DAGs, but the BFS keeps a visited set anyway. Malformed
data costs us a wrong answer, not a hung tab. Tested explicitly.

## Testing approach

Test the architecture's load-bearing walls, not implementation details:

- **Traversal** — direct/all/transitive ancestors, roots, cycles (the DAG math).
- **Providers** — each provider's output and the shared normalized shape (the
  extensibility contract).
- **Reducer** — set/clear/replace/isolation (the state machine).
- **Adapter** — raw→internal mapping and graceful degradation (the boundary).
- **Workspace** — one integration test through the real UI: select a form, open
  the picker, choose a source, clear it.

## Tradeoffs

- **Plain UI.** Deliberate — the prompt says no node canvas needed and the
  rubric weighs architecture.
- **Client-side mappings only.** No persistence; the reducer is the source of
  truth. Swapping in an API-backed store touches one hook.
- **Global data is mocked.** The challenge allows it; the provider pattern means
  real Action/Org properties would just be a different `getOptions`.
- **Bundled mock response.** The app runs with zero setup; `VITE_BLUEPRINT_URL`
  points it at a real mock server when needed.
