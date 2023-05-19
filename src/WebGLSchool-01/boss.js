import * as THREE from 'three'
import globalState from './globalState.js'

export default class Boss {
  constructor() {
    this.obj = new THREE.Object3D()

    this.boxSize = 10
    this.jumpHeight = 0
    this.theta = 0
    this.eyeTheta = 0
    this.initialPos = { x: 0, y: this.boxSize * 0.5, z: -45 }
    this.savedPos = new THREE.Vector3(this.initialPos.x, this.initialPos.y, this.initialPos.z)

    this.eyes = new THREE.Object3D()

    this.eyeBeams = []
    this.eyeBeamCones = []
    this.spotLightTargets = []
  }

  create(field, scene) {
    // obj
    const geometry = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
    const material = new THREE.MeshLambertMaterial({ color: 0x6136d9 })

    this.obj = new THREE.Mesh( geometry, material )
    this.obj.position.set(this.initialPos.x, this.initialPos.y, this.initialPos.z)
    this.obj.userData.rollIndex = 0
    this.obj.userData.rollCount = 0
    this.obj.userData.lookIndex = 0
    this.obj.userData.state = 'roll'
    field.add(this.obj)

    // eyes
    const eyeSize = 1.5
    const rightEye = new THREE.Mesh(
      new THREE.BoxGeometry(eyeSize * 1.5, eyeSize, eyeSize).translate(0, eyeSize * -0.5, -1 * eyeSize * 0.5 + 0.1),
      material
    )
    const leftEye = rightEye.clone()

    rightEye.position.set(this.boxSize * 0.3, 0, 0)
    leftEye.position.set(this.boxSize * -0.3, 0, 0)
    this.eyes.add(rightEye)
    this.eyes.add(leftEye)
    this.eyes.visible = false
    field.add(this.eyes)

    // eyebeams
    this.spotLightTargets[0] = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial()
    )
    this.spotLightTargets[0].position.set(this.boxSize * 0.3, -3, -2)
    this.spotLightTargets[0].userData.initialPosX = this.boxSize * 0.3
    this.spotLightTargets[0].visible = false
    scene.add(this.spotLightTargets[0])
    this.spotLightTargets[1] = this.spotLightTargets[0].clone()
    this.spotLightTargets[1].position.set(this.boxSize * -0.3, -3, -2)
    this.spotLightTargets[1].userData.initialPosX = this.boxSize * -0.3
    scene.add(this.spotLightTargets[1])

    this.eyeBeams[0] = new THREE.SpotLight(0xffffff, 2, 11, Math.PI * 0.06, 0.2, 0.1)
    this.eyeBeams[0].position.set(0, 0, -0.1)
    this.eyeBeams[0].target = this.spotLightTargets[0]
    this.eyeBeams[1] = new THREE.SpotLight(0xffffff, 2, 11, Math.PI * 0.06, 0.2, 0.1)
    this.eyeBeams[1].position.set(0, 0, -0.1)
    this.eyeBeams[1].target = this.spotLightTargets[1]
    rightEye.add(this.eyeBeams[0])
    leftEye.add(this.eyeBeams[1])

