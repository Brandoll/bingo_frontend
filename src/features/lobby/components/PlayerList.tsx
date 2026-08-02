import { Crown, ShieldCheck, UserRound, UserX } from 'lucide-react'
import type { RoomMember } from '../../../types/room'

interface PlayerListProps {
  members: RoomMember[]
  compact?: boolean
  onRemove?: (memberId: string) => void
  onToggleCoHost?: (member: RoomMember) => void
  busyMemberId?: string
}

export function PlayerList({ members, compact = false, onRemove, onToggleCoHost, busyMemberId }: PlayerListProps) {
  return (
    <div className={compact ? 'player-list compact' : 'player-list'}>
      {members.map(member => (
        <div className="player-row" key={member.id}>
          <span className="avatar">{member.displayName.slice(0, 1).toUpperCase()}</span>
          <div><strong>{member.displayName}</strong><small>{member.role === 'HOST' ? 'Anfitrión' : member.role === 'CO_HOST' ? 'Coanfitrión' : 'Listo para jugar'}</small></div>
          {member.role === 'HOST' ? <Crown className="role-icon" /> : member.role === 'CO_HOST' ? <ShieldCheck className="role-icon" /> : <UserRound className="role-icon muted" />}
          {member.role !== 'HOST' && onToggleCoHost && <button className="cohost-player" aria-label={`${member.role === 'CO_HOST' ? 'Quitar coanfitrión a' : 'Hacer coanfitrión a'} ${member.displayName}`} disabled={busyMemberId === member.id} onClick={() => onToggleCoHost(member)}><ShieldCheck /></button>}
          {member.role !== 'HOST' && onRemove && <button className="remove-player" aria-label={`Expulsar a ${member.displayName}`} disabled={busyMemberId === member.id} onClick={() => onRemove(member.id)}><UserX /></button>}
        </div>
      ))}
    </div>
  )
}
