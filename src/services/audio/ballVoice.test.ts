import { describe, expect, it } from 'vitest'
import { numberInSpanish } from './ballVoice'

describe('numberInSpanish', () => {
  it('pronounces bingo balls naturally in Spanish', () => {
    expect(numberInSpanish(1)).toBe('uno')
    expect(numberInSpanish(22)).toBe('veintidós')
    expect(numberInSpanish(42)).toBe('cuarenta y dos')
    expect(numberInSpanish(90)).toBe('noventa')
  })
})
