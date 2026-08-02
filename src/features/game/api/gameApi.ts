import { apiRequest } from '../../../services/api/http'
import type { GameCard, GameSnapshot, PhysicalCard, PrizeClaim, PrizeType, RoomStatistics } from '../../../types/game'

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

export const gameApi = {
  get: (code: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game`),
  statistics: (code: string, token: string) => apiRequest<RoomStatistics>(`/rooms/${code}/game/statistics`, { headers: auth(token) }),
  draw: (code: string, token: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game/draws`, { method: 'POST', headers: auth(token) }),
  undo: (code: string, token: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game/draws/latest`, { method: 'DELETE', headers: auth(token) }),
  repeat: (code: string, token: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game/draws/latest/repeat`, { method: 'POST', headers: auth(token) }),
  pause: (code: string, token: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game/pause`, { method: 'POST', headers: auth(token) }),
  resume: (code: string, token: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game/resume`, { method: 'POST', headers: auth(token) }),
  finish: (code: string, token: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game/finish`, { method: 'POST', headers: auth(token) }),
  newRound: (code: string, token: string) => apiRequest<GameSnapshot>(`/rooms/${code}/game/rounds`, { method: 'POST', headers: auth(token) }),
  automatic: (code: string, token: string, enabled: boolean, intervalSeconds: number) => apiRequest<GameSnapshot>(`/rooms/${code}/game/automatic-draw`, {
    method: 'PUT', headers: auth(token), body: JSON.stringify({ enabled, intervalSeconds }),
  }),
  settings: (code: string, token: string, settings: Pick<GameSnapshot, 'lineEnabled' | 'doubleLineEnabled' | 'bingoEnabled' | 'rankingPublic'>) => apiRequest<GameSnapshot>(`/rooms/${code}/game/settings`, {
    method: 'PATCH', headers: auth(token), body: JSON.stringify(settings),
  }),
  myCards: (code: string, token: string) => apiRequest<GameCard[]>(`/rooms/${code}/game/cards/me`, { headers: auth(token) }),
  allCards: (code: string, token: string) => apiRequest<GameCard[]>(`/rooms/${code}/game/cards`, { headers: auth(token) }),
  toggleMark: (code: string, token: string, cardId: string, number: number) => apiRequest<GameCard>(`/rooms/${code}/game/cards/${cardId}/marks`, {
    method: 'PATCH', headers: auth(token), body: JSON.stringify({ number }),
  }),
  claim: (code: string, token: string, cardId: string, prizeType: PrizeType) => apiRequest<PrizeClaim>(`/rooms/${code}/game/claims`, {
    method: 'POST', headers: auth(token), body: JSON.stringify({ cardId, prizeType }),
  }),
  reviewClaim: (code: string, token: string, claimId: string, approved: boolean, reason?: string) => apiRequest<PrizeClaim>(`/rooms/${code}/game/claims/${claimId}/review`, {
    method: 'POST', headers: auth(token), body: JSON.stringify({ approved, reason }),
  }),
  findPhysical: (externalId: string, token: string) => apiRequest<PhysicalCard>(`/physical-cards/${externalId}`, { headers: auth(token) }),
  registerPhysical: (externalId: string, numbers: number[], token: string) => apiRequest<PhysicalCard>('/physical-cards', {
    method: 'POST', headers: auth(token), body: JSON.stringify({ externalId, numbers }),
  }),
  activatePhysical: (code: string, token: string, externalId: string, displayName: string) => apiRequest<GameCard>(`/rooms/${code}/game/physical-cards`, {
    method: 'POST', headers: auth(token), body: JSON.stringify({ externalId, displayName }),
  }),
  deactivatePhysical: (code: string, token: string, cardId: string) => apiRequest<void>(`/rooms/${code}/game/physical-cards/${cardId}`, {
    method: 'DELETE', headers: auth(token),
  }),
}
