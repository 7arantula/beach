// core/lights.js — all lighting setup

import * as THREE from 'three'

// Light config — Environment.js will import and tweak these for day/night
export const LIGHTS = {
  sun: null,
  ambient: null,
  hemisphere: null,
}

export function createLights(scene) {

  // Sun — main directional light, casts shadows
  const sun = new THREE.DirectionalLight(0xfff4e0, 2)
  sun.position.set(10, 20, 10)
  sun.castShadow = true
  sun.shadow.mapSize.width = 2048
  sun.shadow.mapSize.height = 2048
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 100
  sun.shadow.camera.left = -20
  sun.shadow.camera.right = 20
  sun.shadow.camera.top = 20
  sun.shadow.camera.bottom = -20
  sun.shadow.bias = -0.001
  scene.add(sun)

  // Ambient — base fill light so shadows aren't pure black
  const ambient = new THREE.AmbientLight(0x87ceeb, 0.4)
  scene.add(ambient)

  // Hemisphere — sky/ground color bleed, adds depth
  const hemisphere = new THREE.HemisphereLight(
    0x87ceeb,  // sky color
    0xd4a96a,  // ground color
    0.6
  )
  scene.add(hemisphere)

  // Store references so Environment.js can modify them later
  LIGHTS.sun = sun
  LIGHTS.ambient = ambient
  LIGHTS.hemisphere = hemisphere

  return LIGHTS
}