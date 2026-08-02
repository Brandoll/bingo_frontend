import { ArrowDown, Check, Radio, Smartphone, Tv2, Users } from 'lucide-react'
import { RoomAccessPanel } from '../components/RoomAccessPanel'
import { Logo } from '../../../components/ui/Logo'
import { Link } from 'react-router-dom'

const drawn = [7, 18, 42, 63, 81]

export function LandingPage() {
  return (
    <div className="landing">
      <header className="site-header container">
        <Logo />
        <div className="header-links"><Link className="header-action" to="/tv"><Tv2 /> Modo TV</Link><a className="header-link" href="#como-funciona">Cómo funciona <ArrowDown size={15} /></a></div>
      </header>
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="hero-kicker"><span className="live-dot" /> Bingo de 90 bolas · En vivo</span>
            <h1>La emoción de siempre, <em>en cada pantalla.</em></h1>
            <p className="hero-lead">Crea la sala, comparte el código y disfruta una partida que une móviles, cartones físicos y la pantalla grande.</p>
            <div className="hero-proof"><span><Check /> Sin instalar nada</span><span><Check /> Listo en segundos</span></div>
          </div>
          <div className="hero-stage" aria-label="Vista previa de una partida en BsPlay">
            <div className="stage-orbit orbit-one" /><div className="stage-orbit orbit-two" />
            <div className="stage-card">
              <div className="stage-top"><span><Radio size={14} /> EN VIVO</span><strong>SALA VIOLETA</strong><span>18 jugadores</span></div>
              <div className="ball-wrap"><span className="ball-shadow" /><div className="bingo-ball"><small>B</small><strong>42</strong></div></div>
              <p>Última bola</p>
              <div className="drawn-row">{drawn.map((number, index) => <span className={index === drawn.length - 1 ? 'current' : ''} key={number}>{number}</span>)}</div>
            </div>
            <span className="floating-ball ball-7">7</span><span className="floating-ball ball-81">81</span><span className="floating-ball ball-18">18</span>
          </div>
          <RoomAccessPanel />
        </section>

        <section className="feature-strip" id="como-funciona">
          <div className="container feature-grid">
            <article><span><Smartphone /></span><div><strong>Todos entran fácil</strong><p>Un código basta para jugar desde el móvil.</p></div></article>
            <article><span><Tv2 /></span><div><strong>Hecho para la pantalla grande</strong><p>Una vista clara para TV o proyector.</p></div></article>
            <article><span><Users /></span><div><strong>Digital y físico, juntos</strong><p>Una misma partida para todos tus invitados.</p></div></article>
          </div>
        </section>
      </main>
      <footer className="container landing-footer"><Logo compact /><span>Juega, celebra, repite.</span><span>© 2026 BsPlay</span></footer>
    </div>
  )
}
