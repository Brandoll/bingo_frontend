import { Link } from 'react-router-dom'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="logo" aria-label="BsPlay, volver al inicio">
      <span className="logo-mark"><span>90</span></span>
      {!compact && <span>Bs<span>Play</span></span>}
    </Link>
  )
}
