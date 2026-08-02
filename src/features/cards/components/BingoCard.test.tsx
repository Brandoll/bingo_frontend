import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BingoCard } from './BingoCard'

const card = {
  id: 'card-1', cardType: 'DIGITAL' as const, displayName: 'Luna', externalCode: 'D1-LUNA',
  grid: [
    [1, 10, null, 30, null, 50, null, 70, null],
    [null, 11, 20, null, 40, null, 60, null, 80],
    [2, null, 21, 31, null, 51, null, null, 81],
  ],
  markedNumbers: [1], matchedNumbers: 1, completedRows: 0, active: true,
}

describe('BingoCard', () => {
  it('only allows toggling a drawn number', () => {
    const onToggle = vi.fn()
    render(<BingoCard card={card} drawnNumbers={[1, 10]} interactive onToggle={onToggle} />)
    expect(screen.getByRole('button', { name: 'Desmarcar 1' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Marcar 2' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Marcar 10' }))
    expect(onToggle).toHaveBeenCalledWith(10)
  })

  it('marks every drawn value visually when auto-mark is enabled', () => {
    const onToggle = vi.fn()
    render(<BingoCard card={card} drawnNumbers={[1, 10]} interactive autoMark onToggle={onToggle} />)
    expect(screen.getByRole('button', { name: 'Desmarcar 10' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Desmarcar 10' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Desmarcar 10' }))
    expect(onToggle).not.toHaveBeenCalled()
  })
})
