import { CircleAlert } from 'lucide-react'

export function ErrorView({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="center-state error-state">
      <CircleAlert size={32} />
      <strong>Algo no salió como esperábamos</strong>
      <p>{message}</p>
      {retry && <button className="button button-ghost" onClick={retry}>Intentar de nuevo</button>}
    </div>
  )
}
