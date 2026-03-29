// src/shaders/OceanShader.js
import * as THREE from 'three/webgpu'
import {
  uniform,
  texture,
  uv,
  vec3,
  vec4,
  float,
  sin,
  mix,
  smoothstep,
  fract,
} from 'three/tsl'
import MeshStandardNodeMaterial from 'three/src/materials/nodes/MeshStandardNodeMaterial.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import Orchestrator from '../core/Orchestrator.js'

export default class OceanShader {
  constructor() {
    this.orchestrator = new Orchestrator()
    this.scene        = this.orchestrator.scene
    this.mesh         = null

    this.uTime          = uniform(0.0)

    // Depth
    this.uDepthFalloff  = uniform(1.1)
    this.uDepthStrength = uniform(0.1)

    // Colors
    this.uShallowColor  = uniform(new THREE.Color(0x52b8c4))
    this.uDeepColor     = uniform(new THREE.Color(0x062038))
    this.uFoamColor     = uniform(new THREE.Color(0xffffff))
    this.uShallowOpacity = uniform(1.0)  // I will add Opacity when a good enough island is ready.

    // Foam
    this.uFoamSpeed     = uniform(0.3)
    this.uFoamWidth     = uniform(0.3)
    this.uFoamStrength  = uniform(0.75)
    this.uFoamFrequency = uniform(3.0)

    // Rain
    this.uRainIntensity = uniform(0.0)

    // Wave — future
    this.uWaveSpeed     = uniform(10)
    this.uWaveAmplitude = uniform(1.0)

    this.loadMesh()
  }

  loadMesh() {
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)

    loader.load('/models/dynamic/ocean.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        if (!child.isMesh) return
        this.mesh = child
        this.mesh.material = this.buildMaterial()
        this.mesh.receiveShadow = true
      })
      this.scene.add(gltf.scene)
      console.log('Ocean loaded!')
    })
  }

  buildMaterial() {
    const maskTexture = new THREE.TextureLoader().load('/textures/Ocean.png')
    const distFromShore = texture(maskTexture, uv()).r

    // Depth 
    const depthT    = smoothstep(float(0.0), this.uDepthFalloff, distFromShore)
    const baseColor = mix(this.uShallowColor, this.uDeepColor, depthT)
    const baseAlpha = mix(this.uShallowOpacity, float(1.0), depthT)
    // Foam flowing TOWARD shore 
    const foamBand = fract(
      distFromShore.mul(this.uFoamFrequency).add(this.uTime.mul(this.uFoamSpeed))
    )

    const foamLine = smoothstep(
      float(1.0).sub(this.uFoamWidth),
      float(1.0),
      foamBand
    )

    // Foam zone — gradient transition area only
    const foamZone = smoothstep(float(0.05), float(0.25), distFromShore).mul(smoothstep(float(0.7), float(0.4), distFromShore))
    const foamAlpha     = foamLine.mul(foamZone).mul(this.uFoamStrength)
    const colorWithFoam = mix(baseColor, this.uFoamColor, foamAlpha)

    // ── Rain ripples ──────────────────────────────────────────────
    const oceanArea = smoothstep(float(0.3), float(0.6), distFromShore)
    const uvPos     = uv()
    const r1 = sin(uvPos.length().mul(60).sub(this.uTime.mul(4))).mul(0.5).add(0.5)
    const r2 = sin(uvPos.length().mul(60).sub(this.uTime.mul(4).add(2.1))).mul(0.5).add(0.5)
    const r3 = sin(uvPos.length().mul(60).sub(this.uTime.mul(4).add(4.2))).mul(0.5).add(0.5)
    const ripple      = r1.add(r2).add(r3).div(3).mul(oceanArea)
    const rippleAlpha = ripple.mul(this.uRainIntensity).mul(0.12)
    const finalColor  = mix(colorWithFoam, vec3(1, 1, 1), rippleAlpha)

    // ── Material ─────────────────────────────────────────────────
    const mat       = new MeshStandardNodeMaterial()
    mat.colorNode = vec4(finalColor, baseAlpha)
    mat.roughness   = 0.1
    mat.metalness   = 0.0
    mat.transparent = true
    mat.depthWrite  = false

    return mat
  }

  setOceanPreset(preset) {
    this.uWaveSpeed.value     = preset.waveSpeed
    this.uWaveAmplitude.value = preset.waveAmplitude
  }

  setRainIntensity(intensity) {
    this.uRainIntensity.value = intensity
  }

  setColors(shallowColor, deepColor) {
    this.uShallowColor.value.set(shallowColor)
    this.uDeepColor.value.set(deepColor)
  }

  update(delta) {
    this.uTime.value += delta
  }
}