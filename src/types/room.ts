export type MemberRole = 'HOST' | 'CO_HOST' | 'PLAYER'
export type RoomStatus = 'WAITING' | 'RUNNING' | 'CLOSED'

export interface RoomMember {
  id: string
  displayName: string
  role: MemberRole
  connectionStatus: 'CONNECTED' | 'DISCONNECTED'
  joinedAt: string
}

export interface RoomSnapshot {
  id: string
  code: string
  name: string
  status: RoomStatus
  locked: boolean
  maxPlayers: number
  cardsPerPlayer: number
  allowLateJoin: boolean
  hideParticipantNames: boolean
  createdAt: string
  members: RoomMember[]
}

export interface RoomSession {
  token: string
  memberId: string
  role: MemberRole
  room: RoomSnapshot
}

export interface RealtimeEvent<T = RoomSnapshot> {
  eventId: string
  eventType: string
  roomId: string
  occurredAt: string
  version: number
  payload: T
}
