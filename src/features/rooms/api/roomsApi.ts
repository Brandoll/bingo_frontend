import { apiRequest } from '../../../services/api/http'
import type { RoomSession, RoomSnapshot } from '../../../types/room'

export interface CreateRoomInput {
  roomName: string
  hostName: string
  maxPlayers: number
}

export const roomsApi = {
  create: (input: CreateRoomInput) => apiRequest<RoomSession>('/rooms', {
    method: 'POST', body: JSON.stringify(input),
  }),
  join: (code: string, displayName: string) => apiRequest<RoomSession>(`/rooms/${code}/join`, {
    method: 'POST', body: JSON.stringify({ displayName }),
  }),
  get: (code: string) => apiRequest<RoomSnapshot>(`/rooms/${code}`),
  start: (code: string, token: string) => apiRequest<RoomSnapshot>(`/rooms/${code}/start`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
  }),
  lock: (code: string, token: string, locked: boolean) => apiRequest<RoomSnapshot>(`/rooms/${code}/lock`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ locked }),
  }),
  settings: (code: string, token: string, settings: Pick<RoomSnapshot, 'cardsPerPlayer' | 'allowLateJoin' | 'hideParticipantNames'>) => apiRequest<RoomSnapshot>(`/rooms/${code}/settings`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(settings),
  }),
  setCoHost: (code: string, token: string, memberId: string, enabled: boolean) => apiRequest<RoomSnapshot>(`/rooms/${code}/members/${memberId}/co-host`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ enabled }),
  }),
  removeMember: (code: string, token: string, memberId: string) => apiRequest<RoomSnapshot>(`/rooms/${code}/members/${memberId}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  }),
  close: (code: string, token: string) => apiRequest<RoomSnapshot>(`/rooms/${code}/close`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
  }),
}
