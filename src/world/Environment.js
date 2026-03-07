// world/Environment.js — day/night, weather, ocean mood systems

import * as THREE from 'three'
import { gsap } from 'gsap'
import { LIGHTS } from '../core/lights.js'
import { RainShader } from '../shaders/RainShader.js'



// All presets live here — easy to tweak values later
const TIME_PRESETS = {
  dawn: {
    sunColor:       0xffb347,
    sunIntensity:   1.0,
    sunPosition:    new THREE.Vector3(5, 5, 10),
    ambientColor:   0xffd0a0,
    ambientIntensity: 0.3,
    skyColor:       0xff7043,
    fogColor:       0xff7043,
    fogNear:        30,
    fogFar:         80,
  },
  day: {
    sunColor:       0xfff4e0,
    sunIntensity:   2.0,
    sunPosition:    new THREE.Vector3(10, 20, 10),
    ambientColor:   0x87ceeb,
    ambientIntensity: 0.5,
    skyColor:       0x87ceeb,
    fogColor:       0x87ceeb,
    fogNear:        40,
    fogFar:         100,
  },
  sunset: {
    sunColor:       0xff4500,
    sunIntensity:   1.5,
    sunPosition:    new THREE.Vector3(20, 4, 5),
    ambientColor:   0xff6030,
    ambientIntensity: 0.4,
    skyColor:       0xff6030,
    fogColor:       0xff6030,
    fogNear:        25,
    fogFar:         70,
  },
  night: {
    sunColor:       0x1a1a2e,
    sunIntensity:   0.1,
    sunPosition:    new THREE.Vector3(-10, 10, -10),
    ambientColor:   0x0d0d2b,
    ambientIntensity: 0.15,
    skyColor:       0x0a0a1a,
    fogColor:       0x0a0a1a,
    fogNear:        20,
    fogFar:         60,
  },
}

const WEATHER_PRESETS = {
  clear: {
    fogDensityMultiplier: 1.0,
    ambientMultiplier:    1.0,
    sunMultiplier:        1.0,
  },
  overcast: {
    fogDensityMultiplier: 0.6,
    ambientMultiplier:    1.4,
    sunMultiplier:        0.3,
  },
  rain: {
    fogDensityMultiplier: 0.4,
    ambientMultiplier:    1.2,
    sunMultiplier:        0.1,
  },
  storm: {
    fogDensityMultiplier: 0.3,
    ambientMultiplier:    0.8,
    sunMultiplier:        0.05,
  },
}

const OCEAN_PRESETS = {
  calm:   { waveAmplitude: 0.1, waveFrequency: 0.5, waveSpeed: 0.3 },
  choppy: { waveAmplitude: 0.4, waveFrequency: 1.2, waveSpeed: 0.8 },
  rough:  { waveAmplitude: 0.9, waveFrequency: 2.0, waveSpeed: 1.5 },
}

export class Environment {
  constructor(scene) {
    this.rain = new RainShader(scene)
    this.scene = scene

    this.currentTime    = 'day'
    this.currentWeather = 'clear'
    this.currentOcean   = 'calm'

    // Ocean shader uniforms will be set here once OceanShader.js exists
    this.oceanUniforms = null

    // Lightning state for storm
    this._lightningTimer = 0

    // Apply defaults
    this._applyTimePreset('day', 0)
  }

  // ── Public API ───────────────────────────────────────────────────

  setTime(preset, duration = 2.0) {
    if (preset === this.currentTime) return
    this.currentTime = preset
    this._applyTimePreset(preset, duration)
  }

  setWeather(preset, duration = 2.0) {
    if (preset === this.currentWeather) return
    this.currentWeather = preset
    this._applyWeatherPreset(preset, duration)
  }

  setOcean(preset, duration = 2.0) {
    if (preset === this.currentOcean) return
    this.currentOcean = preset
    this._applyOceanPreset(preset, duration)
  }

  // ── Time of Day ──────────────────────────────────────────────────

