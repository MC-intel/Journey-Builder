import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the app header regardless of load state', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /journey builder prefill/i }),
    ).toBeInTheDocument()
  })
})
