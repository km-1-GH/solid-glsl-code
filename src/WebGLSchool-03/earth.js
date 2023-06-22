import * as THREE from 'three'

import Building from './building.js'

export default class Earth {
  constructor(scale) {
    this.SPHERE_SCALE = scale

    this.anchor = new THREE.Object3D()

    this.cityAddress = [ //polar: -1 ~ 1 (* Math.PI * 0.5), azimath: 0 ~ 1 (* Math.PI * 2 + Math.PI * 0.5) =正面から
      { polar: 0.25, azimath: 0 },
      { polar: 0.1, azimath: -0.1 },
      { polar: 0.1, azimath: -0.13 },
      { polar: -0.1, azimath: 0.1 },
    ]
  }

  create(scene) {
    return new Promise(resolve => {
      this.anchor = new THREE.Mesh(
        new THREE.SphereGeometry(1),
        new THREE.MeshToonMaterial({ color: 0x68e23 })
      )
      this.anchor.scale.setScalar(this.SPHERE_SCALE)
      this.anchor.position.set(2.4, 1.2, -1)

            // enable receive shadow
            this.anchor.receiveShadow = true

      scene.add(this.anchor)

      // buildings
      this.cityAddress.forEach(address => {
        for (let i = 0;  i < 5; i++) {
          const p = (address.polar * Math.PI * 0.5) + (Math.random() * 2 - 1) * 0.1
          const a = (address.azimath * Math.PI * 2 + Math.PI * 0.5) + (Math.random() * 2 - 1) * 0.1
          const w = (Math.random() + 4) / 12
          const h = Math.random() * 0.5 + 0.3
  
          new Building(this.anchor, p, a, w, h)
        }
      })

      // marks
      const redLine = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 0.01, 32, 1),
        new THREE.MeshToonMaterial({ color: 0xff0000 })
      )
      redLine.scale.setScalar(1.01)
      this.anchor.add(redLine)

      const verticalG = redLine.geometry.clone().rotateZ(Math.PI * 0.5)
      const verticalM = redLine.material.clone()
      verticalM.color.set(new THREE.Color('yellow'))
      const verticalLine = new THREE.Mesh(verticalG, verticalM)
      this.anchor.add(verticalLine)

      resolve()
    })
  }

  updateRot(delta) {
    this.anchor.rotation.x += delta * 0.1
    this.anchor.rotation.z += delta * 0.07
  }

}
