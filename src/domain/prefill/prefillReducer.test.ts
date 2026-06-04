import { describe, it, expect } from 'vitest'
import {
  getMappingKey,
  initialPrefillState,
  prefillReducer,
  type PrefillMappingState,
} from './prefillReducer'
import type { PrefillSource } from './prefillTypes'

const sourceFromFormA: PrefillSource = {
  providerId: 'direct-form-fields',
  sourceId: 'A.email',
  label: 'Form A — Email',
  valuePath: 'forms.A.fields.email',
}

const sourceFromGlobal: PrefillSource = {
  providerId: 'global-data',
  sourceId: 'client.email',
  label: 'Client Email',
  valuePath: 'global.client.email',
}

describe('prefillReducer', () => {
  it('sets a mapping for a field', () => {
    const next = prefillReducer(initialPrefillState, {
      type: 'SET_MAPPING',
      targetFormId: 'D',
      targetFieldId: 'email',
      source: sourceFromFormA,
    })
    expect(next[getMappingKey('D', 'email')]).toEqual(sourceFromFormA)
  })

  it('clears an existing mapping', () => {
    const seeded: PrefillMappingState = {
      [getMappingKey('D', 'email')]: sourceFromFormA,
    }
    const next = prefillReducer(seeded, {
      type: 'CLEAR_MAPPING',
      targetFormId: 'D',
      targetFieldId: 'email',
    })
    expect(next[getMappingKey('D', 'email')]).toBeUndefined()
    expect(getMappingKey('D', 'email') in next).toBe(false)
  })

  it('replaces an existing mapping when set again', () => {
    const seeded: PrefillMappingState = {
      [getMappingKey('D', 'email')]: sourceFromFormA,
    }
    const next = prefillReducer(seeded, {
      type: 'SET_MAPPING',
      targetFormId: 'D',
      targetFieldId: 'email',
      source: sourceFromGlobal,
    })
    expect(next[getMappingKey('D', 'email')]).toEqual(sourceFromGlobal)
  })

  it('does not affect mappings for other fields', () => {
    const seeded: PrefillMappingState = {
      [getMappingKey('D', 'email')]: sourceFromFormA,
      [getMappingKey('D', 'notes')]: sourceFromGlobal,
    }
    const next = prefillReducer(seeded, {
      type: 'CLEAR_MAPPING',
      targetFormId: 'D',
      targetFieldId: 'email',
    })
    expect(next[getMappingKey('D', 'notes')]).toEqual(sourceFromGlobal)
  })

  it('treats state as immutable (returns a new object on change)', () => {
    const seeded: PrefillMappingState = {}
    const next = prefillReducer(seeded, {
      type: 'SET_MAPPING',
      targetFormId: 'D',
      targetFieldId: 'email',
      source: sourceFromFormA,
    })
    expect(next).not.toBe(seeded)
  })
})
