import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { PrefillWorkspace } from './PrefillWorkspace'
import { normalizedForms, normalizedEdges } from '../test/fixtures'

const graph = { forms: normalizedForms, edges: normalizedEdges }

const selectForm = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  await user.click(screen.getByRole('button', { name: new RegExp(name, 'i') }))
}

describe('PrefillWorkspace', () => {
  it('defaults to the first form and lists its fields', () => {
    render(<PrefillWorkspace graph={graph} />)
    expect(
      screen.getByRole('region', { name: /fields for form a/i }),
    ).toBeInTheDocument()
  })

  it('maps a field from a direct dependency, then clears it', async () => {
    const user = userEvent.setup()
    render(<PrefillWorkspace graph={graph} />)

    // Form D has direct parents B, C, E and transitive ancestor A.
    await selectForm(user, 'Form D')

    const emailRow = screen.getByText('Email').closest('li')!
    expect(within(emailRow).getByText('Not configured')).toBeInTheDocument()

    // Open the picker for Email and choose Form B — Email (a direct dependency).
    await user.click(within(emailRow).getByRole('button', { name: 'Select' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Form B — Email' }))

    // Mapping now shown; picker closed.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(emailRow).getByText('Form B — Email')).toBeInTheDocument()

    // Clear it.
    await user.click(within(emailRow).getByRole('button', { name: /clear/i }))
    expect(within(emailRow).getByText('Not configured')).toBeInTheDocument()
  })

  it('offers direct, transitive, and global sources in the picker', async () => {
    const user = userEvent.setup()
    render(<PrefillWorkspace graph={graph} />)
    await selectForm(user, 'Form D')

    const notesRow = screen.getByText('Notes').closest('li')!
    await user.click(within(notesRow).getByRole('button', { name: 'Select' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Direct Dependencies')).toBeInTheDocument()
    expect(within(dialog).getByText('Transitive Dependencies')).toBeInTheDocument()
    expect(within(dialog).getByText('Global Data')).toBeInTheDocument()
    // Form A is the transitive ancestor of D.
    expect(within(dialog).getByRole('button', { name: 'Form A — Email' })).toBeInTheDocument()
  })
})