    // cone
    this.eyeBeamCones[0] = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 12, 32, 1, false).translate(0, -5.5, -0.1).rotateX(Math.PI * 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 })
    )
    this.eyeBeamCones[0].name = 'rightEyeBeamCone'
    rightEye.add(this.eyeBeamCones[0])
    this.eyeBeamCones[1] = this.eyeBeamCones[0].clone()
    this.eyeBeamCones[1].name = 'left EyeBeamCone'
    leftEye.add(this.eyeBeamCones[1])

    // eyeball
    const rightEyeBall = new THREE.Mesh(
      // new THREE.BoxGeometry(0.8, 0.3, 0.8),
      new THREE.SphereGeometry(0.4, 40, 40),
      new THREE.MeshBasicMaterial(0xffffff)
    )
    rightEyeBall.name = 'rightEyeBall'
    rightEyeBall.position.set(0, -1.67, -0.616)
    this.eyeBeamCones[0].add(rightEyeBall)

    const leftEyeBall = rightEyeBall.clone()
    this.eyeBeamCones[1].add(leftEyeBall)

    // for roll
    const r = Math.sqrt(2) * (this.boxSize * 0.5)
    this.jumpHeight = r - this.boxSize * 0.5
  }

  roll(delta) {
    // speed
    let speed = this.theta % (Math.PI * 0.5) / (Math.PI * 0.5) //0~1
    speed = speed * 0.02 + delta * 0.5

    switch(this.obj.userData.rollIndex) {
      case 0: //forward
        this.rollBox('forth', speed, 4, 'look')
      break

      case 1: //right
        this.rollBox('right', speed * 2, 1, 'pause')
      break;

      case 2: //backward
        this.rollBox('back', speed * 3, 4, 'pause')
      break

      case 3: //left
        this.rollBox('left', speed * 2, 1, 'pause')
      break;
      
      default:
    }
  }

  rollBox(dirName, speed, rollTimes, nextState) {
    this.theta += speed

    const directions = {
      forth: { axis: new THREE.Vector3(1, 0, 0), moveDir: ['z', 1] },
      back: { axis: new THREE.Vector3(-1, 0, 0), moveDir: ['z', -1] },
      right: { axis: new THREE.Vector3(0, 0, -1), moveDir: ['x', 1] },
      left: { axis: new THREE.Vector3(0, 0, 1), moveDir: ['x', -1] },
    }

    const direction = directions[dirName]

    this.obj.rotateOnWorldAxis(direction.axis, speed)
    // height 
    const angle = Math.abs(Math.sin(this.theta * 2)) //90度ごとに0～1～0
    this.obj.position.y = angle * this.jumpHeight + this.initialPos.y
    // move forward
    this.obj.position[direction.moveDir[0]] += (speed / (Math.PI * 0.5) * this.boxSize) * direction.moveDir[1]

    if (this.theta > Math.PI * 0.5) {
      // adjust rotation
      const adjustSpeed = (Math.PI * 0.5) - this.theta
      this.obj.rotateOnWorldAxis(direction.axis, adjustSpeed)
      // adjust pos
      this.obj.position[direction.moveDir[0]] = this.boxSize * direction.moveDir[1] + this.savedPos[direction.moveDir[0]]
      this.obj.position.y = this.savedPos.y
      this.savedPos.copy(this.obj.position)
      
      this.obj.userData.rollCount ++
      this.theta = 0
      globalState.setStatus('pause')
    }

    if (this.obj.userData.rollCount >= rollTimes) {
      this.obj.userData.rollCount = 0
      this.obj.userData.rollIndex ++
      this.obj.userData.rollIndex = this.obj.userData.rollIndex >= 4 ? 0 : this.obj.userData.rollIndex 
      globalState.setStatus(nextState)
    }
  }

  activateEyes(delta) {
    switch (this.obj.userData.lookIndex) {
      case 0: //set position
        this.eyes.position.set(
          this.obj.position.x, 
          this.obj.position.y + this.boxSize * 0.35, 
          this.obj.position.z + this.boxSize * 0.5
        )
        this.eyes.visible = true
        this.obj.userData.lookIndex ++
      break

      case 1: //rotate eyes
        this.eyes.rotation.x -= delta * 0.5
        if (this.eyes.rotation.x < -Math.PI * 0.2) {
          this.obj.userData.lookIndex = 0
          globalState.setStatus('lookAround')

          this.spotLightTargets.forEach(target => {
            target.position.z = 2.58
          })
        }
      break
    }
  }

  lookAround(delta) {
    this.eyeTheta += delta
    this.spotLightTargets.forEach((target, index) => {
      target.position.x = Math.sin(this.eyeTheta * 1.5 + 1.5 * index) * 2.6 + target.userData.initialPosX
    })
    this.eyeBeamCones.forEach((spotlightCone, index) => {
      spotlightCone.rotation.z = Math.sin(this.eyeTheta * 1.5 + 1.5 * index) * 0.3
    })
    if (this.eyeTheta > Math.PI * 2.5) {
      this.spotLightTargets.forEach(target => {
        target.position.z = -2
      })
      globalState.setStatus('disableEyes')
      this.eyeTheta = 0
    }
  }

  disableEyes(delta) {
    this.eyes.rotation.x += delta
    if (this.eyes.rotation.x > 0) {
      this.eyes.visible = false
      this.eyeTheta = 0
      this.eyeBeams.forEach((spotlight) => {
        spotlight.target.position.x = 0
      })
      this.eyeBeamCones.forEach((spotlightCone) => {
        spotlightCone.rotation.z = 0
      })
      globalState.setStatus('roll')
    }
  }
}
