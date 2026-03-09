// main.js — entry point

import { createScene, createRenderer } from './core/scene.js'
import { createCamera } from './core/camera.js'
import { createLights } from './core/lights.js'
import { CameraController } from './controllers/CameraController.js'
import { InputHandler } from './controllers/InputHandler.js'
import { World } from './world/World.js'
import { Environment } from './world/Environment.js'
import { EnvironmentUI } from './ui/EnvironmentUI.js'

// Core
const { scene, clock } = createScene()
const renderer = createRenderer()
const camera = createCamera()


// Lights
createLights(scene)

// World
const world = new World(scene)

// Environment system
const environment = new Environment(scene, renderer)

// Camera controller
const cameraController = new CameraController(camera, renderer.domElement)

// Input — clicks and drags
const inputHandler = new InputHandler(camera, renderer.domElement, world)

// UI
const environmentUI = new EnvironmentUI(environment)

// Resize handler
  window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Animate loop
async function init() {
  await renderer.init()
  
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta()
    cameraController.update(delta)
    environment.update(delta)
    renderer.render(scene, camera)
  })
}

init()