import * as THREE from 'three'
import globalState from './globalState'

export default class Arm {
  constructor() {
    this.anchor = new THREE.Object3D()
    this.claws = []
    this.time = 0
    this.theta = 0
    this.stopTheta = Math.PI * 0.5
  }

  create(scene, gLoader, tLoader) {
    return new Promise(resolve => {
      scene.add(this.anchor)
      // plane
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 6, 0, Math.PI).translate(0, 0, -0.5),
        new THREE
        .MeshLambertMaterial({ color: 'pink'})
      )
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 0.4, 3.6, 12, 1).translate(0, 3.6 * -0.5 - 0.5, 0),
        new THREE.MeshLambertMaterial({ color: 'pink'})
      )
      body.rotation.x = Math.PI * 0.5

      const rightWing = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.2, 1.2).rotateY(Math.PI * -0.1),
        new THREE.MeshLambertMaterial({ color: 0x124578 })
      )
      rightWing.position.set(-1.3, 0, -2)
      
      const leftWing = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.2, 1.2).rotateY(Math.PI * 0.1),
        new THREE.MeshLambertMaterial({ color: 0x124578 })
      )
      leftWing.position.set(1.3, 0, -2)
      
      const tailWingH = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.2, 0.6),
        new THREE.MeshLambertMaterial({ color: 0x341578 })
      )
      tailWingH.position.set(0, 0, -4)

      const tailWingV = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1.6, 1).rotateX(Math.PI * -0.37),
        new THREE.MeshLambertMaterial({ color: 0x341578 })
      )
      tailWingV.position.set(0, 0.32, -3.1)



      this.anchor.add(head, body, rightWing, leftWing, tailWingH, tailWingV)

      // texture
      this.material = new THREE.MeshBasicMaterial()
      tLoader.load('arm.jpg', tex => {
        tex.flipY = false
        this.material.map = tex
        this.material.needsUpdate = true
      })
      // model
      gLoader.load('arm.glb', gltf => {
        this.model = gltf.scene

        this.model.traverse(child => {
          if (child.isMesh) {
            if (child.name.includes('claw')) {
              this.claws.push(child)
            } else {
              child.visible = false;
            }
          }
        })

        // modelが後ろを向いているので
        this.model.rotation.y = Math.PI
        this.anchor.add(this.model)

        // set claws' initial rotation, axis for rotation
        this.claws.forEach((claw, index) => {
          claw.userData.initialRot = new THREE.Euler().copy(claw.rotation)

          const vector1 = new THREE.Vector3()
          const vector2 = new THREE.Vector3()
          const verticalVector = new THREE.Vector3()
          const centerVector = new THREE.Vector3()
          const horizontalVector = new THREE.Vector3()

          const otherIndex = { a: 1, b: 2 }
          switch (index) {
            case 1:
              otherIndex.a = 2
              otherIndex.b = 0
            break

            case 2:
              otherIndex.a = 0
              otherIndex.b = 1
            break
          }

          vector1.subVectors(this.claws[otherIndex.a].position, claw.position).normalize()
          vector2.subVectors(this.claws[otherIndex.b].position, claw.position).normalize()

          verticalVector.crossVectors(vector1, vector2).normalize()
          centerVector.subVectors(this.model.position, claw.position).normalize()
          horizontalVector.crossVectors(centerVector, verticalVector).normalize()

          claw.userData.axis = horizontalVector
        })

        resolve()
      })
    })
  }

  seize(delta) {
    this.theta += delta * 0.05
    const speed = Math.pow(this.theta / this.stopTheta, 2)
    this.theta += speed

    this.claws.forEach(claw => {
      const quaternion = new THREE.Quaternion().setFromAxisAngle(claw.userData.axis, speed * -1)
      claw.quaternion.premultiply(quaternion)
    })

    if (this.theta > this.stopTheta) {
      this.theta = 0
      this.time = 0
      this.claws.forEach(claw => {
        claw.setRotationFromEuler(claw.userData.initialRot)
      })
    }
  
  }

}
