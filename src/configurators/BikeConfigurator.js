// configurators/BikeConfigurator.js
import * as THREE from 'three/webgpu'
import MeshStandardNodeMaterial from 'three/src/materials/nodes/MeshStandardNodeMaterial.js'
import Orchestrator from '../core/Orchestrator.js'

// ── Configurator camera + fog config ─────────────────────────────
// Camera.applyConfig() reads this when configurator opens
export const BIKE_CAMERA_CONFIG = {
  cameraPosition: new THREE.Vector3(0, 0, -10),
  cameraTarget:   new THREE.Vector3(0, 1, 0),
  swoopDuration:  2.0,
  dampingFactor:  0.02,
}

export const BIKE_FOG_CONFIG = {
  fogNear: 10,
  fogFar:  30,
}

// ── Headlight variants ────────────────────────────────────────────
const HEADLIGHT_VARIANTS = [
  { name: 'round',  geometry: () => new THREE.SphereGeometry(0.3, 8, 8)        },
  { name: 'square', geometry: () => new THREE.BoxGeometry(0.5, 0.3, 0.2)       },
  { name: 'pill',   geometry: () => new THREE.CapsuleGeometry(0.15, 0.4, 4, 8) },
]

export default class BikeConfigurator {
  constructor() {
    this.orchestrator      = new Orchestrator()
    this.scene             = this.orchestrator.scene
    this.parts             = {}
    this._headlightIndex   = 0
    this._isOpen           = false

    this.build()
  }

  // ── Build placeholder geometry ────────────────────────────────────
  // All parts start hidden — only visible when open() is called
  // Replace geometries with GLTFLoader calls when real assets are ready

  build() {
    const bodyMat     = new MeshStandardNodeMaterial({ color: 0x444444 })
    const accentMat   = new MeshStandardNodeMaterial({ color: 0xffcc00 })
    const tyreMat     = new MeshStandardNodeMaterial({ color: 0x111111 })

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.6), bodyMat)
    body.position.set(0, 1, 0)
    this.parts.body = body

    // Headlight — starts with first variant
    const headlight = new THREE.Mesh(HEADLIGHT_VARIANTS[0].geometry(), accentMat)
    headlight.position.set(1.2, 1.1, 0)
    this.parts.headlight = headlight

    // Front tyre
    const tyreGeo   = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16)
    const frontTyre = new THREE.Mesh(tyreGeo, tyreMat)
    frontTyre.rotation.x = Math.PI / 2
    frontTyre.position.set(1.2, 0.5, 0)
    this.parts.frontTyre = frontTyre

    // Rear tyre
    const rearTyre = new THREE.Mesh(tyreGeo, tyreMat)
    rearTyre.rotation.x = Math.PI / 2
    rearTyre.position.set(-1.2, 0.5, 0)
    this.parts.rearTyre = rearTyre

    // Add all to scene hidden
    Object.values(this.parts).forEach(part => {
      part.visible      = false
      part.castShadow   = true
      part.receiveShadow = true
      this.scene.add(part)
    })
  }

  // ── Open ──────────────────────────────────────────────────────────
  // Called by World.onSelect after cameraSwoop completes
  // 1. Hide world objects
  // 2. Zoom camera in to bike config
  // 3. Show UI when camera arrives

  open() {
    if (this._isOpen) return
    this._isOpen = true

    // Hide world
    this.orchestrator.world.hideWorld()

    // Show parts
    Object.values(this.parts).forEach(part => part.visible = true)

    // Zoom camera in to bike position, show UI when done
    this.orchestrator.camera.applyConfig(BIKE_CAMERA_CONFIG, () => {
      // TODO: open BikeConfiguratorUI
      console.log('bike configurator UI ready')
    })

    // Apply fog config
    // TODO: this.orchestrator.environment.setFog(BIKE_FOG_CONFIG)
  }

  // ── Close ─────────────────────────────────────────────────────────
  // Called when user hits back/close button
  // 1. Hide parts + UI
  // 2. Return camera to world
  // 3. Show world again

  close() {
    if (!this._isOpen) return
    this._isOpen = false

    Object.values(this.parts).forEach(part => part.visible = false)
    // TODO: close BikeConfiguratorUI

    this.orchestrator.camera.returnToWorld(() => {
      this.orchestrator.world.showWorld()
    })
  }

  // ── Part swaps ────────────────────────────────────────────────────

  cycleHeadlight() {
    this._headlightIndex = (this._headlightIndex + 1) % HEADLIGHT_VARIANTS.length
    const variant = HEADLIGHT_VARIANTS[this._headlightIndex]
    this.parts.headlight.geometry.dispose()
    this.parts.headlight.geometry = variant.geometry()
    console.log('headlight variant:', variant.name)
  }
}