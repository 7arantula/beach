import * as THREE from 'three'

export class InputHandler {
  constructor(camera, domElement, world) {
    this.camera = camera
    this.domElement = domElement
    this.world = world

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.isDragging = false
    this.dragStartX = 0
    this.dragStartY = 0
    this.dragThreshold = 5  // pixels — below this it's a click not a drag

    this._bindEvents()

    // Set initial cursor
    this.domElement.style.cursor = 'grab'
  }

  // ── Event Binding ───────────────────────────────────────────────

  _bindEvents() {
    // Mouse
    this.domElement.addEventListener('mousedown', this._onMouseDown.bind(this))
    this.domElement.addEventListener('mousemove', this._onMouseMove.bind(this))
    this.domElement.addEventListener('mouseup', this._onMouseUp.bind(this))

    // Touch
    this.domElement.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: true })
    this.domElement.addEventListener('touchend', this._onTouchEnd.bind(this))
  }

  // ── Mouse Handlers ──────────────────────────────────────────────

  _onMouseDown(e) {
    this.isDragging = false
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
  }

_onMouseMove(e) {
  const dx = Math.abs(e.clientX - this.dragStartX)
  const dy = Math.abs(e.clientY - this.dragStartY)
  if (dx > this.dragThreshold || dy > this.dragThreshold) {
    this.isDragging = true
  }

  this._updateMouse(e.clientX, e.clientY)
  const hit = this._raycast()

  let found = false
  if (hit) {
    let obj = hit.object
    while (obj) {
      if (obj.userData.clickable) { found = true; break }
      obj = obj.parent
    }
  }

  this.domElement.style.cursor = found ? 'pointer' : 'grab'
}

  _onMouseUp(e) {
    if (this.isDragging) return  // was a drag, not a click
    this._handleClick(e.clientX, e.clientY)
  }

  // ── Touch Handlers ──────────────────────────────────────────────

  _onTouchStart(e) {
    this.isDragging = false
    this.dragStartX = e.touches[0].clientX
    this.dragStartY = e.touches[0].clientY
  }

  _onTouchEnd(e) {
    const touch = e.changedTouches[0]
    const dx = Math.abs(touch.clientX - this.dragStartX)
    const dy = Math.abs(touch.clientY - this.dragStartY)

    if (dx < this.dragThreshold && dy < this.dragThreshold) {
      this._handleClick(touch.clientX, touch.clientY)
    }
  }

  // ── Core Click Logic ─────────────────────────────────────────────

_handleClick(clientX, clientY) {
  this._updateMouse(clientX, clientY)
  const hit = this._raycast()
  if (!hit) return

  // Traverse up the parent chain to find the clickable root
  let obj = hit.object
  while (obj) {
    if (obj.userData.clickable) break
    obj = obj.parent
  }

  if (!obj || !obj.userData.clickable) return

  const type = obj.userData.type
  console.log(`Clicked: ${type}`)
  this.world.onObjectClick(type, obj.position)
}

  // ── Raycasting ───────────────────────────────────────────────────

  _updateMouse(clientX, clientY) {
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1
  }

  _raycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const clickables = this.world.getClickables()
    if (!clickables || clickables.length === 0) return null

    const intersects = this.raycaster.intersectObjects(clickables, true)
    return intersects.length > 0 ? intersects[0] : null
  }
}