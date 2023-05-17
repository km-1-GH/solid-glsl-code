import * as THREE from 'three'

export default class Boss {
  constructor() {
    this.obj
    this.anchor
    this.boxSize = 5
    this.theta = 0
    this.jumpHeight = 0
    this.theta = 0
    this.speed = 0
    this.angle = 0
    this.initialPos = { x: 0, y: 0, z: -10 }
    this.move = [
      {rot: 1, dir: 1},
      {rot: 1, dir: 1},
      {rot: -1, dir: -1},
      {rot: 1, dir: -1},
    ]
  }

  create(scene, material) {
    this.obj = new THREE.Mesh(
      new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize),
      material
    )
    this.obj.position.set(this.initialPos.x, this.initialPos.y, this.initialPos.z)
    this.obj.userData.moveIndex = 0
    this.obj.userData.state = 'roll'
    scene.add(this.obj)

    this.anchor = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    )
    this.anchor.position.set(0, this.boxSize * -0.5, -10)
    scene.add(this.anchor)

    const r = Math.sqrt(2) * (this.boxSize * 0.5)
    this.jumpHeight = r - this.boxSize * 0.5
  }

  update(delta) {
    // speed
    this.speed = this.theta % (Math.PI * 0.5) / (Math.PI * 0.5) //0~1
    this.speed = this.speed * 0.01
    this.theta += delta + this.speed

    switch(this.obj.userData.moveIndex) {
      case 0: //forward
        this.backAndForth(delta)

        if (this.obj.rotation.x > Math.PI) {
          this.obj.rotation.x = Math.PI
          this.obj.userData.moveIndex = 1
          this.theta = 0
        }
      break

      case 1: //right
        this.leftAndRight(delta)
 
        if (this.obj.rotation.z > Math.PI) {
          this.obj.rotation.z = Math.PI
          this.obj.userData.moveIndex = 2
          this.theta = 0
        }
      break;

      case 2: //backward
        this.backAndForth(delta)

        if (this.obj.rotation.x < 0) {
          this.obj.rotation.x = 0
          this.obj.userData.moveIndex = 3
          this.theta = 0
        }
      break

      case 3: //left
        this.leftAndRight(delta)

        if (this.obj.rotation.z > Math.PI * 2) {
          this.obj.rotation.z = 0
          this.obj.userData.moveIndex = 0
          this.theta = 0
        }
      break;
      
      default:
    }
  }

  backAndForth(delta) {
    // rotateZ
    this.obj.rotation.x += (delta + this.speed) * this.move[this.obj.userData.moveIndex].rot
    // height 
    this.angle = Math.abs(Math.sin(this.obj.rotation.x * 2)) //90度ごとに0～1～0
    this.obj.position.y = this.angle * this.jumpHeight
    // move forward
    this.obj.position.z += (delta + this.speed) / (Math.PI * 0.5) * this.boxSize * this.move[this.obj.userData.moveIndex].dir
  }

  leftAndRight(delta) {
    // rotateZ
    this.obj.rotation.z += (delta + this.speed) * this.move[this.obj.userData.moveIndex].rot

    // height 
    this.angle = Math.abs(Math.sin(this.obj.rotation.z * 2)) //90度ごとに0～1～0
    this.obj.position.y = this.angle * this.jumpHeight
    // move forward
    this.obj.position.x += (delta + this.speed) / (Math.PI * 0.5) * this.boxSize * this.move[this.obj.userData.moveIndex].dir
  }
}
