import type { FormNode } from '../domain/graph/graphTypes'

type FormListProps = {
  forms: FormNode[]
  selectedFormId?: string
  onSelectForm: (formId: string) => void
}

/** Sidebar list of forms; highlights the selected one. */
export function FormList({ forms, selectedFormId, onSelectForm }: FormListProps) {
  return (
    <nav className="form-list" aria-label="Forms">
      <h2 className="section-heading">Forms</h2>
      <ul className="form-list-items">
        {forms.map((form) => {
          const isSelected = form.id === selectedFormId
          return (
            <li key={form.id}>
              <button
                type="button"
                className={`form-list-item${isSelected ? ' is-selected' : ''}`}
                aria-current={isSelected}
                onClick={() => onSelectForm(form.id)}
              >
                <span className="form-list-name">{form.name}</span>
                <span className="form-list-count">
                  {form.fieldSchema.length} fields
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
