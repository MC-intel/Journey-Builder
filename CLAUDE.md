# CLAUDE.md

# Avantos Journey Builder React Coding Challenge

## Project Goal

Build a clean, maintainable React application for the Avantos Journey Builder coding challenge.

The app should fetch a mock `action-blueprint-graph-get` response, render a list of forms from a DAG, and allow a user to view, set, and clear prefill mappings for fields on a selected form.

The main goal is not visual polish. The main goal is strong architecture, clear React composition, extensible data-source design, clean TypeScript, useful tests, and readable documentation.

This project should demonstrate that the developer can take a complex workflow concept and turn it into a maintainable frontend product.

---

## Challenge Summary

Avantos has a node-based workflow UI that represents a DAG of forms. When an upstream form has been submitted, values from its fields can be used to prefill downstream form fields.

Example:

```txt
Form A -> Form B -> Form D
Form A -> Form C -> Form D
```

For Form D:

* Direct dependencies are immediate parent forms, such as Form B and Form C.
* Transitive dependencies are upstream ancestors, such as Form A.
* Global data can also be used as a prefill source.

The app does not need to render a node-based graph UI. A list of forms is acceptable.

The user should be able to:

1. Fetch and display forms from the mock graph endpoint.
2. Select a form.
3. View the fields for that form.
4. See existing prefill mappings for each field.
5. Clear an existing prefill mapping.
6. Open a source picker for an unmapped field.
7. Select a prefill source from:

   * Direct dependency form fields
   * Transitive dependency form fields
   * Global data
8. Easily support future data-source types without rewriting UI components.

---

## Evaluation Criteria to Optimize For

Build with these priorities in mind:

1. Code organization

   * Clear separation of concerns
   * Thoughtful component hierarchy
   * Domain logic outside React components

2. Extensibility

   * Data sources should be pluggable
   * New source types should be added through registration, not UI rewrites
   * Components should be reusable and composable

3. Tests

   * Add focused tests for graph traversal
   * Add tests for prefill source providers
   * Add tests for mapping set/clear behavior

4. Documentation

   * Explain how to run locally
   * Explain architecture
   * Explain how to add a new data source
   * Explain tradeoffs

5. Code quality

   * Clean TypeScript
   * Readable names
   * Modern React practices
   * Small functions
   * No giant `App.tsx`

---

## Recommended Tech Stack

Use:

* React
* TypeScript
* Vite
* Vitest
* React Testing Library if component tests are added

Avoid unnecessary libraries unless they clearly improve the solution.

Do not spend time implementing a full visual node canvas. The prompt explicitly says this is not required.

---

## Recommended Project Structure

```txt
src/
  api/
    blueprintClient.ts

  components/
    AppShell.tsx
    FormList.tsx
    PrefillPanel.tsx
    FieldMappingRow.tsx
    SourcePickerModal.tsx
    SourceSection.tsx

  domain/
    graph/
      graphTypes.ts
      graphTraversal.ts
      graphTraversal.test.ts

    prefill/
      prefillTypes.ts
      prefillReducer.ts
      prefillReducer.test.ts
      prefillSourceTypes.ts
      prefillSources.test.ts

  dataSources/
    directDependencyFields.ts
    transitiveDependencyFields.ts
    globalData.ts
    index.ts

  hooks/
    useBlueprintGraph.ts
    usePrefillMappings.ts

  test/
    fixtures.ts

  App.tsx
  main.tsx
```

The exact names can change, but preserve the architectural separation:

* API fetching
* Domain graph logic
* Prefill mapping logic
* Data-source providers
* React components
* Tests

---

## Core Design Principle

Treat all prefill sources as normalized data options.

Do not make the modal care whether an option came from:

* A direct dependency form field
* A transitive dependency form field
* Global data
* A future CRM object
* A future user profile object
* A future organization property

The modal should only receive a list of provider sections and render normalized options.

This is the key architecture decision.

---

## Core Types

Define types similar to these. Adjust based on the actual API shape.

