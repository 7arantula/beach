import * as THREE from 'three/webgpu'
import { gsap } from 'gsap'
import Lights from '../core/Lights.js'
import Orchestrator from '../core/Orchestrator.js'

const TIME_PRESETS = {
  dawn: {
    sunColor:         0xffb347,
    sunIntensity:     1.0,
    sunPosition:      new THREE.Vector3(5, 5, 10),
    ambientColor:     0xffd0a0,
    ambientIntensity: 0.3,
    skyColor:         0xff7043,
    fogColor:         0xff7043,
    fogNear:          30,
    fogFar:           90,
  },
  day: {
    sunColor:         0xfff4e0,
    sunIntensity:     2,
    sunPosition:      new THREE.Vector3(10, 20, 10),
    ambientColor:     0xfff4e0,
    ambientIntensity: 0.5,
    skyColor:         0x87ceeb,
    fogColor:         0x87ceeb,
    fogNear:          40,
    fogFar:           100,
  },
  sunset: {
    sunColor:         0xff4500,
    sunIntensity:     1.5,
    sunPosition:      new THREE.Vector3(20, 4, 5),
    ambientColor:     0xff6030,
    ambientIntensity: 0.4,
    skyColor:         0xff6030,
    fogColor:         0xff6030,
    fogNear:          25,
    fogFar:           90,
  },
  night: {
    sunColor:         0x1a1a2e,
    sunIntensity:     -1,
    sunPosition:      new THREE.Vector3(-10, 10, -10),
    ambientColor:     0x0d0d2b,
    ambientIntensity: -1,
    skyColor:         0x7ea5c9,
    fogColor:         0x7ea5c9,
    fogNear:          25,
    fogFar:           75,
  },
}
const WEATHER_PRESETS = {
  clear:    { ambientMultiplier: 1.0,  sunMultiplier: 1.0  },
  overcast: { ambientMultiplier: 1.4,  sunMultiplier: 0.3  },
  rain:     { ambientMultiplier: 1.2,  sunMultiplier: 0.1  },
  storm:    { ambientMultiplier: 0.8,  sunMultiplier: 0.05 },
}
const OCEAN_PRESETS = {
  calm:   { waveAmplitude: 0.1, waveFrequency: 0.5, waveSpeed: 0.3 },
  choppy: { waveAmplitude: 0.4, waveFrequency: 1.2, waveSpeed: 0.8 },
  rough:  { waveAmplitude: 0.9, waveFrequency: 2.0, waveSpeed: 1.5 },
}

export default class Environment {
    constructor() {
    this.orchestrator = new Orchestrator()
    this.scene = this.orchestrator.scene

    // Lights
    this.lights = new Lights()
    
    this.currentTime    = 'day'
    this.currentWeather = 'clear'
    this.currentOcean   = 'calm'
    this.oceanUniforms  = null
    this._lightningTimer = 0

    console.log('sun exists?', this.lights.sun)
    this._applyTimePreset('day', 0)
  }

  //Set functions

  setTime(preset, duration = 2) {
    if (preset === this.currentTime) return
    this.currentTime = preset
    this._applyTimePreset(preset, duration)
  }

  setWeather(preset, duration = 1) {
    if (preset === this.currentWeather) return
    this.currentWeather = preset
    this._applyWeatherPreset(preset, duration)
  }

  setOcean(preset, duration = 1) {
    if (preset === this.currentOcean) return
    this.currentOcean = preset
    this._applyOceanPreset(preset, duration)
  }

  // ── Time of Day ──────────────────────────────────────────────────

_applyTimePreset(name, duration) {
  const p = TIME_PRESETS[name]
  if (!p || !this.lights.sun) return

  const sunColor     = new THREE.Color(p.sunColor)
  const ambientColor = new THREE.Color(p.ambientColor)
  const skyColor     = new THREE.Color(p.skyColor)
  const fogColor     = new THREE.Color(p.fogColor)

  if (duration === 0) {
    this.lights.sun.color.copy(sunColor)
    this.lights.sun.intensity = p.sunIntensity
    this.lights.sun.position.copy(p.sunPosition)
    this.lights.ambient.color.copy(ambientColor)
    this.lights.ambient.intensity = p.ambientIntensity
    this.scene.background = skyColor
    this.scene.fog = new THREE.Fog(fogColor, p.fogNear, p.fogFar)
    return
  }

    gsap.to(this.lights.sun.color,     { r: sunColor.r,     g: sunColor.g,     b: sunColor.b,     duration, overwrite: true })
    gsap.to(this.lights.sun,           { intensity: p.sunIntensity,                                duration, overwrite: true })
    gsap.to(this.lights.sun.position,  { x: p.sunPosition.x, y: p.sunPosition.y, z: p.sunPosition.z, duration })
    gsap.to(this.lights.ambient.color, { r: ambientColor.r, g: ambientColor.g, b: ambientColor.b, duration, overwrite: true })
    gsap.to(this.lights.ambient,       { intensity: p.ambientIntensity,                            duration, overwrite: true })
    gsap.to(this.scene.background,     { r: skyColor.r,     g: skyColor.g,     b: skyColor.b,     duration, overwrite: true })
    gsap.to(this.scene.fog.color,      { r: fogColor.r,     g: fogColor.g,     b: fogColor.b,     duration, overwrite: true })
    gsap.to(this.scene.fog,            { near: p.fogNear,   far: p.fogFar,                         duration, overwrite: true })
  }


  _applyWeatherPreset(name, duration) {
    const p = WEATHER_PRESETS[name]
    const t = TIME_PRESETS[this.currentTime]
    if (!p || !t) return

    gsap.to(this.lights.sun, { intensity: t.sunIntensity * p.sunMultiplier, duration , overwrite: true})
    gsap.to(this.lights.ambient, { intensity: t.ambientIntensity * p.ambientMultiplier, duration , overwrite: true})

    // Rain particle system — coming soon
    // if (name === 'rain' || name === 'storm') this.rain.setIntensity(name)
    // else this.rain.setIntensity('off')
  }


  _applyOceanPreset(name, duration) {
    const p = OCEAN_PRESETS[name]
    if (!p) return
    // OceanShader uniforms — coming soon
  }

 
  update(delta) {
    if (this.currentWeather === 'storm') {
      this._lightningTimer -= delta
      if (this._lightningTimer <= 0) {
        this._triggerLightning()
        this._lightningTimer = Math.random() * 4 + 2
      }
    }
  }

  _triggerLightning() {
    if (!this.lights.sun) return
    const originalIntensity = this.lights.sun.intensity
    gsap.timeline()
      .to(this.lights.sun, { intensity: 8,               duration: 0.05 })
      .to(this.lights.sun, { intensity: originalIntensity, duration: 0.1  })
      .to(this.lights.sun, { intensity: 6,               duration: 0.05 })
      .to(this.lights.sun, { intensity: originalIntensity, duration: 0.15 })
  }
}