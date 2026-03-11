import * as THREE from 'three/webgpu'
import { DirectionalLight } from 'three/src/lights/DirectionalLight.js'
import { AmbientLight } from 'three/src/lights/AmbientLight.js'
import { HemisphereLight } from 'three/src/lights/HemisphereLight.js'
import Orchestrator from './Orchestrator.js'

export default class Lights{
  constructor(){
    this.orchestrator = new Orchestrator()
    this.scene = this.orchestrator.scene
    this.createLights(this.scene)
  }

  createLights(scene){
    // this.sun = new THREE.DirectionalLight(0xfff4e0, 2)
    this.sun = new DirectionalLight(0xfff4e0, 2)
    this.sun.position.set(10, 20, 10)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.width = 2048
    this.sun.shadow.mapSize.height = 2048
    this.sun.shadow.camera.near = 0.5
    this.sun.shadow.camera.far = 100
    this.sun.shadow.camera.left = -20
    this.sun.shadow.camera.right = 20
    this.sun.shadow.camera.top = 20
    this.sun.shadow.camera.bottom = -20
    this.sun.shadow.bias = -0.001
    scene.add(this.sun)

    // this.ambient = new THREE.AmbientLight(0x87ceeb, 0.4)
    this.ambient = new AmbientLight(0x87ceeb, 0.4)
    scene.add(this.ambient)

    // this.hemisphere = new THREE.HemisphereLight(0x87ceeb, 0xd4a96a, 0.05)
    this.hemisphere = new HemisphereLight(0x87ceeb, 0xd4a96a, 0.05)
    scene.add(this.hemisphere)
    }
}