```ts
export type FormNode = {
  id: string;
  name: string;
  fieldSchema: FormField[];
};

export type FormField = {
  id: string;
  name: string;
  type?: string;
};

export type GraphEdge = {
  source: string;
  target: string;
};

export type BlueprintGraph = {
  forms: FormNode[];
  edges: GraphEdge[];
};

export type PrefillSource = {
  providerId: string;
  sourceId: string;
  label: string;
  valuePath: string;
  metadata?: Record<string, unknown>;
};

export type PrefillMapping = {
  targetFormId: string;
  targetFieldId: string;
  source: PrefillSource;
};

export type PrefillOption = {
  id: string;
  providerId: string;
  label: string;
  valuePath: string;
  groupLabel?: string;
  metadata?: Record<string, unknown>;
};
```

If the API shape differs, create adapter functions that transform the API response into internal app types. Do not let raw API structures leak throughout the app.

---

## Prefill Source Provider Pattern

Implement data sources using a provider interface.

```ts
export type PrefillSourceContext = {
  selectedFormId: string;
  formsById: Record<string, FormNode>;
  edges: GraphEdge[];
};

export interface PrefillSourceProvider {
  id: string;
  label: string;
  getOptions: (context: PrefillSourceContext) => PrefillOption[];
}
```

The source picker should accept an array of providers:

```ts
const providers: PrefillSourceProvider[] = [
  directDependencyProvider,
  transitiveDependencyProvider,
  globalDataProvider,
];
```

The modal should render providers generically:

```tsx
providers.map((provider) => {
  const options = provider.getOptions(context);

  return (
    <SourceSection
      key={provider.id}
      title={provider.label}
      options={options}
      onSelect={handleSelect}
    />
  );
});
```

This allows future source types to be added by creating a new provider and registering it in the provider list.

---

## Direct Dependency Provider

The direct dependency provider should return fields from forms that directly connect into the selected form.

Example:

```txt
Form B -> Form D
Form C -> Form D
```

For selected Form D, the direct provider should return fields from Form B and Form C.

Implementation sketch:

```ts
export const directDependencyProvider: PrefillSourceProvider = {
  id: "direct-form-fields",
  label: "Direct Dependencies",

  getOptions: (context) => {
    const parentIds = getDirectParentIds(context.selectedFormId, context.edges);

    return parentIds.flatMap((formId) => {
      const form = context.formsById[formId];
      if (!form) return [];

      return form.fieldSchema.map((field) => ({
        id: `${form.id}.${field.id}`,
        providerId: "direct-form-fields",
        label: `${form.name} — ${field.name}`,
        valuePath: `forms.${form.id}.fields.${field.id}`,
        groupLabel: form.name,
        metadata: {
          formId: form.id,
          fieldId: field.id,
          fieldName: field.name,
        },
      }));
    });
  },
};
```

---

## Transitive Dependency Provider

The transitive dependency provider should return fields from upstream ancestors that are not direct parents.

Example:

```txt
Form A -> Form B -> Form D
```

For selected Form D:

* Form B is direct
* Form A is transitive

Implementation should be explicit. In this project, define transitive dependencies as:

> Upstream ancestors excluding direct parents.

This matches the challenge language where Form B is direct and Form A is transitive.

Implementation sketch:

```ts
export const transitiveDependencyProvider: PrefillSourceProvider = {
  id: "transitive-form-fields",
  label: "Transitive Dependencies",

  getOptions: (context) => {
    const ancestorIds = getTransitiveAncestorIds(
      context.selectedFormId,
      context.edges
    );

    return ancestorIds.flatMap((formId) => {
      const form = context.formsById[formId];
      if (!form) return [];

      return form.fieldSchema.map((field) => ({
        id: `${form.id}.${field.id}`,
        providerId: "transitive-form-fields",
        label: `${form.name} — ${field.name}`,
        valuePath: `forms.${form.id}.fields.${field.id}`,
        groupLabel: form.name,
        metadata: {
          formId: form.id,
          fieldId: field.id,
          fieldName: field.name,
        },
      }));
    });
  },
};
```

---

## Global Data Provider

Global data should be implemented as just another provider.

For the challenge, global data can be simple mock data.

```ts
export const globalDataProvider: PrefillSourceProvider = {
  id: "global-data",
  label: "Global Data",

  getOptions: () => [
    {
      id: "client.email",
      providerId: "global-data",
      label: "Client Email",
      valuePath: "global.client.email",
      groupLabel: "Client",
    },
    {
      id: "client.organizationName",
      providerId: "global-data",
      label: "Client Organization Name",
      valuePath: "global.client.organizationName",
      groupLabel: "Client",
    },
    {
      id: "action.createdAt",
      providerId: "global-data",
      label: "Action Created At",
      valuePath: "global.action.createdAt",
      groupLabel: "Action",
    },
  ],
};
```

