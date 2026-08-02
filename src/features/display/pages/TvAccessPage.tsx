import { FormEvent, useState } from 'react'
import { ArrowRight, MonitorUp, Radio } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../../../components/ui/Logo'
import { roomsApi } from '../../rooms/api/roomsApi'
import { ApiError } from '../../../services/api/http'

export function TvAccessPage() {
  const navigate = useNavigate()
  const initialCode = new URLSearchParams(window.location.search).get('room') ?? ''
  const [code, setCode] = useState(initialCode.toUpperCase().slice(0, 6))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const normalized = code.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      setError('Escribe el código de 6 caracteres que aparece en el celular del host.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await roomsApi.get(normalized)
      navigate(`/room/${normalized}/display`)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'No pudimos encontrar esa sala.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="tv-access-page">
      <header className="tv-access-header"><Logo /><Link to="/">Volver al inicio</Link></header>
      <section className="tv-access-card">
        <div className="tv-access-visual"><span className="tv-signal"><Radio /></span><MonitorUp /><small>Pantalla pública</small></div>
        <span className="eyebrow">Modo TV</span>
        <h1>Conecta esta pantalla a la sala</h1>
        <p>Escribe el código que aparece en el panel del administrador. No necesitas iniciar sesión en la TV.</p>
        <form onSubmit={submit}>
          <label htmlFor="tv-room-code">Código de sala</label>
          <input id="tv-room-code" autoFocus autoComplete="off" inputMode="text" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())} placeholder="ABC123" />
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary button-wide" disabled={loading || code.length !== 6}>{loading ? 'Conectando…' : <>Abrir pantalla <ArrowRight /></>}</button>
        </form>
        <small>La administración permanece segura en el celular que creó la sala.</small>
      </section>
    </main>
  )
}
