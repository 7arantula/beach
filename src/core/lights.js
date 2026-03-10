//import * as THREE from 'three/webgpu'
import { DirectionalLight } from 'three/src/lights/DirectionalLight.js'
import { AmbientLight } from 'three/src/lights/AmbientLight.js'
import { HemisphereLight } from 'three/src/lights/HemisphereLight.js'

export const LIGHTS = {
  sun: null,
  ambient: null,
  hemisphere: null,
}

export function createLights(scene) {
  //const sun = new THREE.DirectionalLight(0xfff4e0, 2)
  const sun = new DirectionalLight(0xfff4e0, 2)
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

  const ambient = new AmbientLight(0x87ceeb, 0.4)
  scene.add(ambient)

  const hemisphere = new HemisphereLight(0x87ceeb, 0xd4a96a, 0.6)
  scene.add(hemisphere)

  LIGHTS.sun = sun
  LIGHTS.ambient = ambient
  LIGHTS.hemisphere = hemisphere

  return LIGHTS
}