import * as THREE from 'three/webgpu'
import MeshStandardNodeMaterial from 'three/src/materials/nodes/MeshStandardNodeMaterial.js'
import Orchestrator from '../core/Orchestrator.js'

export const BIKE_CAMERA_CONFIG = {
  cameraPosition: new THREE.Vector3(0, 0, -10),
  cameraTarget:   new THREE.Vector3(0, 1, 0),
  swoopDuration:  2.0,
  dampingFactor: 0.02,
  
}

export const BIKE_FOG_CONFIG = {
  fogNear: 10,
  fogFar:  30,
}

const BIKE_PARTS = {
  headlight: {
    variants: [
      { name: 'Hood',  path: '/models/clickable/bike/parts/headlight_hood.glb'  },
      { name: 'Simple', path: '/models/clickable/bike/parts/headlight_simple.glb' },
      { name: 'Mesh',   path: '/models/clickable/bike/parts/headlight_mesh.glb'   },
    ]
  },
  wheels: {
    variants: [
      { name: 'Spokes',    path: '/models/clickable/bike/parts/wheels_spokes.glb'    },
      { name: 'Fan Blade', path: '/models/clickable/bike/parts/wheels_fanblade.glb'  },
    ]
  },
  mirrors: {
    variants: [
      { name: 'Top',    path: '/models/clickable/bike/parts/mirrors_top.glb'    },
      { name: 'Handle', path: '/models/clickable/bike/parts/mirrors_handle.glb' },
    ]
  },
  seat: {
    variants: [
      { name: 'Single',    path: '/models/clickable/bike/parts/seat_single.glb'    },
      { name: 'Passenger', path: '/models/clickable/bike/parts/seat_passenger.glb' },
    ]
  },
  // Toggles — just one GLB, visibility on/off
  exhaust:   { toggle: true, path: '/models/clickable/bike/parts/exhaust.glb'   },
  saddlebag: { toggle: true, path: '/models/clickable/bike/parts/saddlebag.glb' },
  windshield:{ toggle: true, path: '/models/clickable/bike/parts/windshield.glb'},
}

const HEADLIGHT_VARIANTS = [
  { name: 'round',  geometry: () => new THREE.SphereGeometry(0.3, 8, 8)        },
  { name: 'square', geometry: () => new THREE.BoxGeometry(0.5, 0.3, 0.2)       },
  { name: 'pill',   geometry: () => new THREE.CapsuleGeometry(0.15, 0.4, 4, 8) },
]

const BIKE_UI_CONFIG = {
  title: 'Bike',
  sections: [
    { label: 'Headlight', type: 'cycle',  options: ['Hood', 'Simple', 'Mesh'],        onChange: null },
    { label: 'Wheels',    type: 'cycle',  options: ['Spokes', 'Fan Blade'],             onChange: null },
    { label: 'Mirrors',   type: 'cycle',  options: ['Top', 'Handle'],                  onChange: null },
    { label: 'Seat',      type: 'cycle',  options: ['Single', 'Passenger'],             onChange: null },
    { label: 'Exhaust',   type: 'toggle', onChange: null },
    { label: 'Saddlebag', type: 'toggle', onChange: null },
    { label: 'Windshield',type: 'toggle', onChange: null },
    { label: 'Color',     type: 'color',  options: ['#222222', '#cc0000', '#0044cc', '#22aa44'], onChange: null },
  ]
}

export default class BikeConfigurator {
  constructor() {
    this.orchestrator    = new Orchestrator()
    this.scene           = this.orchestrator.scene
    this.parts           = {}
    this._headlightIndex = 0
    this._isOpen         = false

    this.build()
  }

  build() {
    const bodyMat   = new MeshStandardNodeMaterial({ color: 0x444444 })
    const accentMat = new MeshStandardNodeMaterial({ color: 0xffcc00 })
    const tyreMat   = new MeshStandardNodeMaterial({ color: 0x111111 })

    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 0.6), bodyMat)
    body.position.set(0, 1, 0)
    this.parts.body = body

    const headlight = new THREE.Mesh(HEADLIGHT_VARIANTS[0].geometry(), accentMat)
    headlight.position.set(1.2, 1.1, 0)
    this.parts.headlight = headlight

    const tyreGeo   = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16)
    const frontTyre = new THREE.Mesh(tyreGeo, tyreMat)
    frontTyre.rotation.x = Math.PI / 2
    frontTyre.position.set(1.2, 0.5, 0)
    this.parts.frontTyre = frontTyre

    const rearTyre = new THREE.Mesh(tyreGeo, tyreMat)
    rearTyre.rotation.x = Math.PI / 2
    rearTyre.position.set(-1.2, 0.5, 0)
    this.parts.rearTyre = rearTyre

    Object.values(this.parts).forEach(part => {
      part.visible       = false
      part.castShadow    = true
      part.receiveShadow = true
      this.scene.add(part)
    })
  }

  open() {
    if (this._isOpen) return
    this._isOpen = true
    
    this.orchestrator.configuratorOpen = true
    this.orchestrator.activeConfigurator = this

    // Wire callbacks now that this exists
    BIKE_UI_CONFIG.sections[0].onChange = (i) => this.setHeadlight(i)
    BIKE_UI_CONFIG.sections[1].onChange = (i) => this.setVariant('wheels', i)
    BIKE_UI_CONFIG.sections[2].onChange = (i) => this.setVariant('mirrors', i)
    BIKE_UI_CONFIG.sections[3].onChange = (i) => this.setVariant('seat', i)
    BIKE_UI_CONFIG.sections[4].onChange = (a) => this.setToggle('Exhaust', a)
    BIKE_UI_CONFIG.sections[5].onChange = (a) => this.setToggle('saddlebag', a)
    BIKE_UI_CONFIG.sections[6].onChange = (a) => this.setToggle('windshield', a)
    BIKE_UI_CONFIG.sections[7].onChange = (i, color) => this.setColor(color)

    this.orchestrator.world.hideWorld()
    Object.values(this.parts).forEach(part => part.visible = true)

    this.orchestrator.camera.applyConfig(BIKE_CAMERA_CONFIG, () => {
    try {
        console.log('applyConfig complete')
        this.orchestrator.configuratorUI.open(BIKE_UI_CONFIG)
      } catch(e) {
        console.error('callback error:', e)
      }
    })
  }

  close() {
    if (!this._isOpen) return
    this._isOpen = false
    this.orchestrator.configuratorOpen = false
    this.orchestrator.activeConfigurator = null

    this.orchestrator.configuratorUI.close()
    Object.values(this.parts).forEach(part => part.visible = false)

    this.orchestrator.camera.returnToWorld(() => {
      this.orchestrator.world.showWorld()
    })
  }

  // ── Part swaps ───────────────────────────────────────────────────

  setHeadlight(index) {
    this._headlightIndex = index
    const variant = HEADLIGHT_VARIANTS[index]
    this.parts.headlight.geometry.dispose()
    this.parts.headlight.geometry = variant.geometry()
  }

  setToggle(key, active) {
    console.log(key+"  "+active)
  // const mesh = this.toggleMeshes[key]
  // if (mesh) mesh.visible = active
  }

  setVariant(key, index) {
    const variants = this.variantMeshes[key]
    if (!variants) return
    variants.forEach((v, i) => v.visible = i === index)
  }

  setColor(color) {
    this.parts.body.material.color.set(color)
  }
}