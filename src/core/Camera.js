// core/Camera.js
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import Time from '../utils/Time.js'
import { angleDiff } from '../utils/Math.js'
import Orchestrator from '../core/Orchestrator.js'
import { CAMERA_CONFIG, ORIGINAL_AZIMUTH } from '../data/Data.js'


export default class Camera {
  constructor() {
    this.orchestrator       = new Orchestrator()
    this.isSwooping         = false
    this._swoopTimer        = 0
    this._swoopFinal        = new THREE.Vector3()
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
    this.controls.enableDamping   = true
    this.controls.dampingFactor   = 0.1
    this.controls.enablePan       = false
    this.controls.enableZoom      = false
    this.controls.minPolarAngle   = Math.PI / 2 - 0.35
    this.controls.maxPolarAngle   = Math.PI / 2 - 0.35
    this.controls.maxAzimuthAngle = -2
    this.controls.minAzimuthAngle = 0.2
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
        // Clear state BEFORE firing callback
        // so any new swoop started inside callback gets clean state
        this.isSwooping         = false
        this.controls.enabled   = true
        const callback          = this._swoopOnComplete
        this._swoopOnComplete   = null

        if (callback) callback()
      }
    }

    this.controls.update()
  }

  springBack() {
    const currentAzimuth = this.controls.getAzimuthalAngle()
    const diff = angleDiff(ORIGINAL_AZIMUTH, currentAzimuth)
    this.controls.rotateLeft(diff)
  }

  // ── Zoom out — called by World.onSelect on click ─────────────────

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

  // ── Zoom in — called by configurator open() ──────────────────────

  applyConfig(config, onComplete) {
    this._swoopFinal.copy(config.cameraPosition)
    this._swoopCameraTarget.copy(config.cameraTarget)
    this._swoopTimer      = 0
    this._swoopOnComplete = onComplete
    this.isSwooping       = true
    if (config.dampingFactor) this.controls.dampingFactor = config.dampingFactor
    this.controls.maxAzimuthAngle = Infinity
    this.controls.minAzimuthAngle = -Infinity
  }

  // ── Return to world — called by configurator close() ────────────

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
    this.controls.maxAzimuthAngle = -2
    this.controls.minAzimuthAngle = 0.2
  }
}