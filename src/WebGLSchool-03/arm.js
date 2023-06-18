import * as THREE from 'three'
import globalState from './globalState'
import { C } from '../../dist/assets/solid-7e9e2f59'

export default class Arm {
  constructor(scale) {
    this.SPHERE_SCALE = scale
    this.base = new THREE.Object3D()
    this.anchor = new THREE.Object3D()
    this.claws = []
    this.time = 0
    this.planeTheta = 0
    this.planeDirection = new THREE.Vector3(0, 0, 0.9)
    this.initialVector = new THREE.Vector3(1, 0, 0)
    // this.direction = new THREE.Vector3(0, 0, 0.1)
    // this.axis = new THREE.Vector3()
    // this.quaternion = new THREE.Quaternion()

    this.armTheta = 0
    this.stopArmTheta = Math.PI * 0.5
  }

  create(scene, gLoader, tLoader) {
    return new Promise(resolve => {
      this.base = new THREE.Mesh(
        new THREE.SphereGeometry(1),
        new THREE.MeshBasicMaterial({ wireframe: true })
      )
      scene.add(this.base)
      this.base.scale.setScalar(this.SPHERE_SCALE)

      this.base.add(this.anchor)
      this.anchor.scale.setScalar(0.06)
      this.anchor.position.set(1, 0, -1)
      // plane
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 6, 0, Math.PI).translate(0, 0, -0.5),
        new THREE
        .MeshToonMaterial({ color: 0xffffd1 })
      )
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 0.4, 3.6, 12, 1).translate(0, 3.6 * -0.5 - 0.5, 0),
        new THREE.MeshToonMaterial({ color: 0xffff9e })
      )
      body.rotation.x = Math.PI * 0.5

      const rightWing = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.2, 1.2).rotateY(Math.PI * -0.1),
        new THREE.MeshToonMaterial({ color: 0x7f7fff })
      )
      rightWing.position.set(-1.3, 0, -2)
      
      const leftWing = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.2, 1.2).rotateY(Math.PI * 0.1),
        new THREE.MeshToonMaterial({ color: 0x7f7fff })
      )
      leftWing.position.set(1.3, 0, -2)
      
      const tailWingH = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.2, 0.6),
        new THREE.MeshToonMaterial({ color: 0x7f7fff })
      )
      tailWingH.position.set(0, 0, -4)

      const tailWingV = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 1.6, 1).rotateX(Math.PI * -0.37),
        new THREE.MeshToonMaterial({ color: 0xbf7fff })
      )
      tailWingV.position.set(0, 0.32, -3.1)



      this.anchor.add(head, body, rightWing, leftWing, tailWingH, tailWingV)

      // texture
      this.material = new THREE.MeshBasicMaterial({ color: 'white'})
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
              child.material = this.material
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

  fly(delta, rockPos) {
    this.planeTheta += delta

    const nextPos = new THREE.Vector3(Math.cos(this.planeTheta), 0, Math.sin(this.planeTheta))
    // 回転軸=sin180度を過ぎると -1 にする
    const axis = new THREE.Vector3().crossVectors(this.initialVector, nextPos).normalize()
    // angle=initialVector(原点から最初の位置)と原点から現在の位置のvectorsのなす角 (0 ~ Math.PI ~ 0)
    const angle = Math.acos(this.initialVector.clone().dot(nextPos))
    
    this.anchor.position.copy(nextPos)
    this.anchor.setRotationFromAxisAngle(axis, angle)

    const rockPosVector = new THREE.Vector2(rockPos.x, rockPos.y).normalize()
    const baseAngle = Math.acos(rockPosVector.dot(new THREE.Vector2(1, 0)))

    this.base.rotation.z = baseAngle
    



  }

  seize(delta) {
    this.armTheta += delta * 0.05
    const speed = Math.pow(this.armTheta / this.stopArmTheta, 2)
    this.armTheta += speed

    this.claws.forEach(claw => {
      const quaternion = new THREE.Quaternion().setFromAxisAngle(claw.userData.axis, speed * -1)
      claw.quaternion.premultiply(quaternion)
    })

    if (this.armTheta > this.stopArmTheta) {
      this.armTheta = 0
      this.time = 0
      this.claws.forEach(claw => {
        claw.setRotationFromEuler(claw.userData.initialRot)
      })
    }
  
  }

}
