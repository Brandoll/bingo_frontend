import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, Crown, LoaderCircle } from 'lucide-react'
import type { RoomSession, RoomSnapshot } from '../../../types/room'
import type { GameSnapshot, PrizeType } from '../../../types/game'
import { BingoCard } from '../../cards/components/BingoCard'
import { gameApi } from '../api/gameApi'
import { PlayerPreferencesPanel } from './PlayerPreferencesPanel'
import { usePlayerPreferences } from '../hooks/usePlayerPreferences'
import { speakBallNumber } from '../../../services/audio/ballVoice'
import { playBingoCageSound } from '../../../services/audio/bingoCageSound'

const prizeLabel: Record<PrizeType, string> = { LINE: 'Línea', DOUBLE_LINE: 'Doble línea', BINGO: '¡Bingo!' }

export function AdminCardPanel({ room, session, game }: {
  room: RoomSnapshot
  session: RoomSession
  game: GameSnapshot
}) {
  const queryClient = useQueryClient()
  const { preferences, update } = usePlayerPreferences(room.code)
  const cards = useQuery({
    queryKey: ['my-cards', room.code, game.id],
    queryFn: () => gameApi.myCards(room.code, session.token),
  })
  const mark = useMutation({
    mutationFn: ({ cardId, number }: { cardId: string; number: number }) => gameApi.toggleMark(room.code, session.token, cardId, number),
    onSuccess: updated => queryClient.setQueryData(['my-cards', room.code, game.id], (current: typeof cards.data) => current?.map(card => card.id === updated.id ? updated : card)),
  })
  const claim = useMutation({
    mutationFn: ({ cardId, type }: { cardId: string; type: PrizeType }) => gameApi.claim(room.code, session.token, cardId, type),
  })

  useEffect(() => {
    if (!game.currentNumber) return
    if (preferences.cageSound) playBingoCageSound()
    if (!preferences.announceBalls) return
    const timeout = window.setTimeout(() => speakBallNumber(game.currentNumber!, preferences.voiceRate), preferences.cageSound ? 620 : 0)
    return () => window.clearTimeout(timeout)
  }, [game.currentNumber, preferences.announceBalls, preferences.cageSound, preferences.voiceRate])

  return (
    <section className={`panel admin-card-panel ${preferences.highContrast ? 'high-contrast' : ''}`}>
      <div className="section-title"><div><span><Crown /> También estás jugando</span><h2>Mis cartones</h2></div><span className="card-mode">{preferences.autoMark ? 'Automarcado' : 'Marcado manual'}</span></div>
      <PlayerPreferencesPanel preferences={preferences} onChange={update} />
      {cards.isLoading && <div className="inline-loading"><LoaderCircle className="spin" /> Preparando tus cartones…</div>}
      <div className="admin-cards-grid">
        {cards.data?.map(card => {
          const drawn = new Set(game.drawnNumbers)
          const values = card.grid.flat().filter((number): number is number => number !== null)
          const matched = values.filter(number => drawn.has(number)).length
          const completedRows = card.grid.filter(row => row.filter((number): number is number => number !== null).every(number => drawn.has(number))).length
          const prizes: Array<{ type: PrizeType; enabled: boolean }> = [
            { type: 'LINE', enabled: game.lineEnabled && completedRows >= 1 },
            { type: 'DOUBLE_LINE', enabled: game.doubleLineEnabled && completedRows >= 2 },
            { type: 'BINGO', enabled: game.bingoEnabled && matched === 15 },
          ]
          return <div className="player-card-wrap" key={card.id}>
            <BingoCard card={card} drawnNumbers={game.drawnNumbers} interactive autoMark={preferences.autoMark} busyNumber={mark.variables?.number} onToggle={number => mark.mutate({ cardId: card.id, number })} />
            <div className="claim-actions">{prizes.map(prize => <button key={prize.type} disabled={!prize.enabled || claim.isPending} onClick={() => claim.mutate({ cardId: card.id, type: prize.type })}><Award /> {prizeLabel[prize.type]}</button>)}</div>
          </div>
        })}
      </div>
      {(cards.isError || mark.isError || claim.isError) && <div className="form-error" role="alert">No pudimos actualizar tu cartón.</div>}
      {claim.isSuccess && <div className="claim-success" role="status"><Award /> Solicitud enviada para validación.</div>}
    </section>
  )
}
