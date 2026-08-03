import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import type { GameSnapshot } from '../../../types/game'

const publicName = (name: string, hidden: boolean) => {
  if (!hidden) return name
  const [first, ...rest] = name.trim().split(/\s+/)
  return rest.length ? `${first} ${rest[0].slice(0, 1)}.` : `${first.slice(0, 1)}***`
}

export function WinnerAnnouncement({ game, hideParticipantNames = false }: {
  game?: GameSnapshot
  hideParticipantNames?: boolean
}) {
  const winner = game?.claims.find(claim => claim.status === 'APPROVED' && claim.prizeType === 'BINGO')
  const winnerId = winner?.id
  const [visibleWinnerId, setVisibleWinnerId] = useState<string>()

  useEffect(() => {
    if (!winnerId || !game?.winnerAnnouncementEnabled) {
      setVisibleWinnerId(undefined)
      return
    }
    setVisibleWinnerId(winnerId)
    if (game.status === 'ROUND_FINISHED') return
    const timeout = window.setTimeout(() => setVisibleWinnerId(undefined), 7000)
    return () => window.clearTimeout(timeout)
  }, [game?.status, game?.winnerAnnouncementEnabled, winnerId])

  if (!winner || visibleWinnerId !== winner.id || !game?.winnerAnnouncementEnabled) return null
  return <div className="winner-overlay" role="status" aria-live="assertive"><div><Award /><span>¡BINGO!</span><strong>{publicName(winner.displayName, hideParticipantNames)}</strong><small>Cartón {winner.cardCode}</small></div></div>
}
