import * as THREE from 'three'

export default class Building {
  constructor(scene, p, a, w, h) {
    this.anchor

    this.create(scene, p, a, w, h)

  }

  create(scene, p, a, w, h) {
    this.anchor = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w).translate(0, h * 0.5, 0),
      new THREE.MeshToonMaterial({ color: 0xffbcdd })
    )
    this.anchor.scale.setScalar(0.1)

      // recieve shadow
      this.anchor.receiveShadow = true

    const x = Math.cos(p) * Math.cos(a)
    const z = Math.cos(p) * Math.sin(a)
    const y = Math.sin(p)

    this.anchor.position.set(x, y, z)

    this.anchor.rotation.x = -1 * p + Math.PI * 0.5
    this.anchor.rotation.z = a - Math.PI * 0.5
    scene.add(this.anchor)

  }
}