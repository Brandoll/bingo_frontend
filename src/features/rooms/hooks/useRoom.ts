import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { roomsApi } from '../api/roomsApi'
import { subscribeToRoom } from '../../../services/websocket/roomSocket'

export function useRoom(code: string) {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['room', code], queryFn: () => roomsApi.get(code), enabled: Boolean(code) })
  useEffect(() => {
    if (!query.data?.id) return
    return subscribeToRoom(query.data.id, room => queryClient.setQueryData(['room', code], room))
  }, [code, query.data?.id, queryClient])
  return query
}
