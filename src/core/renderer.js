import * as THREE from 'three'
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js'

// export function createScene() {
// const scene = new THREE.Scene()

//   return scene
// }

export function createRenderer(canv) {
  const canvas = document.getElementById(canv)

  const renderer = new WebGPURenderer({
    canvas,
    antialias: true,
  })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  return renderer
}