/**
 * Prefill source registry.
 *
 * This array is the single extension point: add a new `PrefillSourceProvider`
 * here and it appears in the picker automatically. No UI changes required.
 */
import type { PrefillSourceProvider } from '../domain/prefill/prefillTypes'
import { directDependencyProvider } from './directDependencyFields'
import { transitiveDependencyProvider } from './transitiveDependencyFields'
import { globalDataProvider } from './globalData'

export const prefillSourceProviders: PrefillSourceProvider[] = [
  directDependencyProvider,
  transitiveDependencyProvider,
  globalDataProvider,
]

export { directDependencyProvider, transitiveDependencyProvider, globalDataProvider }
