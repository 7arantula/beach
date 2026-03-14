// controllers/InputHandler.js — raycasting, hover detection, click dispatch

import * as THREE from 'three'
import Orchestrator from '../core/Orchestrator.js'

export default class InputHandler {
  constructor() {
    this.orchestrator = new Orchestrator()
    this.camera = this.orchestrator.camera.instance
    this.canvas = this.orchestrator.renderer.instance.domElement

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this._clickStart = new THREE.Vector2()
    this._isDragging = false
    this._dragThreshold = 5
    this._hoveredObject = null
    this._clickables = []

    // onSelect is overridden by World after instantiation
    // World.js: this.inputHandler.onSelect = (object) => this.onSelect(object)
    this.onSelect = null

    this.bindEvents()
  }

  // ── Clickables ───────────────────────────────────────────────────
  // Called by World each time a new GLB finishes loading

  setClickables(objects) {
    this._clickables = objects
  }

  // ── Events ───────────────────────────────────────────────────────

  bindEvents() {
    this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e))
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e))
    this.canvas.addEventListener('pointerup',   (e) => this.onPointerUp(e))
  }

  onPointerDown(e) {
    this._clickStart.set(e.clientX, e.clientY)
    this._isDragging = false
  }

  onPointerMove(e) {
    this.pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1
    this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1

    const dx = e.clientX - this._clickStart.x
    const dy = e.clientY - this._clickStart.y
    if (Math.sqrt(dx * dx + dy * dy) > this._dragThreshold) {
      this._isDragging = true
    }

    this.checkHover()
  }

  onPointerUp(e) {
    if (this._isDragging) return
    this.checkClick()
  }

  // ── Raycasting ───────────────────────────────────────────────────

  getRaycastHit() {
    if (this._clickables.length === 0) return null

    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(this._clickables, true)
    if (hits.length === 0) return null

    // Walk up parent chain to find the root clickable object
    // Needed because raycaster hits child meshes, not the root GLB group
    let obj = hits[0].object
    while (obj && !this._clickables.includes(obj)) {
      obj = obj.parent
    }
    return obj || null
  }

  checkHover() {
    const hit = this.getRaycastHit()

    if (hit && hit !== this._hoveredObject) {
      this._hoveredObject = hit
      this.canvas.style.cursor = 'pointer'
    } else if (!hit && this._hoveredObject) {
      this._hoveredObject = null
      this.canvas.style.cursor = 'default'
    }
  }

  checkClick() {
    const hit = this.getRaycastHit()
    if (!hit) return

    // Dispatch to World.onSelect — World decides what happens next
    if (this.onSelect) this.onSelect(hit)
  }
}