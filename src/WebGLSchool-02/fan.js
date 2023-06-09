import * as THREE from 'three'
import globalState from './globalState'


export default class Fan {
  constructor() {
    this.group = new THREE.Group()
    this.pivot = new THREE.Group()
    this.head = new THREE.Group()
    this.propellers = new THREE.Group()

  }

  create(scene) {
    return new Promise(resolve => {
      this.group.position.z = -2
      scene.add(this.group)

      this.pivot.userData.theta = 0
      this.group.add(this.pivot)

      this.head.position.z = 3
      this.pivot.add(this.head)

      this.head.add(this.propellers)

      // cover
      const coverCircleGroup = new THREE.Group()
      const coverCircle = this.createCircle(new THREE.Color('skyblue'))
      this.head.add(coverCircleGroup)
      for (let i = -1; i < 2; i++) {
        const clone = coverCircle.clone()
        clone.position.z = i * 0.06
        clone.rotation.x = (Math.random() * 2 - 1) * Math.PI * 0.01
        clone.rotation.y = (Math.random() * 2 - 1) * Math.PI * 0.01
        coverCircleGroup.add(clone)
      }

      const coverArcGroup = new THREE.Group()
      const coverArc = this.createArc(new THREE.Color('skyblue'))
      this.head.add(coverArcGroup)
      for (let i = 0; i < 12; i++) {
        const clone = coverArc.clone()
        clone.rotation.z = Math.PI * 2 * (i / 12)
        coverArcGroup.add(clone)
      }

      const motorGroup = new THREE.Group()
      const motorCircle = this.createCircle(new THREE.Color(0xf9f990))
      this.head.add(motorGroup)
      for (let i = 0; i < 6; i++) {
        const clone = motorCircle.clone()
        clone.position.set(0, 0, i * -0.45 + -1.4)
        clone.scale.set(0.4 + -0.2 * (i / 6), 0.4 + -0.1 * (i / 6), 2)
        clone.rotation.x = (Math.random() * 2 - 1) * Math.PI * 0.02
        clone.rotation.y = (Math.random() * 2 - 1) * Math.PI * 0.02

        motorGroup.add(clone)
      }
 
      // propeller
      const propellerLine = this.createPropeller()

      for (let i = 0; i < 5; i++) {
        const group = new THREE.Group()
        for (let j = -1; j < 2; j++) {
          const clone = propellerLine.clone()
          clone.scale.z = 1.5
          clone.position.z = j * 0.01
          // clone.rotation.x = Math.random() * Math.PI * 0.02
          clone.rotation.z = (Math.random() * 2 - 1) * Math.PI * 0.02

          group.add(clone)
          
        }
        group.rotation.z = Math.PI * 2 * (i / 5) - Math.PI * 0.1
        this.propellers.add(group)
      }
      
      // stand
      const standGroup = new THREE.Group()
      this.group.add(standGroup)
      const standLine = this.createCircle(new THREE.Color('pink'))
      standLine.rotation.x = Math.PI * 0.5
      for (let i = 0; i < 28; i++) {
        const clone = standLine.clone()
        clone.rotation.x += (Math.random() * 2 - 1) * Math.PI * 0.03
        clone.rotation.z += (Math.random() * 2 - 1) * Math.PI * 0.03
        clone.position.y = -1 + (i * -0.18)
        if (i < 24) clone.scale.set(0.1, 0.1, 2)
        else clone.scale.set(0.5, 0.5, 1)
        standGroup.add(clone)
      }

      resolve()
    })
  }

  createArc(color = new THREE.Vector3()) {
    const arcCurvePos = [
      new THREE.Vector3(-3.2, 0, 0),
      new THREE.Vector3(-3, 0, -2),
      new THREE.Vector3(3, 0, -2),
      new THREE.Vector3(3.2, 0, 0)
    ]

    const curve = new THREE.CubicBezierCurve3(...arcCurvePos);
    const points = curve.getPoints(32)
    // const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const geometry = new THREE.TubeGeometry(curve, 32, 0.005, 8, false)
    const material = new THREE.MeshBasicMaterial({ color: color });

    return new THREE.Mesh( geometry, material );
  }

  createCircle(color = new THREE.Vector3()) {
    // const segments = 32
    // const CircleCurvePos = []
    // for (let i = 0; i < segments + 1; i++) {
    //   CircleCurvePos[i] = new THREE.Vector3(
    //     Math.cos(Math.PI * 2 * (i / segments)) * 3.2,
    //     Math.sin(Math.PI * 2 * (i / segments)) * 3.2,
    //     0
    //   )
    // }
    // const geometry = new THREE.BufferGeometry().setFromPoints(CircleCurvePos)

    const geometry = new THREE.TorusGeometry(3.2, 0.005, 6, 32)
    const material = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh( geometry, material );
  }

  createPropeller(color = new THREE.Vector3()) {
    const propellerCurvePos = [
      new THREE.Vector3(-0.5, 0.2, 0),
      new THREE.Vector3(-3.7, 1.6, 0),
      new THREE.Vector3(3.2, 5.1, 0),
      new THREE.Vector3(0.4, 0.6, 0)
    ]

    const curve = new THREE.CubicBezierCurve3(...propellerCurvePos);
    const points = curve.getPoints(32)
    points.unshift(new THREE.Vector3(0, 0, 0))
    points.push(new THREE.Vector3(0, 0, 0))
    // const geometry = new THREE.BufferGeometry().setFromPoints(points).rotateY(Math.PI * 0.1)
    const geometry = new THREE.TubeGeometry(curve, 32, 0.003, 8, true).rotateY(Math.PI * 0.1)
    const material = new THREE.MeshBasicMaterial({ color: color });
    return new THREE.Mesh( geometry, material );
  }

  // update functions
  async switchOn(base) {
    base.renderer.setClearColor(0x302727)
    this.group.traverse(child => {
      if (child.isMesh) {
        setTimeout(() => {
          base.selection.add(child)
        }, Math.random() * 1600)
      }
    })
    await this.timeout(2000)
    globalState.setStatus('running')

    await this.timeout(4000)
    this.switchOff(base)
  }

  async switchOff(base) {
    globalState.setStatus('stop')
    await this.timeout(1000)
    this.group.traverse(child => {
      if (child.isMesh) {
        setTimeout(() => {
          base.selection.delete(child)
        }, Math.random() * 1600)
      }
    })

    await this.timeout(4000)
    this.switchOn(base)
  }

  rotateHead(delta) {
    this.pivot.userData.theta += delta
    this.pivot.rotation.y = Math.sin(this.pivot.userData.theta * 0.5)
  }

  rotateFan(delta) {
    this.propellers.rotation.z -= delta * 2
  }

  async timeout(msec = 1000) {
    return new Promise(resolve => {
      setTimeout(resolve, msec)
    })
  }
}
