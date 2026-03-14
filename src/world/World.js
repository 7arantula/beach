// world/World.js
import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import MeshStandardNodeMaterial from 'three/src/materials/nodes/MeshStandardNodeMaterial.js'
import InputHandler from '../controllers/InputHandler.js'
import Orchestrator from '../core/Orchestrator.js'

export default class World {
  constructor() {
    this.orchestrator = new Orchestrator()
    this.scene = this.orchestrator.scene
    this.clickables = []
    this.objects = {}

    this.anchors = {
      hut:   new THREE.Vector3(0, 0, 0),
      bike:  new THREE.Vector3(-4, 0, 2),
      truck: new THREE.Vector3(4, 0, 2),
      boat:  new THREE.Vector3(0, 0, -6),
    }

    this.setupLoaders()
    this.loadScene()

    // ── Input ──────────────────────────────────────────────────────
    // InputHandler lives here because clicks are about world objects
    // onSelect is defined here so World controls what happens on click
    // Future: camera.focusOn(object) + open configurator UI
    this.inputHandler = new InputHandler()
    this.inputHandler.onSelect = (object) => this.onSelect(object)
  }

  // ── Loaders ──────────────────────────────────────────────────────

  setupLoaders() {
    const draco = new DRACOLoader()
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    this.loader = new GLTFLoader()
    this.loader.setDRACOLoader(draco)
  }

  // ── Material Conversion ──────────────────────────────────────────

  convertMaterials(model) {
    model.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true

      const oldMat = child.material
      const newMat = new MeshStandardNodeMaterial()
      newMat.color.copy(oldMat.color)
      newMat.map = oldMat.map
      newMat.roughness = oldMat.roughness ?? 1
      newMat.metalness = oldMat.metalness ?? 0
      newMat.normalMap = oldMat.normalMap
      newMat.normalScale = oldMat.normalScale
      newMat.aoMap = oldMat.aoMap
      newMat.aoMapIntensity = oldMat.aoMapIntensity
      newMat.emissive = oldMat.emissive
      newMat.emissiveMap = oldMat.emissiveMap
      newMat.emissiveIntensity = oldMat.emissiveIntensity
      newMat.roughnessMap = oldMat.roughnessMap
      newMat.metalnessMap = oldMat.metalnessMap
      newMat.transparent = oldMat.transparent
      newMat.opacity = oldMat.opacity
      newMat.alphaMap = oldMat.alphaMap
      newMat.side = oldMat.side
      newMat.vertexColors = oldMat.vertexColors
      child.material = newMat
    })
  }

  // ── Scene Load ───────────────────────────────────────────────────

  loadScene() {
    this.loadStatic()
    this.loadDynamics()
    this.loadClickables()
  }

  loadStatic() {
    this.loader.load('/models/static/island.glb', (gltf) => {
      const model = gltf.scene
      this.convertMaterials(model)
      this.scene.add(model)
      console.log('Island loaded!')
    }, undefined, (error) => console.error('Island load error:', error))
  }

  loadDynamics() {
    const dynamics = [
      { name: 'ocean', path: '/models/dynamic/ocean.glb' },
      // { name: 'birds',  path: '/models/dynamic/birds.glb'  },
      // { name: 'clouds', path: '/models/dynamic/clouds.glb' },
    ]

    dynamics.forEach(({ name, path }) => {
      this.loader.load(path, (gltf) => {
        const model = gltf.scene
        this.convertMaterials(model)
        if (name === 'ocean') model.visible = true // hidden until OceanShader takes over
        this.scene.add(model)
        this.objects[name] = model
        console.log(`${name} loaded!`)
      }, undefined, (error) => console.error(`${name} load error:`, error))
    })
  }

  loadClickables() {
    const clickables = [
      { type: 'hut',   path: '/models/clickable/hut/hut_lo.glb'    },
      // { type: 'bike',  path: '/models/clickable/bike/bike_lo.glb'   },
      // { type: 'truck', path: '/models/clickable/truck/truck_lo.glb' },
      // { type: 'boat',  path: '/models/clickable/boat/boat_lo.glb'   },
    ]

    clickables.forEach(({ type, path }) => {
      this.loader.load(path, (gltf) => {
        const model = gltf.scene
        this.convertMaterials(model)

        const anchor = this.anchors[type]
        if (anchor) model.position.copy(anchor)

        // userData.type is how onSelect knows which configurator to open
        model.userData.clickable = true
        model.userData.type = type

        this.scene.add(model)
        this.clickables.push(model)
        this.objects[type] = model

        // Update InputHandler every time a new clickable finishes loading
        // since loading is async — clickables arrive one by one
        this.inputHandler.setClickables(this.clickables)

        console.log(`${type} loaded!`)
      }, undefined, (error) => console.error(`${type} load error:`, error))
    })
  }

  // ── Click Handler ─────────────────────────────────────────────────
  // This is the central hub for what happens when a clickable is clicked
  // Phase 2: call this.orchestrator.camera.focusOn(object.position)
  // Phase 2: then open the matching configurator based on object.userData.type

  onSelect(object) {
    const type = object.userData.type
    const worldPos = new THREE.Vector3()
    object.getWorldPosition(worldPos)
    this.orchestrator.camera.cameraSwoop(worldPos, () => {
    console.log(`swoop complete — ready to open ${type} configurator`)
    })
  }

  // ── FUTURE: Configurator loader ───────────────────────────────────
  // Called after camera finishes swooping to the object
  // Swaps lo model for mid model, opens configurator UI panel

  // openConfigurator(type) {
  //   this.loader.load(`/models/clickable/${type}/${type}_mid.glb`, (gltf) => {
  //     const model = gltf.scene
  //     this.convertMaterials(model)
  //     model.position.copy(this.anchors[type])
  //     this.scene.add(model)
  //     this.objects[`${type}_mid`] = model
  //     // remove lo model
  //     this.scene.remove(this.objects[type])
  //     // open UI panel — BikeConfigurator / TruckConfigurator etc
  //   })
  // }
}