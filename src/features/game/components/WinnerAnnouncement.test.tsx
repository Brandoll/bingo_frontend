import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { GameSnapshot } from '../../../types/game'
import { WinnerAnnouncement } from './WinnerAnnouncement'

const game: GameSnapshot = {
  id: 'game-1', roomId: 'room-1', roundNumber: 1, status: 'ROUND_FINISHED',
  currentNumber: 42, drawnNumbers: [42], remainingNumbers: 89,
  automaticDrawEnabled: false, automaticDrawIntervalSeconds: 8,
  lineEnabled: true, doubleLineEnabled: true, bingoEnabled: true, rankingPublic: true,
  automaticBingoDetectionEnabled: true, stopOnBingoEnabled: true, winnerAnnouncementEnabled: true,
  startedAt: '2026-08-03T00:00:00Z', endedAt: '2026-08-03T00:01:00Z', ranking: [],
  claims: [{ id: 'claim-1', cardId: 'card-1', displayName: 'Ana Pérez', cardCode: 'D1-ANA', prizeType: 'BINGO', status: 'APPROVED', claimedAt: '2026-08-03T00:01:00Z' }],
}

afterEach(cleanup)

describe('WinnerAnnouncement', () => {
  it('shows the approved bingo winner', () => {
    render(<WinnerAnnouncement game={game} />)
    expect(screen.getByText('¡BINGO!')).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
  })

  it('respects the host announcement setting', () => {
    render(<WinnerAnnouncement game={{ ...game, winnerAnnouncementEnabled: false }} />)
    expect(screen.queryByText('¡BINGO!')).not.toBeInTheDocument()
  })
})
