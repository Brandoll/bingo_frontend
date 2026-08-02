import { useState } from 'react'
import { playerPreferencesStorage, type PlayerPreferences } from '../../../services/storage/playerPreferences'

export function usePlayerPreferences(code: string) {
  const [preferences, setPreferences] = useState<PlayerPreferences>(() => playerPreferencesStorage.get(code))
  const update = (change: Partial<PlayerPreferences>) => {
    setPreferences(current => {
      const next = { ...current, ...change }
      playerPreferencesStorage.save(code, next)
      return next
    })
  }
  return { preferences, update }
}
