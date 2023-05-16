import * as THREE from 'three'

class Boss {
  constructor() {
    this.obj
  }

  create(scene, geometry, material) {
    this.obj = new THREE.Mesh(geometry, material)
    this.obj.position.set(0, 0, 0)
    scene.add(this.obj)
  }

  update(elapsed) {
    this.obj.position.x = Math.sin(elapsed)
  }
}

export default class CreateMesh {
    constructor() {
      this.items = {}

      this.cubeGeometry = new THREE.BoxGeometry(5, 5, 5)
      this.cubeMaterial = new THREE.MeshBasicMaterial({ color: 'skyblue' })
    }

    create(scene) {
      this.items.boss = new Boss()
      this.items.boss.create(scene, this.cubeGeometry, this.cubeMaterial)
    }

    getItems() {
      return this.items
    }
}