import * as THREE from 'three/webgpu'
import Renderer from '../core/Renderer.js'
import Camera from '../core/Camera.js'
import Environment from '../world/Environment.js'
import World from '../world/World.js'
import EnvironmentUI from '../ui/EnvironmentUI.js'
import Time from '../utils/Time.js'
import BikeConfigurator from '../configurators/BikeConfigurator.js'
import ConfiguratorUI from '../ui/ConfiguratorUI.js'
import OceanShader from '../shaders/OceanShader.js'

let instance = null


export default class Orchestrator {
  constructor() {
    if (instance) return instance
    instance = this

    this.configuratorOpen = false
    this.canvas = 'bg'
    this.scene = new THREE.Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.controls = this.camera.createControls()
    this.world = new World()
    this.ocean = new OceanShader()
    this.environment = new Environment()
    this.environmentUI = new EnvironmentUI()
    this.configuratorUI = new ConfiguratorUI()
    this.activeConfigurator = null
    // Configurators after everything else is ready
    this.bikeConfigurator = new BikeConfigurator()

    window.addEventListener('resize', () => {
      this.camera.instance.aspect = window.innerWidth / window.innerHeight
      this.camera.instance.updateProjectionMatrix()
      this.renderer.instance.setSize(window.innerWidth, window.innerHeight)
      this.renderer.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    const time = new Time()
    time.on('tick', () => {
      this.environment.update(time.delta / 1000)
    })
  }
}