import { z } from 'zod'

export const createRoomSchema = z.object({
  roomName: z.string().trim().min(3, 'Escribe un nombre para la sala').max(80),
  hostName: z.string().trim().min(2, 'Escribe tu nombre').max(40),
  maxPlayers: z.number().int().min(2).max(300),
})

export const joinRoomSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6}$/, 'El código debe tener 6 caracteres'),
  displayName: z.string().trim().min(2, 'Escribe tu nombre').max(40),
})

export type CreateRoomForm = z.infer<typeof createRoomSchema>
export type JoinRoomForm = z.infer<typeof joinRoomSchema>
