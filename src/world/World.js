// world/World.js — loads and manages the GLB scene, owns all 3D objects

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


export class World {
  constructor(scene) {
    this.scene = scene
    this.clickables = []        // meshes raycaster checks against
    this.objects = {}           // named references: bike, truck, boat, hut
    this.onClickCallbacks = {}  // registered callbacks per object type
    this.isLoaded = false

    this.anchors = {
    bike:  new THREE.Vector3(-4, 0, 2),
    truck: new THREE.Vector3(4, 0, 2),
    boat:  new THREE.Vector3(0, 0, -6),
}

    this._setupLoaders()
    this._loadScene()
}

  // ── Loaders ──────────────────────────────────────────────────────

  _setupLoaders() {
    // Draco for compressed GLBs — smaller file sizes
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

    this.loader = new GLTFLoader()
    this.loader.setDRACOLoader(draco)
  }

  // ── Scene Load ───────────────────────────────────────────────────

// Replace _loadScene() with this:

_loadScene() {
  this._loadPlaceholders()  // swap to this._loadStatic() when GLB is ready
}

_loadStatic() {
  this.loader.load('/models/static/beach_scene.glb', (gltf) => {
    const model = gltf.scene
    model.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
    })
    this.scene.add(model)
    console.log('Static scene loaded')
  })
}

// Call this when a vehicle is clicked — loads on demand
loadClickable(type, onLoaded) {
  const path = `/models/clickable/${type}/${type}_lo.glb`

  this.loader.load(path, (gltf) => {
    const model = gltf.scene
    model.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
    })

    // Position at anchor point
    const anchor = this.anchors[type]
    if (anchor) model.position.copy(anchor)

    // Tag as clickable
    model.userData.clickable = true
    model.userData.type = type

    this.scene.add(model)
    this.clickables.push(model)
    this.objects[type] = model

    if (onLoaded) onLoaded(model)
  })
}


  // ── Placeholders (remove when GLB is ready) ──────────────────────

  _loadPlaceholders() {
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 })

    const items = [
      { name: 'hut',   color: 0x8B4513, pos: [0, 0.5, 0],    size: [2, 1, 2]  },
      { name: 'bike',  color: 0x222222, pos: [-4, 0.25, 2],   size: [1, 0.5, 2]},
      { name: 'truck', color: 0x334455, pos: [4, 0.5, 2],     size: [2, 1, 3]  },
      { name: 'boat',  color: 0xffffff, pos: [0, 0.25, -6],   size: [1.5, 0.5, 4]},
    ]

    items.forEach(({ name, color, pos, size }) => {
      const geo = new THREE.BoxGeometry(...size)
      const mat = new THREE.MeshStandardMaterial({ color })
      const mesh = new THREE.Mesh(geo, mat)

      mesh.position.set(...pos)
      mesh.castShadow = true
      mesh.receiveShadow = true

      // Tag as clickable
      mesh.userData.clickable = true
      mesh.userData.type = name

      this.scene.add(mesh)
      this.clickables.push(mesh)
      this.objects[name] = mesh
    })

    // Ocean plane placeholder
    const oceanGeo = new THREE.PlaneGeometry(50, 50)
    const oceanMat = new THREE.MeshStandardMaterial({ color: 0x006994 })
    const ocean = new THREE.Mesh(oceanGeo, oceanMat)
    ocean.rotation.x = -Math.PI / 2
    ocean.position.y = -0.1
    this.scene.add(ocean)

    // Sand plane placeholder
    const sandGeo = new THREE.PlaneGeometry(30, 20)
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3 })
    const sand = new THREE.Mesh(sandGeo, sandMat)
    sand.rotation.x = -Math.PI / 2
    sand.position.set(0, 0, 4)
    this.scene.add(sand)

    this.isLoaded = true
    console.log('Placeholders loaded')
  }

  // ── Public API ───────────────────────────────────────────────────

  getClickables() {
    return this.clickables
  }

  // Called by InputHandler when something is clicked
  onObjectClick(type, position) {
    if (this.onClickCallbacks[type]) {
      this.onClickCallbacks[type](position)
    }
  }

  // Register a callback for when an object type is clicked
  // Usage: world.on('bike', (position) => { ... })
  on(type, callback) {
    this.onClickCallbacks[type] = callback
  }
}