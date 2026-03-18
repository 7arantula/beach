// core/Camera.js
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import Time from '../utils/Time.js'
import { angleDiff } from '../utils/Math.js'
import Orchestrator from '../core/Orchestrator.js'

export const CAMERA_CONFIG = {
  distance:      45,
  height:        15,
  fov:           40,
  defaultAngle:  Math.PI / -0.75,
  target:        new THREE.Vector3(0, 0, 0),
  swoopDuration: 2.0,
}

const originalAzimuth = 2.09

export default class Camera {
  constructor() {
    this.orchestrator  = new Orchestrator()
    this.isSwooping    = false
    this._swoopTimer   = 0
    this._swoopFinal   = new THREE.Vector3()
    this._swoopCameraTarget = new THREE.Vector3()
    this._swoopOnComplete   = null
    this.createInstance()
  }

  createInstance() {
    this.instance = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    this.instance.position.set(
      Math.sin(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance,
      CAMERA_CONFIG.height,
      Math.cos(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance
    )

    const time = new Time()
    time.on('tick', () => this.update())
  }

  createControls() {
    this.renderer = this.orchestrator.renderer.instance
    this.controls = new OrbitControls(this.instance, this.renderer.domElement)
    this.controls.enableDamping    = true
    this.controls.dampingFactor    = 0.1
    this.controls.enablePan        = false
    this.controls.enableZoom       = false
    this.controls.minPolarAngle    = Math.PI / 2 - 0.35
    this.controls.maxPolarAngle    = Math.PI / 2 - 0.35
    this.controls.maxAzimuthAngle  = -2
    this.controls.minAzimuthAngle  = 0.2
    this.controls.update()

    this.controls.addEventListener('end', () => {
      if (!this.orchestrator.configuratorOpen) {
        this.springBack()
      }
    })
  }

  update() {
    if (!this.controls) return

    if (this.isSwooping) {
      this.controls.enabled = false
      this._swoopTimer += 1 / 60

      this.instance.position.lerp(this._swoopFinal, 0.02)
      this.controls.target.lerp(this._swoopCameraTarget, 0.02)

      if (this._swoopTimer > CAMERA_CONFIG.swoopDuration) {
        this.isSwooping = false
        this.controls.enabled = true
        if (this._swoopOnComplete) {
          this._swoopOnComplete()
          this._swoopOnComplete = null
        }
      }
    }

    this.controls.update()
  }

  springBack() {
    const currentAzimuth = this.controls.getAzimuthalAngle()
    const diff = angleDiff(originalAzimuth, currentAzimuth)
    this.controls.rotateLeft(diff)
  }

  // ── Zoom out toward a point, fire onComplete when done ───────────
  // Called by World.onSelect when user clicks a clickable object
  // onComplete: hide world, open configurator, call applyConfig

  cameraSwoop(targetPosition, onComplete) {
    this._swoopCameraTarget.copy(targetPosition)
    this._swoopFinal.set(
      Math.sin(CAMERA_CONFIG.defaultAngle) * (CAMERA_CONFIG.distance + 20),
      CAMERA_CONFIG.height + 100,
      Math.cos(CAMERA_CONFIG.defaultAngle) * (CAMERA_CONFIG.distance + 20)
    )
    this._swoopTimer      = 0
    this._swoopOnComplete = onComplete
    this.isSwooping       = true
  }

  // ── Zoom in to configurator position, fire onComplete when done ──
  // Called by each configurator's open() with its own CONFIG
  // onComplete: show configurator UI

  applyConfig(config, onComplete) {
    this._swoopFinal.copy(config.cameraPosition)
    this._swoopCameraTarget.copy(config.cameraTarget)
    this._swoopTimer      = 0
    this._swoopOnComplete = onComplete
    this.isSwooping       = true
    this.controls.dampingFactor = (config.dampingFactor)
  }

  // ── Return to world view ─────────────────────────────────────────
  // Called by configurator close()

  returnToWorld(onComplete) {
    this._swoopFinal.set(
      Math.sin(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance,
      CAMERA_CONFIG.height,
      Math.cos(CAMERA_CONFIG.defaultAngle) * CAMERA_CONFIG.distance
    )
    this._swoopCameraTarget.copy(CAMERA_CONFIG.target)
    this._swoopTimer      = 0
    this._swoopOnComplete = onComplete
    this.isSwooping       = true
    this.controls.dampingFactor = 0.1
  }
}