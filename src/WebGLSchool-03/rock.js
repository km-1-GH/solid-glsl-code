import * as THREE from 'three'

export default class Rock {
  constructor(scale) {
    this.SPHERE_SCALE = scale

    this.anchor = new THREE.Object3D()
    // this.rockBase
    this.rock

  }

  create(scene) {
    return new Promise(resolve => {
      scene.add(this.anchor)
      this.anchor.scale.setScalar(this.SPHERE_SCALE)

      // this.rockBase = new THREE.Mesh(
      //   new THREE.SphereGeometry(1),
      //   new THREE.MeshToonMaterial({ color: 'blue', wireframe: true })
      // )
      // this.anchor.add(this.rockBase)

      this.rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.MeshToonMaterial({ color: 'gray'})
      )
      this.rock.position.set(0, 1, 0)
      this.rock.scale.setScalar(0.06)
      this.anchor.add(this.rock)

      this.setClickEvent()


      resolve()
    })
  }

  setClickEvent() {
    window.addEventListener('pointermove', (e) => {
      const screenX = (e.clientX / window.innerWidth) * 2 - 1 //-0.5 - 0.5
      const screenY = -1 * ((e.clientY / window.innerHeight) * 2 - 1)
      const z = 1 - Math.abs(screenX)

      const vector = new THREE.Vector3(screenX, screenY, z).normalize()
      this.rock.position.copy(vector)
    })
  }

  setPos() {

  }

}
