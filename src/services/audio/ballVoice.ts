const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const special: Record<number, string> = {
  10: 'diez', 11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince',
  16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
  21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco',
  26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve',
}
const tens: Record<number, string> = { 3: 'treinta', 4: 'cuarenta', 5: 'cincuenta', 6: 'sesenta', 7: 'setenta', 8: 'ochenta', 9: 'noventa' }

export function numberInSpanish(number: number) {
  if (number < 10) return units[number]
  if (special[number]) return special[number]
  const ten = Math.floor(number / 10)
  const unit = number % 10
  return unit ? `${tens[ten]} y ${units[unit]}` : tens[ten]
}

function bestSpanishVoice() {
  const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith('es'))
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase()
    return (/(natural|neural|premium|enhanced)/.test(name) ? 100 : 0)
      + (/(google|microsoft|apple)/.test(name) ? 30 : 0)
      + (/(elvira|dalia|paulina|mónica|monica|helena|luciana)/.test(name) ? 20 : 0)
      + (voice.localService ? 4 : 0)
  }
  return voices.sort((left, right) => score(right) - score(left))[0]
}

export function speakBallNumber(number: number, rate = 0.92) {
  if (!('speechSynthesis' in window) || !number) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(`Ha salido el número ${numberInSpanish(number)}`)
  utterance.lang = 'es-ES'
  utterance.rate = Math.min(1.15, Math.max(0.72, rate))
  utterance.pitch = 1.02
  utterance.volume = 1
  const voice = bestSpanishVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}
