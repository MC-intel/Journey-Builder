/**
 * Prefill mapping state, modeled as a flat map keyed by `formId.fieldId`.
 *
 * Pure and framework-free so the set/clear/replace behavior is trivially
 * testable; the React hook (`usePrefillMappings`) just wraps this in
 * `useReducer`.
 */
import type { PrefillSource } from './prefillTypes'

export type PrefillMappingState = Record<string, PrefillSource | undefined>

export type PrefillAction =
  | {
      type: 'SET_MAPPING'
      targetFormId: string
      targetFieldId: string
      source: PrefillSource
    }
  | {
      type: 'CLEAR_MAPPING'
      targetFormId: string
      targetFieldId: string
    }

/** Stable key for a target field. Exported so the UI can look up its own rows. */
export const getMappingKey = (formId: string, fieldId: string): string =>
  `${formId}.${fieldId}`

export const initialPrefillState: PrefillMappingState = {}

export const prefillReducer = (
  state: PrefillMappingState,
  action: PrefillAction,
): PrefillMappingState => {
  switch (action.type) {
    case 'SET_MAPPING': {
      const key = getMappingKey(action.targetFormId, action.targetFieldId)
      return { ...state, [key]: action.source }
    }
    case 'CLEAR_MAPPING': {
      const key = getMappingKey(action.targetFormId, action.targetFieldId)
      if (!(key in state)) return state
      const next = { ...state }
      delete next[key]
      return next
    }
    default:
      return state
  }
}
