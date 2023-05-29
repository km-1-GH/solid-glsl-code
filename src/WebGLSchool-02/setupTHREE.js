import * as THREE from 'three'
import { EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect, BlendFunction } from "postprocessing";

export default class SetupTHREE {
  constructor() {
    this.renderer
    this.composer
    this.effect
    this.selection
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
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false
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

    // post processing
    this.effect = new SelectiveBloomEffect(this.scene, this.camera, {
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      luminanceThreshold: 0.15,
      luminanceSmoothing: 0.44,
      intensity: 10
    })
    this.effect.outputColorSpace = 'srgb'
    this.selection = this.effect.selection

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(this.camera, this.effect));


    // clock
    this.clock = new THREE.Clock()
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }

}
