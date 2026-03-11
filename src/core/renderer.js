import * as THREE from 'three/webgpu'
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js'

export default class Renderer {
  constructor(canvasName, scene, camera) {
    this.canvas = document.getElementById(canvasName)
    this.scene = scene;
    this.camera = camera;

    this.createInstance()
  }

  createInstance() {

  this.instance = new WebGPURenderer({
    canvas: this.canvas,
    antialias: true,
  })

  this.instance.setSize(window.innerWidth, window.innerHeight)
  this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  this.instance.shadowMap.enabled = true
  this.instance.toneMapping = THREE.ACESFilmicToneMapping
  this.instance.toneMappingExposure = 1.0
  
  this.instance.setAnimationLoop(() => {
    this.update()
  })
  }

  update() {
  if (this.instance) {
      this.instance.render(this.scene, this.camera)
    }
}
}