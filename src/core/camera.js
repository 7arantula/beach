import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import Time from '../utils/Time.js';
import { angleDiff } from '../utils/Math.js'

// Isometric config — tweak these to adjust the view
export const CAMERA_CONFIG = {
  distance: 45,        // how far from the hut
  height: 15,          // how high above the scene
  fov: 40,             // lower fov = more isometric feel
  defaultAngle: Math.PI / -0.75,     // default horizontal angle in radians
  target: new THREE.Vector3(0, 0, 0), // hut will sit at world center
}

const originalAzimuth = 2.09;

export default class Camera {
    constructor() {

        this.createInstance()
    }

    createInstance() {
        this.instance = new THREE.PerspectiveCamera(
        CAMERA_CONFIG.fov,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    const time = new Time();
    time.on('tick', () => {
        this.update()
    })

    // Position camera at default isometric angle
    this.instance.position.set(
        Math.sin(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance,
        CAMERA_CONFIG.height,
        Math.cos(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance
    )
    }

    createControls(renderer){
    this.controls = new OrbitControls(this.instance, renderer.domElement);
    this.controls.lookAt = CAMERA_CONFIG.target;
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.1
    this.controls.enablePan = false
    this.controls.enableZoom = false
    this.controls.minPolarAngle = Math.PI/2 - 0.35
    this.controls.maxPolarAngle = Math.PI/2 - 0.35
    this.controls.maxAzimuthAngle = -2
    this.controls.minAzimuthAngle = 0.2
    this.controls.update()

    this.controls.addEventListener('end', () => {
        const currentAzimuth = this.controls.getAzimuthalAngle()
        this.springBack()
    });
    }

    update() {
    if (this.controls) {
        this.controls.update()
    }
    }

    springBack() {
    const currentAzimuth = this.controls.getAzimuthalAngle()
    const diff = angleDiff(originalAzimuth, currentAzimuth)
    this.controls.rotateLeft(diff)
    }
}