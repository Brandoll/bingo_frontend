import { describe, expect, it } from 'vitest'
import { createRoomSchema, joinRoomSchema } from './roomSchemas'

describe('room schemas', () => {
  it('normalizes a valid room code', () => {
    expect(joinRoomSchema.parse({ code: 'ab23kp', displayName: 'Luna' }).code).toBe('AB23KP')
  })

  it('rejects invalid capacity', () => {
    expect(createRoomSchema.safeParse({ roomName: 'Evento', hostName: 'Ana', maxPlayers: 1 }).success).toBe(false)
  })
})
