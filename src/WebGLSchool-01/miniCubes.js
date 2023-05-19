import * as THREE from 'three'

export default class MiniCubes {
  constructor() {
    this.objs = []

    this.boxSize = 0.2

    this.theta = 0
    this.rollTheta = 0
    this.state = 'setDir'
    this.nextPosSet = false
  }

  create(field) {
    const geometry = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)

    const colors = [
      new THREE.Color(0x00ffd5),
      new THREE.Color(0x00b3ff),
      new THREE.Color(0xffffff),
    ]

    const materials = []
    for (let i = 0; i < colors.length; i++) {
      materials[i] = new THREE.MeshLambertMaterial({ color: colors[i] })
    }

    for (let i = 0; i < 150; i++) { ///150
      const obj = new THREE.Mesh(geometry, materials[Math.floor(Math.random() * colors.length)])
      obj.scale.setScalar(1 + 0.03 * (i % 5)) //1 ~ 1.15
      obj.userData.initialPosY = this.boxSize * obj.scale.x * 0.5
      obj.position.set(
        (Math.random() * 2 - 1) * 10,
        obj.userData.initialPosY,
        Math.random() * 5
      )
      obj.userData.nextPos = new THREE.Vector3().copy(obj.position)
      obj.userData.jumpHeight = Math.sqrt(2) * (this.boxSize * obj.scale.x * 0.5) - this.boxSize * obj.scale.x * 0.5
      obj.userData.rollAxisVector = new THREE.Vector3()
      obj.userData.moveAxis = ''
      obj.userData.moveDir = 1
      obj.userData.theta = 0
      obj.userData.state = 'setDir'

      field.add(obj)
      this.objs.push(obj)
    }
  }

  update(delta, bossUserData, spotLightTargets) {
    if (bossUserData.state === 'pause' || bossUserData.state === 'look') {

      this.objs.forEach(obj => {
        if (obj.userData.state === 'roll') {
          obj.userData.state = 'setDir'
          obj.userData.theta = 0
          obj.rotation.set(0, 0, 0)
        }
      })

      if (this.theta * 20 > Math.PI) {
        this.objs.forEach(obj => {
          obj.position.y = obj.userData.initialPosY
        })
      } else {
        this.theta += delta
        this.objs.forEach((obj, index) => {
          obj.position.y = Math.sin(this.theta * 20) * 0.5 + (index % 10) * 0.1 + obj.userData.initialPosY
        })
      }

    } else if (bossUserData.state === 'lookAround') {
      // set next pos
      if (!this.nextPosSet) {
        this.objs.forEach(obj => {
          this.setNextPos(obj)
        })
        this.nextPosSet = true
      }
      // roll
      this.objs.forEach((obj, objIndex) => {
        switch (obj.userData.state) {
          case 'setDir':
            const distances = []
            distances[0] = obj.getWorldPosition(new THREE.Vector3()).distanceTo(spotLightTargets[0].position)
            distances[1] = obj.getWorldPosition(new THREE.Vector3()).distanceTo(spotLightTargets[1].position)
            let index = distances[0] > distances[1] ? 0 : 1

            const moveVector = new THREE.Vector3().subVectors(
              obj.position, spotLightTargets[index].position
            ).normalize()

            this.setDir(obj, moveVector)
            obj.userData.state = 'roll'
          break

          case 'roll':
            this.roll(obj, objIndex, delta)
          break
        }
      })

    } else if (bossUserData.state === 'putBackEyes') {
      this.theta = 0
      if (this.nextPosSet) this.nextPosSet = false 

      this.objs.forEach(obj => {
        if (obj.userData.state === 'roll') {
          obj.userData.state = 'setDir'
          obj.userData.theta = 0
          obj.rotation.set(0, 0, 0)
        }
      })
      
    } else {
      this.theta = 0

      this.objs.forEach((obj, objIndex) => {
        if (obj.position.distanceTo(obj.userData.nextPos) < 0.5) {
          obj.position.copy(obj.userData.nextPos)

        } else {
          switch (obj.userData.state) {
            case 'setDir':
              const moveVector = new THREE.Vector3().subVectors(
                obj.userData.nextPos, obj.position
              ).normalize()
              this.setDir(obj, moveVector)
              obj.userData.state = 'roll'
            break
    
            case 'roll':
              this.roll(obj, objIndex, delta * 4)
            break
          }
        }
      })
    }
  }

  setNextPos(obj) {
    obj.userData.nextPos.set(
      (Math.random() * 2 - 1) * 10,
      obj.userData.initialPosY,
      Math.random() * 5
    )
  }

  setDir(obj, moveVector) {
    obj.userData.moveAxis = Math.abs(moveVector.x) > Math.abs(moveVector.z) ? 'x' : 'z'
    obj.userData.rollAxis = Math.abs(moveVector.x) > Math.abs(moveVector.z) ? 'z' : 'x'
    obj.userData.moveDir = moveVector[obj.userData.moveAxis] > 0 ? 1 : -1
  }

  roll(obj, index, delta) {
    const speed = delta + (index % 3) * 0.05
    obj.userData.theta += speed
    obj.userData.moveAxis === 'x' ? obj.userData.rollAxisVector.set(0, 0, obj.userData.moveDir * -1)
      : obj.userData.rollAxisVector.set(obj.userData.moveDir, 0, 0)

    obj.rotateOnWorldAxis(obj.userData.rollAxisVector, speed)

    // height 
    const angle = Math.abs(Math.sin(obj.userData.theta * 2)) //90度ごとに0～1～0
    obj.position.y = angle * obj.userData.jumpHeight + obj.userData.initialPosY
    // move forward
    obj.position[obj.userData.moveAxis] += (speed / (Math.PI * 0.5) * this.boxSize * obj.scale.x) * obj.userData.moveDir

    if (obj.userData.theta.theta > Math.PI * 0.5) {
      const adjustSpeed = (Math.PI * 0.5) - obj.userData.theta
      obj.rotateOnWorldAxis(obj.userData.rollAxisVector, adjustSpeed)
      obj.userData.theta = 0
      obj.userData.state = 'setDir'
    }
  }
}