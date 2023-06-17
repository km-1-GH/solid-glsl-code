import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import Arm from './arm.js'

export default class CreateMesh {
  constructor() {
    this.items = {}
    this.manager
    this.gLoader
    this.tLoader

    this.setLoader()

  }

  setLoader() {
    this.mananer = new THREE.LoadingManager(
      () => {
        console.log('loaded');
      },
      (url, loaded, total) => {
        console.log(`${loaded}/${total} loaded`);
      }, 
      (url) => {
        console.log(url);
      }
    )

    this.gLoader = new GLTFLoader(this.manager).setPath('model/')
    this.tLoader = new THREE.TextureLoader(this.manager).setPath('texture/')

  }

  create(scene) {
    return new Promise(resolve => {
      this.createLights(scene)

      this.items.arm = new Arm()
      const pArm = this.items.arm.create(scene, this.gLoader, this.tLoader)
  

      Promise.all([
        pArm
      ]).then(() => {
        console.log(this.items)
        resolve()
      })
    })
  }

  getItems() {
    return this.items
  }

  createLights(scene) {
    // directional light
    // this.items.directionalLight = new THREE.DirectionalLight(0xffffff,0.7)
    // this.items.directionalLight.position.set(0, -0.328, 0.076)
    // scene.add(this.items.directionalLight)

    // point light
    this.items.pointLight1 = new THREE.PointLight(0xffffff, 2, 20)
    this.items.pointLight1.position.set(1, 2, 2)
    scene.add(this.items.pointLight1)

    // ambient light
    this.items.ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(this.items.ambientLight)
  }
}