import * as THREE from 'three/webgpu'
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js'
import Orchestrator from '../core/Orchestrator.js'

export default class Renderer {
  constructor() {
    
    this.orchestrator = new Orchestrator()
    this.canvas = document.getElementById(this.orchestrator.canvas)
    this.scene = this.orchestrator.scene
    this.camera = this.orchestrator.camera.instance

    

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