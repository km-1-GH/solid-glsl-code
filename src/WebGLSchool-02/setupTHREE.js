import * as THREE from 'three'

export default class SetupTHREE {
  constructor() {
    this.renderer
    this.scene
    this.camera
    this.directionalLight
    this.ambientLight
    this.controls

    this.clock
  }

  init(RENDER_PARAM, CAMERA_PARAM) {
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setClearColor(new THREE.Color(RENDER_PARAM.clearColor))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    document.getElementById('webgl').appendChild(this.renderer.domElement)

    // scene
    this.scene = new THREE.Scene()

    // camera
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_PARAM.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_PARAM.near,
      CAMERA_PARAM.far
    )
    this.camera.position.set(CAMERA_PARAM.pos.x, CAMERA_PARAM.pos.y, CAMERA_PARAM.pos.z)


    // clock
    this.clock = new THREE.Clock()
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

}
