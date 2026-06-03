import { useEffect } from 'react'
import type {
  PrefillSource,
  PrefillSourceContext,
  PrefillSourceProvider,
} from '../domain/prefill/prefillTypes'
import { optionToSource } from '../domain/prefill/optionToSource'
import { SourceSection } from './SourceSection'

type SourcePickerModalProps = {
  isOpen: boolean
  targetFieldLabel: string
  providers: PrefillSourceProvider[]
  context: PrefillSourceContext
  onSelect: (source: PrefillSource) => void
  onClose: () => void
}

/**
 * Generic source picker. It iterates the provider list and renders each as a
 * section — adding a provider needs no change here.
 */
export function SourcePickerModal({
  isOpen,
  targetFieldLabel,
  providers,
  context,
  onSelect,
  onClose,
}: SourcePickerModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Choose prefill source for ${targetFieldLabel}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Choose prefill source</h2>
          <p className="modal-target">
            for <strong>{targetFieldLabel}</strong>
          </p>
        </header>

        <div className="modal-body">
          {providers.map((provider) => (
            <SourceSection
              key={provider.id}
              title={provider.label}
              options={provider.getOptions(context)}
              onSelect={(option) => onSelect(optionToSource(option))}
            />
          ))}
        </div>

        <footer className="modal-footer">
          <button type="button" className="field-action" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </div>
    </div>
  )
}
