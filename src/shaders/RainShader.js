// shaders/RainShader.js — procedural rain billboard shader

import * as THREE from 'three'

// ── Vertex Shader ────────────────────────────────────────────────
const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // Screen space — always fills viewport exactly
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// ── Fragment Shader ──────────────────────────────────────────────
const fragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSpeed;
  uniform float uDensity;
  uniform float uAngle;     // wind angle
  uniform vec3  uColor;

  varying vec2 vUv;

  // ── Hash function for randomness ─────────────────────────────
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // ── Single rain layer ─────────────────────────────────────────
  float rainLayer(vec2 uv, float speed, float density, float time) {
  uv.x += uv.y * uAngle;

  vec2 scaledUv = uv * vec2(density * 30.0, density * 6.0);
  vec2 cell  = floor(scaledUv);
  vec2 local = fract(scaledUv);

  float offset = hash(cell);
  float width  = 0.02 + hash(cell + 0.1) * 0.03;
  float x      = 0.2 + hash(cell + 0.2) * 0.6;  // keep streaks away from edges

  float scroll = fract(local.y + time * speed + offset);

  // Softer fade at cell boundaries
  float edgeFade = smoothstep(0.0, 0.1, local.x) * smoothstep(1.0, 0.9, local.x);
  edgeFade      *= smoothstep(0.0, 0.05, local.y) * smoothstep(1.0, 0.95, local.y);

  float streak = smoothstep(width, 0.0, abs(local.x - x));
  streak *= smoothstep(0.0, 0.2, scroll);
  streak *= smoothstep(1.0, 0.5, scroll);
  streak *= edgeFade;

  return streak;
}

  void main() {
    // Two layers offset for depth
    float layer1 = rainLayer(vUv, uSpeed,        uDensity,        uTime);
    float layer2 = rainLayer(vUv, uSpeed * 0.7,  uDensity * 0.6,  uTime + 0.5) * 0.5;

    float rain = layer1 + layer2;
    rain = clamp(rain, 0.0, 1.0);

    gl_FragColor = vec4(uColor, rain * uOpacity);
  }
`

// ── RainShader class ─────────────────────────────────────────────

export class RainShader {
  constructor(scene) {
    this.scene = scene
    this.isVisible = false

    this.uniforms = {
      uTime:    { value: 0 },
      uOpacity: { value: 0 },
      uSpeed:   { value: 1.2 },
      uDensity: { value: 1.0 },
      uAngle:   { value: -0.2 },   // slight wind angle
      uColor:   { value: new THREE.Color(0xaaccff) },
    }

    this._build()
  }

  // ── Build Mesh ───────────────────────────────────────────────────

    _build() {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: this.uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.renderOrder = 999
    this.scene.add(this.mesh)
    }

  // ── Public API ───────────────────────────────────────────────────

  // Called by Environment.js with preset values
  setIntensity(preset) {
    const presets = {
      off:    { opacity: 0,    speed: 1.2, density: 1.0 },
      rain:   { opacity: 0.35, speed: 1.5, density: 1.2 },
      storm:  { opacity: 0.65, speed: 2.8, density: 1.8 },
    }

    const p = presets[preset] || presets.off

    // Smooth fade in/out via uniform tweening
    // Using manual lerp in update() — avoids GSAP dependency in shader
    this._targetOpacity = p.opacity
    this.uniforms.uSpeed.value   = p.speed
    this.uniforms.uDensity.value = p.density
  }

  // ── Update (called every frame) ──────────────────────────────────

  update(delta) {
    // Scroll rain
    this.uniforms.uTime.value += delta

    // Smooth opacity transition
    if (this._targetOpacity !== undefined) {
      this.uniforms.uOpacity.value += (
        this._targetOpacity - this.uniforms.uOpacity.value
      ) * 0.05
    }
  }
}