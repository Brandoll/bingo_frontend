import { Copy, House, LockKeyhole, Radio, Share2, Tv2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../../../components/layout/PageShell'
import { LoadingView } from '../../../components/feedback/LoadingView'
import { ErrorView } from '../../../components/feedback/ErrorView'
import { useRoom } from '../../rooms/hooks/useRoom'
import { roomSessionStorage } from '../../../services/storage/sessionStorage'
import { PlayerList } from '../components/PlayerList'
import { PlayerGamePanel } from '../../game/components/PlayerGamePanel'

export function LobbyPage() {
  const code = (useParams().code ?? '').toUpperCase()
  const room = useRoom(code)
  const session = roomSessionStorage.get(code)
  if (room.isLoading) return <LoadingView />
  if (room.isError || !room.data) return <ErrorView message="No encontramos esta sala." retry={() => void room.refetch()} />
  const effectiveRole = room.data.members.find(member => member.id === session?.memberId)?.role ?? session?.role
  const canControl = effectiveRole === 'HOST' || effectiveRole === 'CO_HOST'

  if (room.data.status === 'CLOSED') {
    return (
      <PageShell>
        <main className="closed-room-page container">
          <section className="panel closed-room-card">
            <span className="closed-room-icon"><LockKeyhole /></span>
            <span className="eyebrow">Sala finalizada</span>
            <h1>{room.data.name}</h1>
            <p>El administrador cerró esta sala permanentemente. Su historial quedó guardado y ya no admite nuevos jugadores.</p>
            <span className="closed-room-code">{code}</span>
            <Link className="button button-primary" to="/"><House /> Volver al inicio</Link>
          </section>
        </main>
      </PageShell>
    )
  }

  if (room.data.status === 'RUNNING' && session && !canControl) {
    return <PageShell action={<span className="connection-pill"><span /> En vivo</span>}><div className="container player-game-page"><PlayerGamePanel room={room.data} session={session} /></div></PageShell>
  }

  return (
    <PageShell action={<span className="connection-pill"><span /> Conectado</span>}>
      <div className="lobby-page container">
        <section className="lobby-hero panel">
          <div><span className="eyebrow"><Radio size={14} /> {room.data.status === 'RUNNING' ? 'Partida en curso' : 'Sala de espera'}</span><h1>{room.data.name}</h1><p>{room.data.status === 'RUNNING' ? 'La partida ya comenzó. Mantente atento a la pantalla.' : 'La partida comenzará cuando el host dé la señal.'}</p></div>
          <div className="room-code-card"><small>Código de sala</small><strong>{code}</strong><button aria-label="Copiar código" onClick={() => void navigator.clipboard.writeText(code)}><Copy /></button></div>
        </section>
        <div className="lobby-grid">
          <section className="panel players-panel"><div className="section-title"><div><span>Jugadores</span><h2>{room.data.members.length} en la sala</h2></div><span className="capacity">{room.data.members.length}/{room.data.maxPlayers}</span></div><PlayerList members={room.data.members} /></section>
          <aside className="panel lobby-aside">
            <div className="waiting-visual"><span className="pulse-ring" /><span className="mini-ball">90</span></div>
            <h2>Todo listo por aquí</h2><p>Puedes compartir la sala mientras esperamos.</p>
            <button className="button button-secondary button-wide" onClick={() => void navigator.share?.({ title: room.data.name, url: window.location.href })}><Share2 /> Compartir invitación</button>
            {canControl && <div className="host-shortcuts"><Link className="button button-primary button-wide" to={`/room/${code}/host`}>{effectiveRole === 'CO_HOST' ? 'Panel de coanfitrión' : 'Panel del host'}</Link><Link className="text-link" to={`/room/${code}/display`}><Tv2 /> Abrir vista TV</Link></div>}
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
