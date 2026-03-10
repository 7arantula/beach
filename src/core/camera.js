// core/camera.js — camera setup and isometric configuration

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import Time from '../utils/Time';
import { angleDiff } from '../utils/math.js'

// Isometric config — tweak these to adjust the view
export const CAMERA_CONFIG = {
  distance: 45,        // how far from the hut
  height: 15,          // how high above the scene
  fov: 40,             // lower fov = more isometric feel
  defaultAngle: Math.PI / -0.75,     // default horizontal angle in radians
  target: new THREE.Vector3(0, 0, 0), // hut will sit at world center
}

let controls = null;
let diff = 0;
const originalAzimuth = 2.09;

export function createCamera(renderer) {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  const time = new Time();
  time.on('tick', () => {
    update()
  })

  controls = new OrbitControls(camera, renderer.domElement);
  controls.lookAt = CAMERA_CONFIG.target;
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.enablePan = false
  controls.enableZoom = false
  controls.minPolarAngle = Math.PI/2 - 0.35
  controls.maxPolarAngle = Math.PI/2 - 0.35
  controls.maxAzimuthAngle = -2
  controls.minAzimuthAngle = 0.2
  controls.update()

  controls.addEventListener('end', function(event) {
    const currentAzimuth = controls.getAzimuthalAngle()
    _springBack()
  });

  // Position camera at default isometric angle
  camera.position.set(
    Math.sin(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance,
    CAMERA_CONFIG.height,
    Math.cos(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance
  )

  camera.lookAt(CAMERA_CONFIG.target)

  return camera
}

//Revert back to original position

function _springBack() {
  const currentAzimuth = controls.getAzimuthalAngle()
  const diff = angleDiff(originalAzimuth, currentAzimuth)
  controls.rotateLeft(diff)
}


function update() {
  if (controls) {
    controls.update()
    //console.log(controls.getAzimuthalAngle());
  }
}