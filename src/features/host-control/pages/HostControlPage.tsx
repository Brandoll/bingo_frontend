import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ExternalLink, Gauge, LoaderCircle, Lock, LockOpen, Pause, Play, Radio, Redo2, RotateCcw, Settings2, SkipForward, Square, TicketCheck, Trophy, Tv2, Users, Volume2, X } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '../../../components/layout/PageShell'
import { LoadingView } from '../../../components/feedback/LoadingView'
import { ErrorView } from '../../../components/feedback/ErrorView'
import { roomSessionStorage } from '../../../services/storage/sessionStorage'
import { useRoom } from '../../rooms/hooks/useRoom'
import { PlayerList } from '../../lobby/components/PlayerList'
import { roomsApi } from '../../rooms/api/roomsApi'
import { ApiError } from '../../../services/api/http'
import { gameApi } from '../../game/api/gameApi'
import { useGame } from '../../game/hooks/useGame'
import { DrawHistory } from '../../game/components/DrawHistory'
import type { GameSnapshot } from '../../../types/game'
import type { RoomMember } from '../../../types/room'
import { AdminCardPanel } from '../../game/components/AdminCardPanel'
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog'
import { speakBallNumber } from '../../../services/audio/ballVoice'

type HostAction = 'draw' | 'pause' | 'resume' | 'undo' | 'repeat' | 'finish' | 'new-round'

const statusText = (status?: GameSnapshot['status']) => ({
  RUNNING: 'Partida en curso', PAUSED: 'Partida pausada', VALIDATING_PRIZE: 'Validando premio',
  ROUND_FINISHED: 'Ronda finalizada', CLOSED: 'Sala cerrada',
}[status ?? 'RUNNING'])

