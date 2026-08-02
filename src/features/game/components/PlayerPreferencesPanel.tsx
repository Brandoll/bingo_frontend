import { Accessibility, Sparkles, Volume2 } from 'lucide-react'
import type { PlayerPreferences } from '../../../services/storage/playerPreferences'

export function PlayerPreferencesPanel({ preferences, onChange }: {
  preferences: PlayerPreferences
  onChange: (change: Partial<PlayerPreferences>) => void
}) {
  return (
    <details className="player-preferences">
      <summary><Sparkles /> Preferencias de juego</summary>
      <div>
        <label><span><Sparkles /> Automarcar bolas extraídas<small>Puedes volver al marcado manual cuando quieras.</small></span><input type="checkbox" checked={preferences.autoMark} onChange={() => onChange({ autoMark: !preferences.autoMark })} /></label>
        <label><span><Volume2 /> Anunciar cada bola<small>Usa la mejor voz española disponible.</small></span><input type="checkbox" checked={preferences.announceBalls} onChange={() => onChange({ announceBalls: !preferences.announceBalls })} /></label>
        <label><span><Accessibility /> Contraste reforzado<small>Mejora la lectura del cartón.</small></span><input type="checkbox" checked={preferences.highContrast} onChange={() => onChange({ highContrast: !preferences.highContrast })} /></label>
        <label className="voice-speed"><span>Velocidad de narración</span><input aria-label="Velocidad de narración" type="range" min="0.75" max="1.1" step="0.05" value={preferences.voiceRate} onChange={event => onChange({ voiceRate: Number(event.target.value) })} /></label>
      </div>
    </details>
  )
}
