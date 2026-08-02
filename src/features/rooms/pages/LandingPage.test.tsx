import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
  it('shows the primary room access flow', () => {
    const client = new QueryClient()
    render(<QueryClientProvider client={client}><MemoryRouter><LandingPage /></MemoryRouter></QueryClientProvider>)

    expect(screen.getByRole('heading', { name: /La emoción de siempre/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Unirme', selected: true })).toBeInTheDocument()
    expect(screen.getByLabelText('Código de sala')).toBeInTheDocument()
  })
})
