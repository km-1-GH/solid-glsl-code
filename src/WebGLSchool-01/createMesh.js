import * as THREE from 'three'
import Boss from './boss.js'

export default class CreateMesh {
    constructor() {
      this.items = {}

      // materials
      this.cubeMaterial = new THREE.MeshBasicMaterial({ color: 'skyblue', transparent: true, opacity: 0.2 })
    }

    create(scene) {
      this.items.boss = new Boss()
      this.items.boss.create(scene, this.cubeMaterial)
    }

    getItems() {
      return this.items
    }
}