/**
 * Wraps the prefill reducer in `useReducer` and exposes intent-named actions.
 * The reducer holds all the logic; this hook is just the React binding.
 */
import { useCallback, useReducer } from 'react'
import {
  getMappingKey,
  initialPrefillState,
  prefillReducer,
} from '../domain/prefill/prefillReducer'
import type { PrefillSource } from '../domain/prefill/prefillTypes'

export const usePrefillMappings = () => {
  const [mappings, dispatch] = useReducer(prefillReducer, initialPrefillState)

  const setMapping = useCallback(
    (targetFormId: string, targetFieldId: string, source: PrefillSource) =>
      dispatch({ type: 'SET_MAPPING', targetFormId, targetFieldId, source }),
    [],
  )

  const clearMapping = useCallback(
    (targetFormId: string, targetFieldId: string) =>
      dispatch({ type: 'CLEAR_MAPPING', targetFormId, targetFieldId }),
    [],
  )

  const getMapping = useCallback(
    (formId: string, fieldId: string): PrefillSource | undefined =>
      mappings[getMappingKey(formId, fieldId)],
    [mappings],
  )

  return { mappings, setMapping, clearMapping, getMapping }
}