The important point is that global data uses the same `PrefillOption` shape as form fields.

---

## Graph Traversal Requirements

Create graph traversal utilities outside React.

Minimum functions:

```ts
getDirectParentIds(nodeId: string, edges: GraphEdge[]): string[]

getAllAncestorIds(nodeId: string, edges: GraphEdge[]): string[]

getTransitiveAncestorIds(nodeId: string, edges: GraphEdge[]): string[]
```

Recommended behavior:

* `getDirectParentIds` returns immediate parents.
* `getAllAncestorIds` returns every upstream ancestor.
* `getTransitiveAncestorIds` returns all ancestors excluding direct parents.
* Handle nodes with no parents.
* Avoid infinite loops if malformed cyclic data appears.

Even though the app expects a DAG, defensive cycle handling is a good sign of engineering maturity.

Implementation can use DFS or BFS.

---

## Prefill Mapping State

Keep mapping state simple and explicit.

Recommended state shape:

```ts
export type PrefillMappingState = Record<string, PrefillSource | undefined>;
```

Use a stable key:

```ts
const getMappingKey = (formId: string, fieldId: string) => `${formId}.${fieldId}`;
```

Reducer actions:

```ts
type PrefillAction =
  | {
      type: "SET_MAPPING";
      targetFormId: string;
      targetFieldId: string;
      source: PrefillSource;
    }
  | {
      type: "CLEAR_MAPPING";
      targetFormId: string;
      targetFieldId: string;
    };
```

This makes the core behavior easy to test.

---

## Component Responsibilities

### `App`

Responsibilities:

* Load graph data
* Track selected form
* Provide mapping state
* Compose layout

Avoid putting traversal logic or provider logic directly in `App`.

---

### `FormList`

Responsibilities:

* Render forms
* Show selected state
* Let user select a form

Props should be simple:

```ts
type FormListProps = {
  forms: FormNode[];
  selectedFormId?: string;
  onSelectForm: (formId: string) => void;
};
```

---

### `PrefillPanel`

Responsibilities:

* Render selected form name
* Render field mapping rows
* Pass row events up or handle modal state

It should not know how to compute graph dependencies.

---

### `FieldMappingRow`

Responsibilities:

* Show field name
* Show configured source label if mapped
* Show “Select source” if unmapped
* Show clear button if mapped

Behavior:

* Click select/edit to open source picker
* Click clear to remove mapping

---

### `SourcePickerModal`

Responsibilities:

* Render available provider sections
* Let user choose an option
* Close on selection or cancel

It should not hardcode source types.

It receives:

```ts
type SourcePickerModalProps = {
  isOpen: boolean;
  providers: PrefillSourceProvider[];
  context: PrefillSourceContext;
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};
```

---

### `SourceSection`

Responsibilities:

* Render one provider section
* Render options under that provider
* Show empty state if no options are available

---

## UI Requirements

The UI can be plain but should be understandable.

Recommended layout:

```txt
-------------------------------------------------
Journey Builder Prefill Challenge
-------------------------------------------------

Forms
[Form A]
[Form B]
[Form C]
[Form D]

Selected: Form D

Fields
dynamic_checkbox_group     Not configured       [Select]
dynamic_object             Not configured       [Select]
email                      Form A — email       [Clear]
-------------------------------------------------
```

Source picker:

```txt
Choose prefill source for: email

Direct Dependencies
- Form B — email
- Form B — first_name

Transitive Dependencies
- Form A — email
- Form A — company

Global Data
- Client Email
- Client Organization Name

[Cancel]
```

Add basic loading, error, and empty states.

---

## Testing Plan

Prioritize tests that prove the architecture works.

### `graphTraversal.test.ts`

Test cases:

1. Returns direct parents for a selected node.
2. Returns all ancestors for a selected node.
3. Returns transitive ancestors excluding direct parents.
4. Returns empty array for node with no parents.
5. Handles malformed cyclic data without infinite loops.

Example fixture:

```txt
A -> B -> D
A -> C -> D
E -> D
```

For D:

