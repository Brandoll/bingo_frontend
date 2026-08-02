import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, CirclePause, Radio, Trophy } from 'lucide-react'
import type { RoomSession, RoomSnapshot } from '../../../types/room'
import type { PrizeType } from '../../../types/game'
import { ApiError } from '../../../services/api/http'
import { BingoCard } from '../../cards/components/BingoCard'
import { gameApi } from '../api/gameApi'
import { useGame } from '../hooks/useGame'
import { DrawHistory } from './DrawHistory'
import { PlayerPreferencesPanel } from './PlayerPreferencesPanel'
import { usePlayerPreferences } from '../hooks/usePlayerPreferences'
import { speakBallNumber } from '../../../services/audio/ballVoice'

interface PlayerGamePanelProps {
  room: RoomSnapshot
  session: RoomSession
}

const prizeLabel: Record<PrizeType, string> = { LINE: 'Línea', DOUBLE_LINE: 'Doble línea', BINGO: '¡Bingo!' }

export function PlayerGamePanel({ room, session }: PlayerGamePanelProps) {
  const game = useGame(room.code, room.id, true)
  const queryClient = useQueryClient()
  const { preferences, update: updatePreferences } = usePlayerPreferences(room.code)
  const cards = useQuery({
    queryKey: ['my-cards', room.code, game.data?.id],
    queryFn: () => gameApi.myCards(room.code, session.token),
    enabled: Boolean(game.data?.id),
  })
  const mark = useMutation({
    mutationFn: ({ cardId, number }: { cardId: string; number: number }) => gameApi.toggleMark(room.code, session.token, cardId, number),
    onSuccess: updated => queryClient.setQueryData(['my-cards', room.code, game.data?.id], (current: typeof cards.data) => current?.map(card => card.id === updated.id ? updated : card)),
  })
  const claim = useMutation({
    mutationFn: ({ cardId, type }: { cardId: string; type: PrizeType }) => gameApi.claim(room.code, session.token, cardId, type),
  })
  useEffect(() => {
    if (preferences.announceBalls && game.data?.currentNumber) speakBallNumber(game.data.currentNumber, preferences.voiceRate)
  }, [game.data?.currentNumber, preferences.announceBalls, preferences.voiceRate])

  if (game.isLoading || cards.isLoading) return <section className="panel player-game-loading"><span className="loader" /><p>Preparando tu cartón…</p></section>
  if (game.isError || !game.data) return <section className="panel player-game-loading"><strong>No pudimos recuperar la ronda.</strong><button className="button button-secondary" onClick={() => void game.refetch()}>Reintentar</button></section>

  const statusLabel = game.data.status === 'PAUSED' ? 'Partida pausada' : game.data.status === 'ROUND_FINISHED' ? 'Ronda finalizada' : 'Partida en curso'
  return (
    <div className={`player-game ${preferences.highContrast ? 'high-contrast' : ''}`}>
      <section className={`player-game-hero ${game.data.status.toLowerCase()}`}>
        <div><span className="eyebrow"><Radio size={14} /> Ronda {game.data.roundNumber}</span><h1>{room.name}</h1><p>{statusLabel}</p></div>
        <div className="player-current-ball">
          {game.data.status === 'PAUSED' && <CirclePause className="paused-icon" />}
          <small>Última bola</small><strong>{game.data.currentNumber ?? '—'}</strong><span>{game.data.remainingNumbers} restantes</span>
        </div>
      </section>

      <DrawHistory numbers={game.data.drawnNumbers} />
      <PlayerPreferencesPanel preferences={preferences} onChange={updatePreferences} />

      <div className="player-cards-stack">
        {cards.data?.map(card => {
          const values = card.grid.flat().filter((number): number is number => number !== null)
          const drawn = new Set(game.data.drawnNumbers)
          const matched = values.filter(number => drawn.has(number)).length
          const rows = card.grid.filter(row => row.filter((number): number is number => number !== null).every(number => drawn.has(number))).length
          const claimButtons: Array<{ type: PrizeType; enabled: boolean }> = [
            { type: 'LINE', enabled: game.data.lineEnabled && rows >= 1 },
            { type: 'DOUBLE_LINE', enabled: game.data.doubleLineEnabled && rows >= 2 },
            { type: 'BINGO', enabled: game.data.bingoEnabled && matched === 15 },
          ]
          return <div className="player-card-wrap" key={card.id}>
            <BingoCard card={card} drawnNumbers={game.data.drawnNumbers} interactive autoMark={preferences.autoMark} busyNumber={mark.variables?.number} onToggle={number => mark.mutate({ cardId: card.id, number })} />
            <div className="claim-actions">
              {claimButtons.map(item => <button key={item.type} disabled={!item.enabled || claim.isPending} onClick={() => claim.mutate({ cardId: card.id, type: item.type })}><Award /> {prizeLabel[item.type]}</button>)}
            </div>
          </div>
        })}
        {!cards.data?.length && <section className="panel empty-card"><Trophy /><h2>Sin cartón para esta ronda</h2><p>Pide al host que inicie una nueva ronda para recibir uno.</p></section>}
      </div>

      {(mark.isError || claim.isError) && <div className="floating-error" role="alert">{(mark.error ?? claim.error) instanceof ApiError ? (mark.error ?? claim.error as ApiError).message : 'No pudimos completar la acción.'}</div>}
      {claim.isSuccess && <div className="claim-success" role="status"><Trophy /> Solicitud enviada. El host la revisará.</div>}
    </div>
  )
}
