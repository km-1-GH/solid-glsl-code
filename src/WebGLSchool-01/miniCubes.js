import * as THREE from 'three'

export default class MiniCubes {
  constructor() {
    this.objs = []
    this.theta = 0
  }

  create(field) {
    const geometry = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)

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
      obj.scale.setScalar(0.3 + 0.03 * (i % 5))
      obj.position.set(
        (Math.random() * 2 - 1) * 10,
        0,
        Math.random() * 5
      )
      obj.userData.initialPos = new THREE.Vector3().copy(obj.position)
      obj.userData.nextPos = new THREE.Vector3().copy(obj.position)
      obj.userData.nextPosSet = false
      field.add(obj)
      this.objs.push(obj)
    }
  }

  update(delta, bossUserData, spotLightTargets) {
    if (bossUserData.state === 'pause' || bossUserData.state === 'look') {
      this.theta += delta
      this.objs.forEach((obj, index) => {
        obj.position.y = Math.sin(this.theta * 20) * 0.5 + (index % 10) * 0.1
      })
      if (this.theta * 20 > Math.PI) {
        this.objs.forEach(obj => {
          obj.position.y = 0
        })
      }

    } else if (bossUserData.state === 'lookAround') {
      this.objs.forEach(obj => {
        const distances = []
        distances[0] = obj.getWorldPosition(new THREE.Vector3()).distanceTo(spotLightTargets[0].position)
        distances[1] = obj.getWorldPosition(new THREE.Vector3()).distanceTo(spotLightTargets[1].position)
        let moveVector
        let index = distances[0] > distances[1] ? 0 : 1

        moveVector = new THREE.Vector3().subVectors(
          obj.position, spotLightTargets[index].position
        ).normalize()
  
        obj.position.x += moveVector.x * 0.5 * Math.pow(1 / distances[index], 2)
        obj.position.z += Math.abs(moveVector.z * 0.5 * Math.pow(1 / distances[index], 2))

        // set next pos
        if (!obj.userData.nextPosSet) this.setNextPos(obj)
      })

    } else {
      this.theta = 0
      // to nextPos
      this.objs.forEach(obj => {
        if (obj.userData.nextPosSet) obj.userData.nextPosSet = false

        if (obj.position.distanceTo(obj.userData.nextPos) < 0.1) {
          obj.position.copy(obj.userData.nextPos)
          return
        }

        const moveVector = new THREE.Vector3().subVectors(obj.userData.nextPos, obj.position).normalize()
        obj.position.add(moveVector.multiplyScalar(delta * 0.7))
      })
    }
  }

  setNextPos(obj) {
    obj.userData.nextPos.set(
      (Math.random() * 2 - 1) * 10,
      0,
      Math.random() * 5
    )
    obj.userData.nextPosSet = true
  }
}