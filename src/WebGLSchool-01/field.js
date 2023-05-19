import * as THREE from 'three'

export default class Field {
  constructor() {
    this.obj = new THREE.Object3D()
    this.initialPosY = -3
    this.theta = 0
    this.shakeR = 0.3
  }

  create(scene) {
    this.obj = new THREE.Mesh(
      new THREE.BoxGeometry(30, 1, 80).translate(0, -0.6, -25),
      new THREE.MeshLambertMaterial({ color: 0x333333})
    )
    this.obj.position.y = this.initialPosY
    this.obj.userData.pause = false
    scene.add(this.obj)
  }

  update(delta, bossUserData) {
    this.theta += delta

    if ( bossUserData.state === 'pause' || bossUserData.state === 'look') {
      this.obj.position.y -= Math.sin(this.theta * 20) * this.shakeR
      if (this.theta * 20 > Math.PI * 2) {
        this.theta = 0
        this.shakeR -= 0.1
        this.obj.position.y = this.initialPosY
        if (this.shakeR <= 0) {
          this.shakeR = 0.3
          if (bossUserData.state === 'look')
            bossUserData.state = 'moveEyes'
          else {
            bossUserData.state = 'roll'
          }
        }
      }
    }
  }
}
