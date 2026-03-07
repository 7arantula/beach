import * as THREE from 'three'
import { gsap } from 'gsap'
import { CAMERA_CONFIG } from '../core/camera.js'
import { lerp, clamp } from '../utils/math.js'

const MAX_ROTATION = Math.PI / 1.5 // 90 degrees either side
const DRAG_SPEED = 0.005           // how fast drag rotates
const SPRING_SPEED = 0.08          // spring back lerp factor

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera
    this.domElement = domElement

    this.currentAngle = CAMERA_CONFIG.defaultAngle  // current horizontal angle
    this.targetAngle = CAMERA_CONFIG.defaultAngle   // where we're springing to
    this.isDragging = false
    this.dragStartX = 0
    this.angleOnDragStart = 0
    this.isFocused = false  // true when zoomed into a vehicle

    this._bindEvents()
  }

  // ── Event Binding ───────────────────────────────────────────────

  _bindEvents() {
    // Mouse
    this.domElement.addEventListener('mousedown', this._onDragStart.bind(this))
    this.domElement.addEventListener('mousemove', this._onDragMove.bind(this))
    this.domElement.addEventListener('mouseup', this._onDragEnd.bind(this))
    this.domElement.addEventListener('mouseleave', this._onDragEnd.bind(this))

    // Touch
    this.domElement.addEventListener('touchstart', this._onTouchStart.bind(this))
    this.domElement.addEventListener('touchmove', this._onTouchMove.bind(this))
    this.domElement.addEventListener('touchend', this._onDragEnd.bind(this))
  }

  // ── Drag Handlers ───────────────────────────────────────────────

  _onDragStart(e) {
    if (this.isFocused) return
    this.isDragging = true
    this.dragStartX = e.clientX
    this.angleOnDragStart = this.currentAngle
    this.domElement.style.cursor = 'grabbing'
  }

  _onDragMove(e) {
    if (!this.isDragging || this.isFocused) return
    const delta = (e.clientX - this.dragStartX) * DRAG_SPEED
    const newAngle = this.angleOnDragStart - delta

    // Clamp to ±90°
    this.targetAngle = Math.max(
    CAMERA_CONFIG.defaultAngle - MAX_ROTATION,
    Math.min(CAMERA_CONFIG.defaultAngle + MAX_ROTATION, newAngle)
    )
  }

  _onDragEnd() {
    if (!this.isDragging) return
    this.isDragging = false
    this.domElement.style.cursor = 'grab'

    // Spring back to default
    this.targetAngle = CAMERA_CONFIG.defaultAngle
  }

  // ── Touch Handlers ──────────────────────────────────────────────

  _onTouchStart(e) {
    if (this.isFocused) return
    this.isDragging = true
    this.dragStartX = e.touches[0].clientX
    this.angleOnDragStart = this.currentAngle
  }

  _onTouchMove(e) {
    if (!this.isDragging || this.isFocused) return
    const delta = (e.touches[0].clientX - this.dragStartX) * DRAG_SPEED
    const newAngle = this.angleOnDragStart - delta

    this.targetAngle = Math.max(
    CAMERA_CONFIG.defaultAngle - MAX_ROTATION,
    Math.min(CAMERA_CONFIG.defaultAngle + MAX_ROTATION, newAngle)
    )
  }

  // ── Focus / Unfocus (vehicle click) ─────────────────────────────

  focusOn(position, onComplete) {
    this.isFocused = true
    this.domElement.style.cursor = 'default'

    gsap.to(this.camera.position, {
      x: position.x,
      y: position.y + 3,
      z: position.z + 6,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.camera.lookAt(position)
      },
      onComplete
    })
  }

  unfocus(onComplete) {
    const defaultPos = this._angleToPosition(this.currentAngle)

    gsap.to(this.camera.position, {
      x: defaultPos.x,
      y: CAMERA_CONFIG.height,
      z: defaultPos.z,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.camera.lookAt(CAMERA_CONFIG.target)
      },
      onComplete: () => {
        this.isFocused = false
        this.domElement.style.cursor = 'grab'
        if (onComplete) onComplete()
      }
    })
  }

  // ── Helpers ─────────────────────────────────────────────────────

  _angleToPosition(angle) {
    return new THREE.Vector3(
      Math.sin(angle) * CAMERA_CONFIG.distance,
      CAMERA_CONFIG.height,
      Math.cos(angle) * CAMERA_CONFIG.distance
    )
  }

  // ── Update (called every frame) ──────────────────────────────────

  update(delta) {
    if (this.isFocused) return

    this.currentAngle = lerp(this.currentAngle, this.targetAngle, SPRING_SPEED)

    const pos = this._angleToPosition(this.currentAngle)
    this.camera.position.set(pos.x, pos.y, pos.z)
    this.camera.lookAt(CAMERA_CONFIG.target)
  }
}