import * as THREE from 'three'
import { createRenderer } from './core/renderer.js'
import { createCamera } from './core/camera.js'
import { World } from './world/World.js'
import { Environment } from './world/Environment.js'
import { EnvironmentUI } from './ui/EnvironmentUI.js'
import Time from './utils/Time.js'

const renderer = createRenderer('bg')
const camera = createCamera(renderer)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

async function init() {
  await renderer.init()

  const scene = new THREE.Scene()
  const world = new World(scene)
  const environment = new Environment(scene, renderer)
  const environmentUI = new EnvironmentUI(environment)

  // Time starts AFTER renderer is ready
  const time = new Time()
  time.on('tick', () => {
    environment.update(time.delta / 1000)
    renderer.render(scene, camera)
  })
}

init()