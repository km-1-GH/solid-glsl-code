import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import Arm from './arm.js'
import Earth from './earth.js'
import Rock from './rock.js'

export default class CreateMesh {
  constructor() {
    this.items = {}
    this.manager
    this.gLoader
    this.tLoader

    this.SPHERE_SCALE = {
      earth: 4,
      armBase: 5,
      rockBase: 4.9
    }

    this.setLoader()

  }

  setLoader() {
    this.manager = new THREE.LoadingManager(
      () => {
        console.log('loaded');
      },
      (url, loaded, total) => {
        console.log(`${loaded}/${total} loaded: ${url}`);
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

      this.items.arm = new Arm(this.SPHERE_SCALE.armBase)
      const pArm = this.items.arm.create(scene, this.gLoader, this.tLoader)

      this.items.earth = new Earth(this.SPHERE_SCALE.earth)
      const pEarth = this.items.earth.create(scene, this.gLoader, this.tLoader)
  
      this.items.rock = new Rock(this.SPHERE_SCALE.rockBase)
      const pRock = this.items.rock.create(scene, this.gLoader, this.tLoader)
  

      Promise.all([
        pArm,
        pEarth,
        pRock
        
      ]).then(() => {
        resolve()
      })
    })
  }

  getItems() {
    return this.items
  }

  createLights(scene) {
    // directional light
    this.items.directionalLight = new THREE.DirectionalLight(0xffffff,1)
    this.items.directionalLight.position.set(0.41, 0.41, 0.312)
    scene.add(this.items.directionalLight)

    // point light
    // this.items.pointLight1 = new THREE.PointLight(0xffffff, 2, 20)
    // this.items.pointLight1.position.set(1, 2, 2)
    // scene.add(this.items.pointLight1)

    // ambient light
    this.items.ambientLight = new THREE.AmbientLight(0x777777, 0.4)
    scene.add(this.items.ambientLight)
  }
}