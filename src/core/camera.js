// core/camera.js — camera setup and isometric configuration

import * as THREE from 'three'

// Isometric config — tweak these to adjust the view
export const CAMERA_CONFIG = {
  distance: 45,        // how far from the hut
  height: 20,          // how high above the scene
  fov: 40,             // lower fov = more isometric feel
  defaultAngle: Math.PI / -0.75,     // default horizontal angle in radians
  target: new THREE.Vector3(0, 10, 0), // hut will sit at world center
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  // Position camera at default isometric angle
  camera.position.set(
    Math.sin(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance,
    CAMERA_CONFIG.height,
    Math.cos(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance
  )

  camera.lookAt(CAMERA_CONFIG.target)

  return camera
}