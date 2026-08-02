export interface PlayerPreferences {
  autoMark: boolean
  announceBalls: boolean
  highContrast: boolean
  voiceRate: number
}

const defaults: PlayerPreferences = {
  autoMark: false,
  announceBalls: false,
  highContrast: false,
  voiceRate: 0.92,
}

const keyFor = (code: string) => `bsplay:preferences:${code.toUpperCase()}`

export const playerPreferencesStorage = {
  get(code: string): PlayerPreferences {
    try {
      const stored = localStorage.getItem(keyFor(code))
      return stored ? { ...defaults, ...JSON.parse(stored) as Partial<PlayerPreferences> } : defaults
    } catch {
      return defaults
    }
  },
  save(code: string, preferences: PlayerPreferences) {
    localStorage.setItem(keyFor(code), JSON.stringify(preferences))
  },
}
