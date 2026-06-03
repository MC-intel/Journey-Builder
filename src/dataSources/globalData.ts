/**
 * Provider: global data, available regardless of graph position.
 *
 * The mock options below stand in for whatever an action's global context would
 * expose. The important part is that they use the exact same `PrefillOption`
 * shape as form-field options — the picker can't tell them apart.
 */
import type { PrefillSourceProvider } from '../domain/prefill/prefillTypes'

const PROVIDER_ID = 'global-data'

export const globalDataProvider: PrefillSourceProvider = {
  id: PROVIDER_ID,
  label: 'Global Data',
  getOptions: () => [
    {
      id: 'client.email',
      providerId: PROVIDER_ID,
      label: 'Client Email',
      valuePath: 'global.client.email',
      groupLabel: 'Client',
    },
    {
      id: 'client.organizationName',
      providerId: PROVIDER_ID,
      label: 'Client Organization Name',
      valuePath: 'global.client.organizationName',
      groupLabel: 'Client',
    },
    {
      id: 'action.createdAt',
      providerId: PROVIDER_ID,
      label: 'Action Created At',
      valuePath: 'global.action.createdAt',
      groupLabel: 'Action',
    },
  ],
}
