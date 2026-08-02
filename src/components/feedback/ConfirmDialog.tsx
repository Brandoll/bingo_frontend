import { AlertTriangle, X } from 'lucide-react'

export function ConfirmDialog({ open, title, description, confirmLabel, danger = false, busy = false, onCancel, onConfirm }: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onCancel() }}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <button className="dialog-close" aria-label="Cancelar" disabled={busy} onClick={onCancel}><X /></button>
        <span className={`dialog-icon ${danger ? 'danger' : ''}`}><AlertTriangle /></span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div><button className="button button-ghost" disabled={busy} onClick={onCancel}>Volver</button><button className={`button ${danger ? 'button-danger' : 'button-primary'}`} disabled={busy} onClick={onConfirm}>{busy ? 'Procesando…' : confirmLabel}</button></div>
      </section>
    </div>
  )
}
