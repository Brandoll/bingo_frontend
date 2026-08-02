const isPublicProduction = window.location.hostname === 'play.bsdev.me'

const trimTrailingSlash = (value: string) => value.replace(/\/$/, '')

export const API_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL
    || (isPublicProduction ? 'https://api.play.bsdev.me/api/v1' : '/api/v1'),
)

const defaultWsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'

export const WS_URL = trimTrailingSlash(
  import.meta.env.VITE_WS_URL
    || (isPublicProduction
      ? 'wss://api.play.bsdev.me/ws'
      : `${defaultWsProtocol}://${window.location.host}/ws`),
)
