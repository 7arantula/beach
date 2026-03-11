// ── Interpolation ────────────────────────────────────────────────

// Linear interpolation
export function lerp(a, b, t) {
  return a + (b - a) * t
}

// Clamp a value between min and max
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

// Lerp clamped — won't overshoot
export function lerpClamped(a, b, t) {
  return lerp(a, b, clamp(t, 0, 1))
}

// ── Angles ───────────────────────────────────────────────────────

// Degrees to radians
export function degToRad(deg) {
  return deg * (Math.PI / 180)
}

// Radians to degrees
export function radToDeg(rad) {
  return rad * (180 / Math.PI)
}

// Shortest angle difference — for smooth rotation interpolation
// e.g. going from 350° to 10° goes +20° not -340°
export function angleDiff(a, b) {
  const diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  return diff < -Math.PI ? diff + Math.PI * 2 : diff
}

// ── Mapping ──────────────────────────────────────────────────────

// Map a value from one range to another
// e.g. mapRange(0.5, 0, 1, 0, 100) = 50
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

// ── Easing ───────────────────────────────────────────────────────

// Smooth step — smooth curve between 0 and 1
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

// Ease out cubic — fast start, slow end
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

// Ease in out cubic — slow start, fast middle, slow end
export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ── Randomness ───────────────────────────────────────────────────

// Random float between min and max
export function randFloat(min, max) {
  return Math.random() * (max - min) + min
}

// Random int between min and max inclusive
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
