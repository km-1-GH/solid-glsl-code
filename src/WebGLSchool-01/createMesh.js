import * as THREE from 'three'
import Field from './field.js'
import Boss from './boss.js'
import MiniCubes from './miniCubes.js'

export default class CreateMesh {
  constructor() {
    this.items = {}
  }

  create(scene) {
    this.createLights(scene)

    this.items.field = new Field()
    this.items.field.create(scene)
    this.items.boss = new Boss()
    this.items.boss.create(this.items.field.obj, scene)
    this.items.miniCubes = new MiniCubes()
    this.items.miniCubes.create(this.items.field.obj)
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
    this.items.pointLight1 = new THREE.PointLight(0xffffff, 2, 20)
    this.items.pointLight1.position.set(0, 3.4, -35)
    scene.add(this.items.pointLight1)

    // ambient light
    this.items.ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(this.items.ambientLight)
  }
}