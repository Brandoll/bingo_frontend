let audioContext: AudioContext | undefined
let noiseBuffer: AudioBuffer | undefined
let lastPlayedAt = 0

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
}

function getAudioContext() {
  if (audioContext) return audioContext
  const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext
  if (!AudioContextClass) return undefined
  audioContext = new AudioContextClass()
  return audioContext
}

function getNoiseBuffer(context: AudioContext) {
  if (noiseBuffer && noiseBuffer.sampleRate === context.sampleRate) return noiseBuffer
  noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 1.2), context.sampleRate)
  const samples = noiseBuffer.getChannelData(0)
  for (let index = 0; index < samples.length; index++) {
    samples[index] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

export async function prepareBingoCageSound() {
  const context = getAudioContext()
  if (!context) return false
  if (context.state === 'suspended') await context.resume()
  return context.state === 'running'
}

export function playBingoCageSound(duration = 0.82) {
  const nowMs = Date.now()
  if (nowMs - lastPlayedAt < 350) return
  lastPlayedAt = nowMs

  void prepareBingoCageSound().then(ready => {
    if (!ready || !audioContext) return
    const context = audioContext
    const now = context.currentTime
    const end = now + duration
    const master = context.createGain()
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.48, now + 0.035)
    master.gain.setValueAtTime(0.38, end - 0.18)
    master.gain.exponentialRampToValueAtTime(0.0001, end)
    master.connect(context.destination)

    const rollingNoise = context.createBufferSource()
    const highPass = context.createBiquadFilter()
    const lowPass = context.createBiquadFilter()
    const noiseGain = context.createGain()
    rollingNoise.buffer = getNoiseBuffer(context)
    highPass.type = 'highpass'
    highPass.frequency.value = 170
    lowPass.type = 'lowpass'
    lowPass.frequency.setValueAtTime(1850, now)
    lowPass.frequency.linearRampToValueAtTime(1150, end)
    noiseGain.gain.setValueAtTime(0.075, now)
    rollingNoise.connect(highPass).connect(lowPass).connect(noiseGain).connect(master)
    rollingNoise.start(now)
    rollingNoise.stop(end)

    const motor = context.createOscillator()
    const motorGain = context.createGain()
    motor.type = 'triangle'
    motor.frequency.setValueAtTime(34, now)
    motor.frequency.linearRampToValueAtTime(27, end)
    motorGain.gain.setValueAtTime(0.038, now)
    motor.connect(motorGain).connect(master)
    motor.start(now)
    motor.stop(end)

    const impacts = 11
    for (let index = 0; index < impacts; index++) {
      const impactAt = now + 0.035 + index * (duration - 0.11) / impacts + Math.random() * 0.035
      const impact = context.createOscillator()
      const impactGain = context.createGain()
      const panner = context.createStereoPanner()
      impact.type = index % 3 === 0 ? 'triangle' : 'sine'
      impact.frequency.setValueAtTime(430 + Math.random() * 820, impactAt)
      impact.frequency.exponentialRampToValueAtTime(180 + Math.random() * 230, impactAt + 0.055)
      impactGain.gain.setValueAtTime(0.0001, impactAt)
      impactGain.gain.exponentialRampToValueAtTime(0.12 + Math.random() * 0.08, impactAt + 0.004)
      impactGain.gain.exponentialRampToValueAtTime(0.0001, impactAt + 0.065)
      panner.pan.value = Math.random() * 1.5 - 0.75
      impact.connect(impactGain).connect(panner).connect(master)
      impact.start(impactAt)
      impact.stop(impactAt + 0.07)
    }
  }).catch(() => undefined)
}