  _applyTimePreset(name, duration) {
    const p = TIME_PRESETS[name]
    if (!p || !LIGHTS.sun) return

    const skyColor = new THREE.Color(p.skyColor)
    const fogColor = new THREE.Color(p.fogColor)

    if (duration === 0) {
      // Instant — on init
      LIGHTS.sun.color.set(p.sunColor)
      LIGHTS.sun.intensity = p.sunIntensity
      LIGHTS.sun.position.copy(p.sunPosition)
      LIGHTS.ambient.color.set(p.ambientColor)
      LIGHTS.ambient.intensity = p.ambientIntensity
      this.scene.background = skyColor
      if (this.scene.fog) {
        this.scene.fog.color.copy(fogColor)
        this.scene.fog.near = p.fogNear
        this.scene.fog.far = p.fogFar
      } else {
        this.scene.fog = new THREE.Fog(fogColor, p.fogNear, p.fogFar)
      }
      return
    }

    // Animated transition with GSAP
    gsap.to(LIGHTS.sun.color, { 
      r: skyColor.r, g: skyColor.g, b: skyColor.b, 
      duration 
    })
    gsap.to(LIGHTS.sun, { 
      intensity: p.sunIntensity, 
      duration 
    })
    gsap.to(LIGHTS.sun.position, { 
      x: p.sunPosition.x, 
      y: p.sunPosition.y, 
      z: p.sunPosition.z, 
      duration 
    })
    gsap.to(LIGHTS.ambient.color, { 
      r: fogColor.r, g: fogColor.g, b: fogColor.b, 
      duration 
    })
    gsap.to(LIGHTS.ambient, { 
      intensity: p.ambientIntensity, 
      duration 
    })
    gsap.to(this.scene.background, { 
      r: skyColor.r, g: skyColor.g, b: skyColor.b, 
      duration 
    })
    gsap.to(this.scene.fog.color, { 
      r: fogColor.r, g: fogColor.g, b: fogColor.b, 
      duration 
    })
    gsap.to(this.scene.fog, { 
      near: p.fogNear, 
      far: p.fogFar, 
      duration 
    })
  }

  // ── Weather ──────────────────────────────────────────────────────

  _applyWeatherPreset(name, duration) {
    const p = WEATHER_PRESETS[name]
    const t = TIME_PRESETS[this.currentTime]
    if (!p || !t) return

    gsap.to(LIGHTS.sun, {
      intensity: t.sunIntensity * p.sunMultiplier,
      duration
    })
    gsap.to(LIGHTS.ambient, {
      intensity: t.ambientIntensity * p.ambientMultiplier,
      duration
    })

        if (name === 'rain')         this.rain.setIntensity('rain')
        else if (name === 'storm')   this.rain.setIntensity('storm')
        else                         this.rain.setIntensity('off')
    }


  // ── Ocean Mood ───────────────────────────────────────────────────

  _applyOceanPreset(name, duration) {
    const p = OCEAN_PRESETS[name]
    if (!p) return

    // When OceanShader.js exists, this will drive its uniforms
    // this.oceanUniforms.uAmplitude.value = p.waveAmplitude etc
    // For now just log
    console.log(`Ocean mood: ${name}`, p)

    if (name === 'rough') {
      console.log('Boat rock animation — coming in Phase 6')
    }
  }

  // ── Update (called every frame) ──────────────────────────────────

  update(delta) {
    // Lightning flicker during storm
    this.rain.update(delta)
    if (this.currentWeather === 'storm') {
      this._lightningTimer -= delta
      if (this._lightningTimer <= 0) {
        this._triggerLightning()
        this._lightningTimer = Math.random() * 4 + 2  // every 2-6 seconds
      }
    }
  }

  // ── Lightning ────────────────────────────────────────────────────

  _triggerLightning() {
    if (!LIGHTS.sun) return
    const originalIntensity = LIGHTS.sun.intensity

    gsap.timeline()
      .to(LIGHTS.sun, { intensity: 8, duration: 0.05 })
      .to(LIGHTS.sun, { intensity: originalIntensity, duration: 0.1 })
      .to(LIGHTS.sun, { intensity: 6, duration: 0.05 })
      .to(LIGHTS.sun, { intensity: originalIntensity, duration: 0.15 })
  }
}