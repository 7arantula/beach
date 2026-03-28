import * as THREE from 'three/webgpu'
import { gsap } from 'gsap'
import Lights from '../core/Lights.js'
import Orchestrator from '../core/Orchestrator.js'
import { TIME_PRESETS, WEATHER_PRESETS, OCEAN_PRESETS } from '../data/Data.js'


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