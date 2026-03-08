import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


export class World {
constructor(scene) {
  this.scene = scene
  this.clickables = []
  this.objects = {}
  this.onClickCallbacks = {}
  this.isLoaded = false

  this.anchors = {
    hut:   new THREE.Vector3(0, 0, 0),
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

_loadScene() {
  this._loadStatic()
  this._loadDynamics()
  this._loadClickables()
}

_loadStatic() {
  this.loader.load('/models/static/island.glb', (gltf) => {
    const model = gltf.scene
    model.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
    })
    this.scene.add(model)
    console.log('Island loaded!')
  }, undefined, (error) => console.error('Island load error:', error))
}

_loadDynamics() {
  const dynamics = [
    { name: 'ocean',  path: '/models/dynamic/ocean.glb'  },
    { name: 'birds',  path: '/models/dynamic/birds.glb'  },
    { name: 'clouds', path: '/models/dynamic/clouds.glb' },
  ]

  dynamics.forEach(({ name, path }) => {
    this.loader.load(path, (gltf) => {
      const model = gltf.scene
      this.scene.add(model)
      this.objects[name] = model
      console.log(`${name} loaded!`)
    }, undefined, (error) => console.error(`${name} load error:`, error))
  })
}

_loadClickables() {
  const clickables = [
    { type: 'hut',   path: '/models/clickable/hut/hut_lo.glb'     },
    { type: 'bike',  path: '/models/clickable/bike/bike_lo.glb'    },
    { type: 'truck', path: '/models/clickable/truck/truck_lo.glb'  },
    { type: 'boat',  path: '/models/clickable/boat/boat_lo.glb'    },
  ]

  clickables.forEach(({ type, path }) => {
    this.loader.load(path, (gltf) => {
      const model = gltf.scene
      model.traverse((child) => {
        if (!child.isMesh) return
        child.castShadow = true
        child.receiveShadow = true
      })

      const anchor = this.anchors[type]
      if (anchor) model.position.copy(anchor)

      model.userData.clickable = true
      model.userData.type = type

      model.traverse((child) => {
      if (!child.isMesh) return
      child.addEventListener('click', () => {
      console.log(`Clicked: ${type}`)
      })
    })

      this.scene.add(model)
      this.clickables.push(model)
      this.objects[type] = model
      console.log(`${type} loaded!`)
    }, undefined, (error) => console.error(`${type} load error:`, error))
  })
}



// Call this when a vehicle is clicked — loads on demand
loadConfigurator(type, onLoaded) {
  console.log("Loading")
  const path = `/models/clickable/${type}/${type}_mid.glb`
  

  this.loader.load(path, (gltf) => {
    const model = gltf.scene
    model.traverse((child) => {
      if (!child.isMesh) return
      child.castShadow = true
      child.receiveShadow = true
    })

    const anchor = this.anchors[type]
    if (anchor) model.position.copy(anchor)

    model.userData.clickable = true
    model.userData.type = type

    this.scene.add(model)
    this.objects[`${type}_mid`] = model

    if (onLoaded) onLoaded(model)
  }, undefined, (error) => console.error(`${type} configurator load error:`, error))
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