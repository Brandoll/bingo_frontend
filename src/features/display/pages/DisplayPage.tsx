import { useEffect, useState } from 'react'
import { Award, Expand, Pause, Radio, Trophy, Users, Volume2, VolumeX } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useParams } from 'react-router-dom'
import { LoadingView } from '../../../components/feedback/LoadingView'
import { ErrorView } from '../../../components/feedback/ErrorView'
import { Logo } from '../../../components/ui/Logo'
import { useRoom } from '../../rooms/hooks/useRoom'
import { useGame } from '../../game/hooks/useGame'
import { speakBallNumber } from '../../../services/audio/ballVoice'

const board = Array.from({ length: 90 }, (_, index) => index + 1)
const publicName = (name: string, hidden: boolean) => {
  if (!hidden) return name
  const [first, ...rest] = name.trim().split(/\s+/)
  return rest.length ? `${first} ${rest[0].slice(0, 1)}.` : `${first.slice(0, 1)}***`
}

export function DisplayPage() {
  const code = (useParams().code ?? '').toUpperCase()
  const room = useRoom(code)
  const game = useGame(code, room.data?.id, room.data?.status === 'RUNNING')
  const [soundEnabled, setSoundEnabled] = useState(false)
  useEffect(() => {
    if (!soundEnabled || !game.data?.currentNumber || !('speechSynthesis' in window)) return
    speakBallNumber(game.data.currentNumber, 0.9)
  }, [game.data?.currentNumber, soundEnabled])
  if (room.isLoading) return <LoadingView />
  if (room.isError || !room.data) return <ErrorView message="No encontramos esta sala." retry={() => void room.refetch()} />
  const joinUrl = `${window.location.origin}/?room=${code}`
  const isWaiting = room.data.status === 'WAITING'
  const isClosed = room.data.status === 'CLOSED' || game.data?.status === 'CLOSED'
  const drawn = new Set(game.data?.drawnNumbers ?? [])
  const approvedPrize = game.data?.claims.find(claim => claim.status === 'APPROVED')
  const gameLabel = isClosed ? 'Sala finalizada' : game.data?.status === 'PAUSED' ? 'Partida pausada' : game.data?.status === 'ROUND_FINISHED' ? 'Ronda finalizada' : 'Sala en vivo'

  return (
    <main className={`display-page ${game.data?.status.toLowerCase() ?? 'waiting'}`}>
      <header className="display-header"><Logo /><div><span className="live-dot" /> {gameLabel}</div><div className="display-tools"><button onClick={() => setSoundEnabled(enabled => !enabled)}>{soundEnabled ? <Volume2 /> : <VolumeX />}{soundEnabled ? ' Voz activa' : ' Activar voz'}</button><button onClick={() => void document.documentElement.requestFullscreen()}><Expand /> Pantalla completa</button></div></header>
      <div className="display-layout">
        {isWaiting ? <section className="display-welcome">
          <span className="eyebrow"><Radio size={15} /> Próxima partida</span>
          <h1>{room.data.name}</h1><p>Escanea el QR o entra con el código</p>
          <div className="display-code"><strong>{code}</strong><span>BsPlay</span></div>
          <div className="qr-card"><QRCodeSVG value={joinUrl} size={156} bgColor="#f4f7fc" fgColor="#0b1d33" level="M" /></div>
          <div className="display-players"><Users /><strong>{room.data.members.length}</strong><span>jugadores listos</span></div>
        </section> : isClosed ? <section className="display-welcome display-closed"><span className="eyebrow"><Award /> Evento finalizado</span><h1>Gracias por jugar</h1><p>La sala fue cerrada por el administrador.</p><div className="display-code"><strong>{code}</strong><span>{room.data.name}</span></div></section> : <section className="display-live-stage">
          <span className="eyebrow"><Radio size={15} /> Ronda {game.data?.roundNumber ?? 1}</span>
          {game.data?.status === 'PAUSED' && <div className="display-pause"><Pause /> Pausa</div>}
          <div className={`display-ball ${game.data?.currentNumber ? 'revealed' : ''}`}><small>Última bola</small><strong>{game.data?.currentNumber ?? '—'}</strong></div>
          <div className="display-round-meta"><span>Anterior <strong>{game.data?.previousNumber ?? '—'}</strong></span><span>Restantes <strong>{game.data?.remainingNumbers ?? 90}</strong></span></div>
          <div className="display-recent">{game.data?.drawnNumbers.slice(-6).reverse().map((number, index) => <span className={index === 0 ? 'latest' : ''} key={number}>{number}</span>)}</div>
          {game.data?.rankingPublic && <div className="display-ranking"><h2><Trophy /> Más cerca</h2>{game.data.ranking.slice(0, 3).map((entry, index) => <div key={entry.cardId}><b>{index + 1}</b><span>{publicName(entry.displayName, room.data.hideParticipantNames)}</span><strong>{entry.matchedNumbers}/15</strong></div>)}</div>}
        </section>}

        <section className="board-panel"><div className="board-title"><div><span>Tablero oficial</span><strong>90 bolas</strong></div><span>{isWaiting ? 'Esperando inicio' : gameLabel}</span></div><div className="number-board">{board.map(number => <span className={`${drawn.has(number) ? 'drawn' : ''} ${game.data?.currentNumber === number ? 'current' : ''}`} key={number}>{number}</span>)}</div><footer><span>{isWaiting ? 'Los números aparecerán aquí durante la partida' : `${game.data?.drawnNumbers.length ?? 0} bolas extraídas`}</span><span className="board-legend"><i /> Extraído</span></footer></section>
      </div>
      {approvedPrize && <div className="winner-overlay"><div><Award /><span>{approvedPrize.prizeType === 'BINGO' ? '¡BINGO!' : approvedPrize.prizeType.replace('_', ' ')}</span><strong>{publicName(approvedPrize.displayName, room.data.hideParticipantNames)}</strong><small>{approvedPrize.cardCode}</small></div></div>}
    </main>
  )
}
