import { API_URL } from '../../config/runtime'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; code?: string } | null
    throw new ApiError(body?.message ?? 'No pudimos conectar con BsPlay.', body?.code ?? 'HTTP_ERROR', response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
