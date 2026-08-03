import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, LoaderCircle, Pause, Play, Radio, RotateCcw, SkipForward, Square, Volume2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog'
import { ErrorView } from '../../../components/feedback/ErrorView'
import { LoadingView } from '../../../components/feedback/LoadingView'
import { PageShell } from '../../../components/layout/PageShell'
import { ApiError } from '../../../services/api/http'
import { roomSessionStorage } from '../../../services/storage/sessionStorage'
import type { GameSnapshot } from '../../../types/game'
import { PlayerGamePanel } from '../../game/components/PlayerGamePanel'
import { useGame } from '../../game/hooks/useGame'
import { gameApi } from '../../game/api/gameApi'
import { roomsApi } from '../../rooms/api/roomsApi'
import { useRoom } from '../../rooms/hooks/useRoom'
import { playBingoCageSound } from '../../../services/audio/bingoCageSound'

type QuickAction = 'draw' | 'pause' | 'resume' | 'repeat' | 'finish' | 'new-round'

export function HostPlayPage() {
  const code = (useParams().code ?? '').toUpperCase()
  const session = roomSessionStorage.get(code)
  const room = useRoom(code)
  const game = useGame(code, room.data?.id, room.data?.status === 'RUNNING')
  const queryClient = useQueryClient()
  const [confirmFinish, setConfirmFinish] = useState(false)

  const effectiveRole = room.data?.members.find(member => member.id === session?.memberId)?.role ?? session?.role
  const canControl = effectiveRole === 'HOST' || effectiveRole === 'CO_HOST'
  const isPrimaryHost = effectiveRole === 'HOST'

  const updateGame = (snapshot: GameSnapshot) => queryClient.setQueryData(['game', code], snapshot)
  const start = useMutation({
    mutationFn: () => roomsApi.start(code, session!.token),
    onSuccess: snapshot => {
      queryClient.setQueryData(['room', code], snapshot)
      void queryClient.invalidateQueries({ queryKey: ['game', code] })
    },
  })
  const action = useMutation({
    mutationFn: (kind: QuickAction) => ({
      draw: gameApi.draw,
      pause: gameApi.pause,
      resume: gameApi.resume,
      repeat: gameApi.repeat,
      finish: gameApi.finish,
      'new-round': gameApi.newRound,
    })[kind](code, session!.token),
    onSuccess: (snapshot, kind) => {
      updateGame(snapshot)
      if (kind === 'finish') setConfirmFinish(false)
    },
    onError: (_, kind) => { if (kind === 'finish') setConfirmFinish(false) },
  })

  if (!session) return <Navigate to={`/room/${code}`} replace />
  if (room.isLoading) return <LoadingView />
  if (room.isError || !room.data) return <ErrorView message="No pudimos cargar la sala." retry={() => void room.refetch()} />
  if (!canControl) return <Navigate to={`/room/${code}`} replace />

  const currentGame = game.data
  const busy = start.isPending || action.isPending
  const error = start.error ?? action.error
  const runPrimary = () => {
    if (room.data.status === 'WAITING') start.mutate()
    else if (currentGame?.status === 'PAUSED') action.mutate('resume')
    else if (currentGame?.status === 'ROUND_FINISHED') action.mutate('new-round')
    else { playBingoCageSound(); action.mutate('draw') }
  }
  const primaryLabel = room.data.status === 'WAITING' ? 'Iniciar'
    : currentGame?.status === 'PAUSED' ? 'Continuar'
      : currentGame?.status === 'ROUND_FINISHED' ? 'Nueva ronda' : 'Siguiente bola'

  return <PageShell action={<Link className="header-action" to={`/room/${code}/host`}><ArrowLeft /> Panel completo</Link>}>
    <div className="host-play-page container">
      <section className="host-play-toolbar" aria-label="Operaciones rápidas del host">
        <div className="host-play-status"><span><Radio /> Host jugando</span><strong>{currentGame?.status === 'PAUSED' ? 'En pausa' : currentGame?.status === 'ROUND_FINISHED' ? 'Ronda finalizada' : room.data.status === 'WAITING' ? 'Sala lista' : 'En vivo'}</strong></div>
        <button className="quick-primary" onClick={runPrimary} disabled={busy || (room.data.status === 'WAITING' && !isPrimaryHost) || (room.data.status === 'RUNNING' && !currentGame)}>{busy ? <LoaderCircle className="spin" /> : currentGame?.status === 'PAUSED' ? <Play /> : currentGame?.status === 'ROUND_FINISHED' ? <RotateCcw /> : room.data.status === 'WAITING' ? <Play /> : <SkipForward />}<span>{primaryLabel}</span></button>
        <button onClick={() => action.mutate(currentGame?.status === 'PAUSED' ? 'resume' : 'pause')} disabled={busy || !currentGame || !['RUNNING', 'PAUSED'].includes(currentGame.status)}>{currentGame?.status === 'PAUSED' ? <Play /> : <Pause />}<span>{currentGame?.status === 'PAUSED' ? 'Seguir' : 'Pausar'}</span></button>
        <button onClick={() => action.mutate('repeat')} disabled={busy || !currentGame?.drawnNumbers.length}><Volume2 /><span>Repetir</span></button>
        <button className="quick-danger" onClick={() => setConfirmFinish(true)} disabled={busy || !currentGame || !['RUNNING', 'PAUSED'].includes(currentGame.status)}><Square /><span>Finalizar</span></button>
      </section>

      {error && <div className="form-error host-play-error" role="alert">{error instanceof ApiError ? error.message : 'No pudimos completar la operación.'}</div>}
      {room.data.status === 'WAITING'
        ? <section className="panel host-play-waiting"><Radio /><h1>{room.data.name}</h1><p>Inicia la partida para recibir tu cartón y jugar con los demás.</p></section>
        : game.isLoading || !currentGame
          ? <LoadingView />
          : <PlayerGamePanel room={room.data} session={session} />}
    </div>
    <ConfirmDialog open={confirmFinish} title="¿Finalizar esta ronda?" description="Se detendrá el bombo y se conservarán las bolas, cartones y ganadores." confirmLabel="Finalizar ronda" busy={action.isPending} onCancel={() => setConfirmFinish(false)} onConfirm={() => action.mutate('finish')} />
  </PageShell>
}
