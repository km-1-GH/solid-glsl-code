import * as THREE from 'three'
import Boss from './boss.js'
import Field from './field.js'

export default class CreateMesh {
    constructor() {
      this.items = {}

      // materials
      this.cubeMaterial = new THREE.MeshLambertMaterial({ color: 'skyblue', transparent: true, opacity: 0.5 })
    }

    create(scene) {
      this.items.field = new Field()
      this.items.field.create(scene)
      this.items.boss = new Boss()
      this.items.boss.create(this.items.field.obj, this.cubeMaterial, scene)
    }

    getItems() {
      return this.items
    }
}