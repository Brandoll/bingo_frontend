import { Client } from '@stomp/stompjs'
import type { RealtimeEvent, RoomSnapshot } from '../../types/room'
import type { GameSnapshot } from '../../types/game'

const defaultWsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
const WS_URL = import.meta.env.VITE_WS_URL || `${defaultWsProtocol}://${window.location.host}/ws`

export function subscribeToRoom(roomId: string, onSnapshot: (room: RoomSnapshot) => void) {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => client.subscribe(`/topic/rooms/${roomId}`, message => {
      const event = JSON.parse(message.body) as RealtimeEvent
      if (event.version === 1) onSnapshot(event.payload)
    }),
  })
  client.activate()
  return () => { void client.deactivate() }
}

export function subscribeToGame(roomId: string, onSnapshot: (game: GameSnapshot) => void) {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => client.subscribe(`/topic/rooms/${roomId}/game`, message => {
      const event = JSON.parse(message.body) as RealtimeEvent<GameSnapshot>
      if (event.version === 1) onSnapshot(event.payload)
    }),
  })
  client.activate()
  return () => { void client.deactivate() }
}