export function HostControlPage() {
  const code = (useParams().code ?? '').toUpperCase()
  const navigate = useNavigate()
  const session = roomSessionStorage.get(code)
  const room = useRoom(code)
  const effectiveRole = room.data?.members.find(member => member.id === session?.memberId)?.role ?? session?.role
  const canControl = effectiveRole === 'HOST' || effectiveRole === 'CO_HOST'
  const isPrimaryHost = effectiveRole === 'HOST'
  const game = useGame(code, room.data?.id, room.data?.status === 'RUNNING')
  const queryClient = useQueryClient()
  const [physicalId, setPhysicalId] = useState('')
  const [physicalName, setPhysicalName] = useState('')
  const [newPhysicalId, setNewPhysicalId] = useState('')
  const [newPhysicalNumbers, setNewPhysicalNumbers] = useState('')
  const [interval, setInterval] = useState(8)
  const [confirmAction, setConfirmAction] = useState<'finish' | 'close' | null>(null)
  const [closedByHost, setClosedByHost] = useState(false)
  const statistics = useQuery({ queryKey: ['statistics', code, currentGameRound(game.data)], queryFn: () => gameApi.statistics(code, session?.token ?? ''), enabled: Boolean(game.data && canControl) })

  const updateGame = (snapshot: GameSnapshot) => {
    queryClient.setQueryData(['game', code], snapshot)
    void queryClient.invalidateQueries({ queryKey: ['statistics', code] })
  }
  const start = useMutation({
    mutationFn: () => roomsApi.start(code, session!.token),
    onSuccess: snapshot => {
      queryClient.setQueryData(['room', code], snapshot)
      void queryClient.invalidateQueries({ queryKey: ['game', code] })
    },
  })
  const action = useMutation({
    mutationFn: (kind: HostAction) => {
      const api = {
        draw: gameApi.draw, pause: gameApi.pause, resume: gameApi.resume, undo: gameApi.undo,
        repeat: gameApi.repeat, finish: gameApi.finish, 'new-round': gameApi.newRound,
      }[kind]
      return api(code, session!.token)
    },
    onSuccess: (snapshot, kind) => {
      updateGame(snapshot)
      if (kind === 'repeat' && snapshot.currentNumber) speakBallNumber(snapshot.currentNumber)
      if (kind === 'finish') setConfirmAction(null)
    },
    onError: (_, kind) => { if (kind === 'finish') setConfirmAction(null) },
  })
  const automatic = useMutation({
    mutationFn: (enabled: boolean) => gameApi.automatic(code, session!.token, enabled, interval),
    onSuccess: updateGame,
  })
  const settings = useMutation({
    mutationFn: (next: Pick<GameSnapshot, 'lineEnabled' | 'doubleLineEnabled' | 'bingoEnabled' | 'rankingPublic'>) => gameApi.settings(code, session!.token, next),
    onSuccess: updateGame,
  })
  const physical = useMutation({
    mutationFn: () => gameApi.activatePhysical(code, session!.token, physicalId, physicalName),
    onSuccess: () => { setPhysicalId(''); setPhysicalName(''); void queryClient.invalidateQueries({ queryKey: ['host-cards', code] }) },
  })
  const physicalLookup = useMutation({ mutationFn: () => gameApi.findPhysical(physicalId, session!.token) })
  const registerPhysical = useMutation({
    mutationFn: () => gameApi.registerPhysical(newPhysicalId, newPhysicalNumbers.split(/[\s,;]+/).filter(Boolean).map(Number), session!.token),
    onSuccess: card => { setPhysicalId(card.externalId); setNewPhysicalId(''); setNewPhysicalNumbers(''); physicalLookup.reset() },
  })
  const review = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) => gameApi.reviewClaim(code, session!.token, id, approved),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['game', code] }),
  })
  const roomAction = useMutation({
    mutationFn: ({ kind, memberId, enabled }: { kind: 'lock' | 'close' | 'remove' | 'cohost'; memberId?: string; enabled?: boolean }) => {
      if (kind === 'remove') return roomsApi.removeMember(code, session!.token, memberId!)
      if (kind === 'cohost') return roomsApi.setCoHost(code, session!.token, memberId!, Boolean(enabled))
      if (kind === 'close') return roomsApi.close(code, session!.token)
      return roomsApi.lock(code, session!.token, !room.data!.locked)
    },
    onSuccess: (snapshot, variables) => {
      queryClient.setQueryData(['room', code], snapshot)
      if (variables.kind === 'close') {
        setClosedByHost(true)
        roomSessionStorage.remove(code)
        setConfirmAction(null)
        navigate('/', { replace: true })
      }
    },
    onError: (_, variables) => { if (variables.kind === 'close') setConfirmAction(null) },
  })
  const roomSettings = useMutation({
    mutationFn: (next: Pick<NonNullable<typeof room.data>, 'cardsPerPlayer' | 'allowLateJoin' | 'hideParticipantNames'>) => roomsApi.settings(code, session!.token, next),
    onSuccess: snapshot => queryClient.setQueryData(['room', code], snapshot),
  })

  if (closedByHost) return <Navigate to="/" replace />
  if (!session) return <Navigate to={`/room/${code}`} replace />
  if (room.isLoading) return <LoadingView />
  if (room.isError || !room.data) return <ErrorView message="No pudimos cargar el panel." retry={() => void room.refetch()} />
  if (!canControl) return <Navigate to={`/room/${code}`} replace />

  const currentGame = game.data
  const pendingClaims = currentGame?.claims.filter(claim => claim.status === 'PENDING') ?? []
  const busy = start.isPending || action.isPending || automatic.isPending
  const error = start.error ?? action.error ?? automatic.error ?? settings.error ?? physical.error ?? physicalLookup.error ?? registerPhysical.error ?? review.error ?? roomAction.error ?? roomSettings.error
  const runPrimaryAction = () => {
    if (room.data.status === 'WAITING') start.mutate()
    else if (currentGame?.status === 'PAUSED') action.mutate('resume')
    else if (currentGame?.status === 'ROUND_FINISHED') action.mutate('new-round')
    else action.mutate('draw')
  }
  const primaryLabel = room.data.status === 'WAITING' ? 'Iniciar partida'
    : currentGame?.status === 'PAUSED' ? 'Continuar partida'
      : currentGame?.status === 'ROUND_FINISHED' ? 'Nueva ronda' : 'Extraer siguiente bola'

  return (
    <PageShell action={<Link className="header-action" to={`/room/${code}/display`} target="_blank"><Tv2 /> Vista TV <ExternalLink size={14} /></Link>}>
      <div className="host-page container">
        <header className="host-heading"><div><span className="eyebrow"><Radio size={14} /> Control en vivo · {currentGame ? `Ronda ${currentGame.roundNumber}` : effectiveRole === 'CO_HOST' ? 'Modo coanfitrión' : 'Sala lista'}</span><h1>{room.data.name}</h1></div><div className="host-heading-actions">{isPrimaryHost && <button className="room-lock-button" onClick={() => roomAction.mutate({ kind: 'lock' })}>{room.data.locked ? <Lock /> : <LockOpen />}{room.data.locked ? 'Sala bloqueada' : 'Ingreso abierto'}</button>}<span className="host-room-code">{code}</span></div></header>
        <div className="host-dashboard">
          <section className="panel control-panel">
            <div className="status-banner"><div><span>Estado actual</span><strong>{room.data.status === 'WAITING' ? 'Esperando jugadores' : statusText(currentGame?.status)}</strong></div><span className={`status-light ${currentGame?.status === 'RUNNING' ? 'running' : currentGame?.status === 'PAUSED' ? 'paused' : ''}`} /></div>
            <div className={`current-number ${currentGame?.currentNumber ? 'has-number' : 'empty'}`}><span>Última bola</span><strong>{currentGame?.currentNumber ?? '—'}</strong><small>{currentGame ? `${currentGame.remainingNumbers} bolas restantes` : 'Inicia cuando todos estén listos'}</small></div>
            {currentGame && <DrawHistory numbers={currentGame.drawnNumbers} limit={8} />}
            <button className="button button-primary button-wide start-button" onClick={runPrimaryAction} disabled={busy || (room.data.status === 'WAITING' && !isPrimaryHost) || (room.data.status === 'RUNNING' && !currentGame)}>
              {busy ? <><LoaderCircle className="spin" /> Procesando…</> : currentGame?.status === 'PAUSED' ? <><Play /> {primaryLabel}</> : currentGame?.status === 'ROUND_FINISHED' ? <><Redo2 /> {primaryLabel}</> : room.data.status === 'WAITING' ? <><Play /> {primaryLabel}</> : <><SkipForward /> {primaryLabel}</>}
            </button>
            {error && <div className="form-error" role="alert">{error instanceof ApiError ? error.message : 'No pudimos completar la acción.'}</div>}
            <div className="control-row">
              <button onClick={() => action.mutate('pause')} disabled={busy || currentGame?.status !== 'RUNNING'}><Pause /><span>Pausar</span></button>
              <button onClick={() => action.mutate('undo')} disabled={busy || currentGame?.status !== 'RUNNING' || !currentGame.drawnNumbers.length}><RotateCcw /><span>Deshacer</span></button>
              <button onClick={() => action.mutate('repeat')} disabled={busy || !currentGame?.drawnNumbers.length}><Volume2 /><span>Repetir</span></button>
              <button onClick={() => setConfirmAction('finish')} disabled={busy || !currentGame || !['RUNNING', 'PAUSED'].includes(currentGame.status)}><Square /><span>Finalizar ronda</span></button>
            </div>
          </section>

          <section className="panel automation-panel">
            <div className="section-title"><div><span><Gauge /> Bombo automático</span><h2>Ritmo de extracción</h2></div></div>
            <div className="interval-control"><label htmlFor="draw-interval">Cada</label><input id="draw-interval" type="number" min="3" max="60" value={interval} onChange={event => setInterval(Number(event.target.value))} /><span>segundos</span></div>
            <button className={`button button-wide ${currentGame?.automaticDrawEnabled ? 'button-danger' : 'button-secondary'}`} disabled={!currentGame || currentGame.status !== 'RUNNING' || automatic.isPending} onClick={() => automatic.mutate(!currentGame?.automaticDrawEnabled)}>
              {currentGame?.automaticDrawEnabled ? <><Pause /> Detener automático</> : <><Play /> Activar automático</>}
            </button>
          </section>

          <section className="panel host-players"><div className="section-title"><div><span><Users size={15} /> Participantes</span><h2>{room.data.members.length} conectados</h2></div></div><PlayerList compact members={room.data.members} busyMemberId={roomAction.variables?.memberId} onRemove={memberId => roomAction.mutate({ kind: 'remove', memberId })} onToggleCoHost={isPrimaryHost ? (member: RoomMember) => roomAction.mutate({ kind: 'cohost', memberId: member.id, enabled: member.role !== 'CO_HOST' }) : undefined} /></section>

          {currentGame && <AdminCardPanel room={room.data} session={session} game={currentGame} />}

          {isPrimaryHost && <section className="panel room-settings-panel">
            <div className="section-title"><div><span><Settings2 /> Sala</span><h2>Acceso y cartones</h2></div></div>
            <label className="setting-field"><span>Cartones digitales por jugador</span><select value={room.data.cardsPerPlayer} disabled={room.data.status !== 'WAITING' || roomSettings.isPending} onChange={event => roomSettings.mutate({ cardsPerPlayer: Number(event.target.value), allowLateJoin: room.data.allowLateJoin, hideParticipantNames: room.data.hideParticipantNames })}>{[1, 2, 3, 4].map(value => <option value={value} key={value}>{value}</option>)}</select></label>
            <label className="setting-toggle"><span>Permitir entradas durante la partida</span><input type="checkbox" checked={room.data.allowLateJoin} disabled={roomSettings.isPending} onChange={() => roomSettings.mutate({ cardsPerPlayer: room.data.cardsPerPlayer, allowLateJoin: !room.data.allowLateJoin, hideParticipantNames: room.data.hideParticipantNames })} /></label>
            <label className="setting-toggle"><span>Ocultar nombres completos en TV</span><input type="checkbox" checked={room.data.hideParticipantNames} disabled={roomSettings.isPending} onChange={() => roomSettings.mutate({ cardsPerPlayer: room.data.cardsPerPlayer, allowLateJoin: room.data.allowLateJoin, hideParticipantNames: !room.data.hideParticipantNames })} /></label>
            <button className="close-room-button" onClick={() => setConfirmAction('close')} disabled={roomAction.isPending}>Cerrar sala permanentemente</button>
          </section>}

          {currentGame && <section className="panel settings-panel">
            <div className="section-title"><div><span><Settings2 /> Configuración</span><h2>Premios y pantalla</h2></div></div>
            {([
              ['lineEnabled', 'Primera línea'], ['doubleLineEnabled', 'Doble línea'], ['bingoEnabled', 'Bingo completo'], ['rankingPublic', 'Ranking público'],
            ] as const).map(([key, label]) => <label className="setting-toggle" key={key}><span>{label}</span><input type="checkbox" checked={currentGame[key]} disabled={settings.isPending} onChange={() => settings.mutate({ lineEnabled: currentGame.lineEnabled, doubleLineEnabled: currentGame.doubleLineEnabled, bingoEnabled: currentGame.bingoEnabled, rankingPublic: currentGame.rankingPublic, [key]: !currentGame[key] })} /></label>)}
          </section>}

          {currentGame && <section className="panel physical-panel">
            <div className="section-title"><div><span><TicketCheck /> Cartilla física</span><h2>Activar en esta ronda</h2></div></div>
            <form onSubmit={event => { event.preventDefault(); physical.mutate() }}><label>ID de cartilla<input value={physicalId} onChange={event => { setPhysicalId(event.target.value.toUpperCase()); physicalLookup.reset() }} placeholder="Ej. 001" required /></label><label>Nombre del jugador<input value={physicalName} onChange={event => setPhysicalName(event.target.value)} placeholder="Nombre" minLength={2} required /></label><div className="physical-actions"><button type="button" className="button button-ghost" disabled={!physicalId || physicalLookup.isPending} onClick={() => physicalLookup.mutate()}>Buscar</button><button className="button button-secondary" disabled={physical.isPending}>{physical.isPending ? <LoaderCircle className="spin" /> : <TicketCheck />} Activar</button></div></form>
            {physicalLookup.data && <div className="physical-preview"><strong>{physicalLookup.data.externalId}</strong><span>{physicalLookup.data.numbers.join(' · ')}</span></div>}
            {isPrimaryHost && <details className="physical-register"><summary>Registrar una cartilla nueva</summary><form onSubmit={event => { event.preventDefault(); registerPhysical.mutate() }}><label>Nuevo ID<input value={newPhysicalId} onChange={event => setNewPhysicalId(event.target.value.toUpperCase())} placeholder="Ej. CLUB-073" required /></label><label>15 números separados por comas<textarea value={newPhysicalNumbers} onChange={event => setNewPhysicalNumbers(event.target.value)} placeholder="1, 10, 20, 31, 42…" required /></label><button className="button button-secondary" disabled={registerPhysical.isPending}>{registerPhysical.isPending ? <LoaderCircle className="spin" /> : <TicketCheck />} Registrar</button></form></details>}
          </section>}

          {currentGame?.rankingPublic && <section className="panel ranking-panel">
            <div className="section-title"><div><span><Trophy /> Ranking en vivo</span><h2>Más cerca del bingo</h2></div></div>
            <ol>{currentGame.ranking.map(entry => <li key={entry.cardId}><span>{entry.displayName}<small>{entry.cardCode}</small></span><strong>{entry.matchedNumbers}/15</strong></li>)}</ol>
          </section>}

          <section className="panel claims-panel">
            <div className="section-title"><div><span><Trophy /> Solicitudes</span><h2>{pendingClaims.length ? `${pendingClaims.length} pendientes` : 'Sin pendientes'}</h2></div></div>
            {pendingClaims.map(claim => <article key={claim.id}><div><strong>{claim.displayName}</strong><span>{claim.prizeType.replace('_', ' ')} · {claim.cardCode}</span></div><button aria-label={`Aprobar ${claim.displayName}`} onClick={() => review.mutate({ id: claim.id, approved: true })}><Check /></button><button aria-label={`Rechazar ${claim.displayName}`} onClick={() => review.mutate({ id: claim.id, approved: false })}><X /></button></article>)}
            {!pendingClaims.length && <p className="empty-copy">Aquí aparecerán las solicitudes de línea y bingo.</p>}
          </section>

          {statistics.data && <section className="panel statistics-panel">
            <div className="section-title"><div><span><Gauge /> Historial</span><h2>{statistics.data.totalRounds} rondas jugadas</h2></div></div>
            <div className="statistics-grid"><div><strong>{statistics.data.totalDraws}</strong><span>Bolas</span></div><div><strong>{statistics.data.totalCards}</strong><span>Cartones</span></div><div><strong>{statistics.data.approvedPrizes}</strong><span>Premios</span></div></div>
            <div className="round-history">{statistics.data.rounds.slice(0, 4).map(round => <div key={round.gameId}><span>Ronda {round.roundNumber}</span><strong>{round.drawnNumbers} bolas</strong><small>{round.status.replace('_', ' ')}</small></div>)}</div>
          </section>}
        </div>
      </div>
      <ConfirmDialog open={confirmAction === 'finish'} title="¿Finalizar esta ronda?" description="Se detendrá el bombo y se conservarán bolas, cartones, premios y estadísticas. Después podrás iniciar una nueva ronda." confirmLabel="Finalizar ronda" busy={action.isPending} onCancel={() => setConfirmAction(null)} onConfirm={() => action.mutate('finish')} />
      <ConfirmDialog open={confirmAction === 'close'} title="¿Cerrar la sala permanentemente?" description="Nadie podrá volver a entrar ni continuar jugando. El historial quedará guardado para consulta." confirmLabel="Cerrar sala" danger busy={roomAction.isPending} onCancel={() => setConfirmAction(null)} onConfirm={() => roomAction.mutate({ kind: 'close' })} />
    </PageShell>
  )
}

function currentGameRound(game?: GameSnapshot) {
  return game?.roundNumber ?? 0
}
