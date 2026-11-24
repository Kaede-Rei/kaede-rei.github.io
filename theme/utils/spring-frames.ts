export function sampleSpring({ duration, stiffness, damping }: { duration: number, stiffness: number, damping: number }) {
  const decay = damping / 2
  const frequency = Math.sqrt(stiffness - decay ** 2)
  const steps = 26
  // Sample the underdamped spring at rest, so the browser can interpolate it on the compositor.
  return Array.from({ length: steps + 1 }, (_, index) => {
    if (index === steps) return 1
    const time = index / steps * duration / 1000
    const angle = frequency * time
    return 1 - Math.exp(-decay * time) * (Math.cos(angle) + decay / frequency * Math.sin(angle))
  })
}
