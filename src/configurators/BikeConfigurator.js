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
    this.orchestrator.configuratorOpen = true
    this.orchestrator.world.hideWorld()
    Object.values(this.parts).forEach(part => part.visible = true)

    // Back button
    this._backBtn = document.createElement('button')
    this._backBtn.textContent = '← Back'
    this._backBtn.id = 'configurator-back'
    this._backBtn.addEventListener('click', () => this.close())
    document.body.appendChild(this._backBtn)

    this.orchestrator.camera.applyConfig(BIKE_CAMERA_CONFIG, () => {
      const panel = document.getElementById('configurator')
      if (panel) panel.classList.add('open')
    })
  }

  close() {
    this.orchestrator.configuratorOpen = false
    Object.values(this.parts).forEach(part => part.visible = false)
    
    if (this._backBtn) {
      this._backBtn.remove()
      this._backBtn = null
    }

    this.orchestrator.camera.returnToWorld(() => {
      this.orchestrator.world.showWorld()
    })

    const panel = document.getElementById('configurator')
    if (panel) panel.classList.remove('open')
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