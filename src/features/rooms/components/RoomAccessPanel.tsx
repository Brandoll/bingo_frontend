import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, LoaderCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { roomsApi } from '../api/roomsApi'
import { roomSessionStorage } from '../../../services/storage/sessionStorage'
import { ApiError } from '../../../services/api/http'
import { createRoomSchema, joinRoomSchema, type CreateRoomForm, type JoinRoomForm } from '../schemas/roomSchemas'

type Mode = 'join' | 'create'

export function RoomAccessPanel() {
  const [mode, setMode] = useState<Mode>('join')
  return (
    <section className="access-card" id="jugar" aria-label="Entrar a BsPlay">
      <div className="access-tabs" role="tablist">
        <button type="button" className={mode === 'join' ? 'active' : ''} onClick={() => setMode('join')} role="tab" aria-selected={mode === 'join'}>Unirme</button>
        <button type="button" className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')} role="tab" aria-selected={mode === 'create'}>Crear sala</button>
      </div>
      {mode === 'join' ? <JoinForm /> : <CreateForm />}
    </section>
  )
}

function JoinForm() {
  const navigate = useNavigate()
  const form = useForm<JoinRoomForm>({ resolver: zodResolver(joinRoomSchema), defaultValues: { code: '', displayName: '' } })
  const mutation = useMutation({
    mutationFn: (values: JoinRoomForm) => roomsApi.join(values.code, values.displayName),
    onSuccess: session => { roomSessionStorage.save(session); navigate(`/room/${session.room.code}`) },
  })
  const error = mutation.error instanceof ApiError ? mutation.error.message : mutation.error?.message

  return (
    <form onSubmit={form.handleSubmit(values => mutation.mutate(values))} className="access-form">
      <div className="form-heading"><span className="eyebrow"><Sparkles size={14} /> Ya empezó la diversión</span><h2>Entra a tu sala</h2><p>Usa el código que ves en la pantalla principal.</p></div>
      <label>Código de sala<input className="code-input" autoComplete="off" maxLength={6} placeholder="B7X9KP" {...form.register('code')} onChange={event => form.setValue('code', event.target.value.toUpperCase())} /></label>
      {form.formState.errors.code && <span className="field-error">{form.formState.errors.code.message}</span>}
      <label>Tu nombre<input autoComplete="name" placeholder="¿Cómo te llamamos?" {...form.register('displayName')} /></label>
      {form.formState.errors.displayName && <span className="field-error">{form.formState.errors.displayName.message}</span>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="button button-primary button-wide" disabled={mutation.isPending}>{mutation.isPending ? <LoaderCircle className="spin" /> : <>Entrar a jugar <ArrowRight /></>}</button>
      <small>No necesitas cuenta. Tu lugar se guarda en este dispositivo.</small>
    </form>
  )
}

function CreateForm() {
  const navigate = useNavigate()
  const form = useForm<CreateRoomForm>({ resolver: zodResolver(createRoomSchema), defaultValues: { roomName: 'Noche de bingo', hostName: '', maxPlayers: 50 } })
  const mutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: session => { roomSessionStorage.save(session); navigate(`/room/${session.room.code}/host`) },
  })
  const error = mutation.error instanceof ApiError ? mutation.error.message : mutation.error?.message

  return (
    <form onSubmit={form.handleSubmit(values => mutation.mutate(values))} className="access-form">
      <div className="form-heading"><span className="eyebrow"><Sparkles size={14} /> Tú llevas el ritmo</span><h2>Crea una sala</h2><p>En segundos tendrás código, lobby y pantalla pública.</p></div>
      <label>Nombre del evento<input placeholder="Noche de bingo" {...form.register('roomName')} /></label>
      <div className="form-row"><label>Tu nombre<input autoComplete="name" placeholder="Nombre del host" {...form.register('hostName')} /></label><label>Capacidad<input type="number" inputMode="numeric" {...form.register('maxPlayers', { valueAsNumber: true })} /></label></div>
      {(form.formState.errors.roomName || form.formState.errors.hostName || form.formState.errors.maxPlayers) && <span className="field-error">Revisa los datos de la sala.</span>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <button className="button button-primary button-wide" disabled={mutation.isPending}>{mutation.isPending ? <LoaderCircle className="spin" /> : <>Crear mi sala <ArrowRight /></>}</button>
      <small>Serás el host y podrás abrir la vista para TV.</small>
    </form>
  )
}
