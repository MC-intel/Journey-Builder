import { describe, it, expect } from 'vitest'
import {
  directDependencyProvider,
  globalDataProvider,
  prefillSourceProviders,
  transitiveDependencyProvider,
} from '../../dataSources'
import type { PrefillOption } from './prefillTypes'
import { buildContext } from '../../test/fixtures'

// Selecting Form D: direct parents = B, C, E; transitive ancestor = A.
const contextForD = buildContext('D')

const formIdsIn = (options: PrefillOption[]) =>
  [...new Set(options.map((option) => option.metadata?.formId as string))].sort()

describe('directDependencyProvider', () => {
  it('returns fields from immediate parent forms only', () => {
    const options = directDependencyProvider.getOptions(contextForD)
    expect(formIdsIn(options)).toEqual(['B', 'C', 'E'])
  })

  it('labels options as "Form — Field"', () => {
    const options = directDependencyProvider.getOptions(contextForD)
    expect(options).toContainEqual(
      expect.objectContaining({ label: 'Form B — Email' }),
    )
  })
})

describe('transitiveDependencyProvider', () => {
  it('returns fields from ancestors excluding direct parents', () => {
    const options = transitiveDependencyProvider.getOptions(contextForD)
    expect(formIdsIn(options)).toEqual(['A'])
  })

  it('returns nothing transitive for a form whose ancestors are all direct', () => {
    const options = transitiveDependencyProvider.getOptions(buildContext('B'))
    expect(options).toEqual([])
  })
})

describe('globalDataProvider', () => {
  it('returns global options independent of the selected form', () => {
    const options = globalDataProvider.getOptions(buildContext('A'))
    expect(options.map((option) => option.label)).toContain('Client Email')
  })
})

describe('all providers', () => {
  it('emit the same normalized PrefillOption shape', () => {
    const everyOption = prefillSourceProviders.flatMap((provider) =>
      provider.getOptions(contextForD),
    )

    for (const option of everyOption) {
      expect(typeof option.id).toBe('string')
      expect(typeof option.providerId).toBe('string')
      expect(typeof option.label).toBe('string')
      expect(typeof option.valuePath).toBe('string')
    }
  })

  it('stamp each option with their own providerId', () => {
    expect(
      directDependencyProvider
        .getOptions(contextForD)
        .every((option) => option.providerId === 'direct-form-fields'),
    ).toBe(true)
  })
})
