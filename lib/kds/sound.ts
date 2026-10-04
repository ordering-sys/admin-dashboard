export function playNewOrderChime() {
  if (typeof window === 'undefined') return

  try {
    const ctx = new AudioContext()
    const gain = ctx.createGain()
    gain.gain.value = 0.15
    gain.connect(ctx.destination)

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(start)
      osc.stop(start + duration)
    }

    playTone(880, ctx.currentTime, 0.12)
    playTone(1174.66, ctx.currentTime + 0.14, 0.18)

    window.setTimeout(() => {
      void ctx.close()
    }, 500)
  } catch {
    // Audio may be blocked until user gesture; ignore
  }
}
