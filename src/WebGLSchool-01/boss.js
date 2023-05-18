import * as THREE from 'three'

export default class Boss {
  constructor() {
    this.obj = new THREE.Object3D()
    this.boxSize = 10
    this.jumpHeight = 0
    this.theta = 0
    this.eyeTheta = 0
    this.initialPos = { x: 0, y: this.boxSize * 0.5, z: -35 }

    this.eyes = new THREE.Object3D()

    this.eyeBeams = []
    this.eyeBeamCones = []
  }

  create(field, material, scene) {
    // obj
    this.obj = new THREE.Mesh(
      new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize),
      material
    )
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
    this.eyeBeams[0] = new THREE.SpotLight(0xffffff, 2, 10, Math.PI * 0.06, 0.2, 0.1)
    this.eyeBeams[0].position.set(0, -2, -0.8)
    this.eyeBeams[0].target.position.set(0, -3, -1.14)
    this.eyeBeams[1] = new THREE.SpotLight(0xffffff, 2, 10, Math.PI * 0.06, 0.2, 0.1)
    this.eyeBeams[1].position.set(0, -2, -0.8)
    this.eyeBeams[1].target.position.set(0, -3, -1.14)
    rightEye.add(this.eyeBeams[0])
    rightEye.add(this.eyeBeams[0].target)
    leftEye.add(this.eyeBeams[1])
    leftEye.add(this.eyeBeams[1].target)

    // cone
    this.eyeBeamCones[0] = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 12, 32, 1, false).translate(0, -5.5, -0.1).rotateX(Math.PI * 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.1 })
    )
    rightEye.add(this.eyeBeamCones[0])
    this.eyeBeamCones[1] = this.eyeBeamCones[0].clone()
    leftEye.add(this.eyeBeamCones[1])

    // const rightBeamHelper = new THREE.SpotLightHelper(this.eyeBeams[0])
    // const leftBeamHelper = new THREE.SpotLightHelper(this.eyeBeams[1])
    // scene.add(rightBeamHelper)
    // scene.add(leftBeamHelper)

    // for roll
    const r = Math.sqrt(2) * (this.boxSize * 0.5)
    this.jumpHeight = r - this.boxSize * 0.5
  }

  update(delta) {
    switch (this.obj.userData.state) {
      case 'roll': 
        this.roll(delta)
      break

      case 'moveEyes':
        this.look(delta)
      break

      case 'lookAround':
        this.eyeTheta += delta
        this.eyeBeams.forEach((spotlight, index) => {
          spotlight.target.position.x = Math.sin(this.eyeTheta + 1 * index) * 0.5
        })
        this.eyeBeamCones.forEach((spotlightCone, index) => {
          spotlightCone.rotation.z = Math.sin(this.eyeTheta + 1 * index) * 0.75 * 0.5
        })
        if (this.eyeTheta > Math.PI * 3) {
          this.obj.userData.state = 'putBackEyes'
          this.eyeTheta = 0
        }
      break

      case 'putBackEyes': 
        this.eyes.rotation.x += delta
        if (this.eyes.rotation.x > 0) {
          this.eyes.visible = false
          this.eyeTheta = 0
          this.eyeBeams.forEach((spotlight, index) => {
            spotlight.target.position.x = 0
          })
          this.eyeBeamCones.forEach((spotlightCone, index) => {
            spotlightCone.rotation.z = 0
          })
          this.obj.userData.state = 'roll'
        }
      break

      default:
    }
  }

  roll(delta) {
    // speed
    let speed = this.theta % (Math.PI * 0.5) / (Math.PI * 0.5) //0~1
    speed = speed * 0.02 + delta * 0.5

    switch(this.obj.userData.rollIndex) {
      case 0: //forward
        this.rollBox('forth', speed, 3, 'look')
      break

      case 1: //right
        this.rollBox('right', speed * 2, 1, 'pause')
      break;

      case 2: //backward
        this.rollBox('back', speed * 3, 3, 'pause')
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
      
      this.obj.userData.rollCount ++
      this.theta = 0
      this.obj.userData.state = 'pause'
    }

    if (this.obj.userData.rollCount >= rollTimes) {
      this.obj.userData.rollCount = 0
      this.obj.userData.rollIndex ++
      this.obj.userData.rollIndex = this.obj.userData.rollIndex >= 4 ? 0 : this.obj.userData.rollIndex 
      this.obj.userData.state = nextState
    }
  }

  look(delta) {
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
        this.eyes.rotation.x -= delta
        if (this.eyes.rotation.x < -Math.PI * 0.2) {
          this.obj.userData.lookIndex = 0
          this.obj.userData.state = 'lookAround'
        }
      break
    }
  }
}
