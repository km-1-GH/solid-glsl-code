import * as THREE from 'three'

export default class Earth {
  constructor(scale) {
    this.SPHERE_SCALE = scale

    this.anchor = new THREE.Object3D()
  }

  create(scene) {
    return new Promise(resolve => {
      this.anchor = new THREE.Mesh(
        new THREE.SphereGeometry(1),
        new THREE.MeshToonMaterial({ color: 0x68e23 })
      )
      scene.add(this.anchor)
      this.anchor.scale.setScalar(this.SPHERE_SCALE)

      resolve()
    })
  }

}
