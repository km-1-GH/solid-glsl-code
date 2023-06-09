import * as THREE from 'three'

export default class Rock {
  constructor(scale) {
    this.SPHERE_SCALE = scale

    this.anchor = new THREE.Object3D()
    this.rock

    this.box3 = new THREE.Box3()
    this.caught = false

  }

  create(scene) {
    return new Promise(resolve => {
      // scene.add(this.anchor)
      this.anchor.scale.setScalar(this.SPHERE_SCALE)

      this.rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.MeshToonMaterial({ color: 'gray', transparent: true})
      )
      this.rock.position.set(0, 0, 1)
      this.rock.scale.setScalar(0.05)

            // enable cast shadow
            this.rock.castShadow = true

      this.anchor.add(this.rock)

      resolve()
    })
  }

  reset() {
    this.caught = false
    this.rock.material.opacity = 1
    this.rock.material.color.set(new THREE.Color('gray'))
    this.rock.position.set(0, 0, 1)
  }


}
