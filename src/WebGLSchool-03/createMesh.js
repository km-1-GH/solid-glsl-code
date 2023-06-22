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
      armBase: 5 / 4,
      rockBase: 4.9 / 4
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
        this.items.earth.anchor.add(this.items.rock.anchor)
        this.items.earth.anchor.add(this.items.arm.base)
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
    this.items.directionalLight.position.set(-3, 3, 3)

        // enable cast shadow
        this.items.directionalLight.castShadow = true
        this.items.directionalLight.shadow.camera.near = 1
        this.items.directionalLight.shadow.camera.far = 15
    
    scene.add(this.items.directionalLight)

    // ambient light
    this.items.ambientLight = new THREE.AmbientLight(0x777777, 0.4)
    scene.add(this.items.ambientLight)


  }
}