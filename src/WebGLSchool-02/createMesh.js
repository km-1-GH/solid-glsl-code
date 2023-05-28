import * as THREE from 'three'
import Fan from './fan.js'

export default class CreateMesh {
  constructor() {
    this.items = {}
  }

  create(scene) {
    return new Promise(resolve => {
      this.createLights(scene)

      this.items.fan = new Fan()
      const pFan = this.items.fan.create(scene)
  

      Promise.all([pFan]).then(resolve)
    })
  }

  getItems() {
    return this.items
  }

  createLights(scene) {
    // directional light
    // this.items.directionalLight = new THREE.DirectionalLight(0xffffff,0.7)
    // this.items.directionalLight.position.set(0, -0.328, 0.076)
    // scene.add(this.items.directionalLight)

    // point light
    this.items.pointLight = new THREE.PointLight(0xffffff, 2, 20)
    this.items.pointLight.position.set(-1, 1, 1)
    scene.add(this.items.pointLight)

    // ambient light
    this.items.ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(this.items.ambientLight)
  }
}