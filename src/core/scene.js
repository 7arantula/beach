// core/scene.js — Three.js infrastructure only

import * as THREE from 'three'

export function createScene() {
  const scene = new THREE.Scene()
  const clock = new THREE.Clock()

  return { scene, clock }
}

export function createRenderer() {
  const canvas = document.getElementById('bg')

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  })

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.outputColorSpace = THREE.SRGBColorSpace

  return renderer
}