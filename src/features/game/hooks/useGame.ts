import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { subscribeToGame } from '../../../services/websocket/roomSocket'
import { gameApi } from '../api/gameApi'

export function useGame(code: string, roomId?: string, enabled = true) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['game', code],
    queryFn: () => gameApi.get(code),
    enabled: Boolean(code && roomId && enabled),
    refetchOnWindowFocus: true,
  })
  useEffect(() => {
    if (!roomId || !enabled) return
    return subscribeToGame(roomId, game => queryClient.setQueryData(['game', code], game))
  }, [code, enabled, queryClient, roomId])
  return query
}
