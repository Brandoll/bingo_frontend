import type { RoomSession } from '../../types/room'

const keyFor = (code: string) => `bsplay:session:${code.toUpperCase()}`

export const roomSessionStorage = {
  save(session: RoomSession) {
    localStorage.setItem(keyFor(session.room.code), JSON.stringify(session))
  },
  get(code: string): RoomSession | null {
    const value = localStorage.getItem(keyFor(code))
    if (!value) return null
    try { return JSON.parse(value) as RoomSession } catch { return null }
  },
  remove(code: string) {
    localStorage.removeItem(keyFor(code))
  },
}