* Direct parents: B, C, E
* All ancestors: A, B, C, E
* Transitive only: A

---

### `prefillSources.test.ts`

Test cases:

1. Direct dependency provider returns fields from immediate parents.
2. Transitive dependency provider returns fields from upstream ancestors excluding direct parents.
3. Global data provider returns global options.
4. All providers return the same normalized option shape.

---

### `prefillReducer.test.ts`

Test cases:

1. Sets a mapping.
2. Clears a mapping.
3. Replaces an existing mapping.
4. Does not affect mappings for other fields.

---

## Documentation Requirements

The final `README.md` should include:

````md
# Journey Builder Prefill Challenge

## How to Run

npm install
npm run dev
npm test

## What This Implements

- Fetches the action blueprint graph from the mock API
- Renders a list of forms
- Allows selecting a form
- Shows field-level prefill mappings
- Allows setting and clearing mappings
- Supports direct dependency fields
- Supports transitive dependency fields
- Supports global data
- Uses a provider-based source architecture for future data sources

## Architecture

The app separates API fetching, graph traversal, prefill mapping state, source resolution, and UI rendering.

Prefill sources are implemented as providers. Each provider receives the selected form and graph context, then returns normalized `PrefillOption` objects. The source picker renders providers generically and does not need to know whether a source came from a form field, global data, or a future external system.

## Adding a New Data Source

Create a provider that implements `PrefillSourceProvider` and register it in the provider list.

Example:

```ts
export const crmContactProvider: PrefillSourceProvider = {
  id: "crm-contact",
  label: "CRM Contact",
  getOptions: (context) => [
    {
      id: "crm.contact.email",
      providerId: "crm-contact",
      label: "CRM Contact Email",
      valuePath: "crm.contact.email",
    },
  ],
};
```

Then add it to:

```ts
export const prefillSourceProviders = [
  directDependencyProvider,
  transitiveDependencyProvider,
  globalDataProvider,
  crmContactProvider,
];
```

No source picker changes are required.

## Tradeoffs

* The UI is intentionally simple because the challenge prioritizes architecture.
* Prefill mappings are stored client-side.
* The app normalizes API data into internal domain types.
* Graph traversal is isolated and tested.
* The source picker is provider-driven to support future data sources.
````

---

## Development Order

Build in this order:

1. Set up Vite React TypeScript project.
2. Add API client for the mock endpoint.
3. Normalize graph response into internal types.
4. Build graph traversal utilities.
5. Add graph traversal tests.
6. Build prefill source provider interface.
7. Implement direct dependency provider.
8. Implement transitive dependency provider.
9. Implement global data provider.
10. Add provider tests.
11. Build mapping reducer or mapping hook.
12. Add mapping tests.
13. Build UI components.
14. Wire everything together.
15. Add README.
16. Run tests.
17. Polish names and remove dead code.

---

## Important Implementation Rules

Do not:

- Build a full node canvas.
- Put all logic in `App.tsx`.
- Hardcode Form A, Form B, Form C, or Form D.
- Make source picker logic depend on specific source types.
- Skip tests.
- Over-style the UI at the expense of architecture.
- Use vague variable names like `data`, `thing`, `item`, or `obj` when better names exist.

Do:

- Use clear TypeScript types.
- Keep domain logic separate from React rendering.
- Normalize API response early.
- Make providers composable.
- Make graph traversal predictable and tested.
- Keep README practical and clear.
- Favor readable code over clever code.

---

## Definition of Done

The submission is complete when:

- The app runs locally with one command sequence.
- The mock graph endpoint is fetched successfully.
- Forms render in a list.
- A user can select a form.
- The selected form’s fields render.
- Each field shows whether it has a prefill mapping.
- A user can choose a prefill source.
- A user can clear a prefill source.
- Direct dependency fields are available.
- Transitive dependency fields are available.
- Global data fields are available.
- Source providers are extensible.
- Tests exist for traversal and mapping behavior.
- README explains how to run and extend the project.

---

## Submission Quality Bar

The final project should communicate:

> This engineer understands workflow systems, dependency graphs, frontend state, and extensible architecture. They avoided unnecessary visual complexity and built a clean, testable foundation that can support future data sources.

That is the desired impression.

The solution should feel boring in the best way: predictable, typed, tested, and easy to extend.
