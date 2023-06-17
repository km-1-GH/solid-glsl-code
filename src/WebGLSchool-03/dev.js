import * as THREE from 'three'
import GUI from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function dev(base, items) {
  const gui = new GUI()
  const guiParam = {}

  // orbit controls
  const controls = new OrbitControls(base.camera, base.renderer.domElement)
  guiParam.resetControl = () => {
    controls.reset()
  }

  gui.add(guiParam, 'resetControl').name('reset OrbitControls')

  // clearColor
  guiParam.clearColor = 0x000000
  gui.addColor(guiParam, 'clearColor').onChange(value => {
    base.renderer.setClearColor(value)
  })

  // point light position
  gui.add(items.pointLight1.position, 'x', -10, 10, 0.001).name('lightPos.x')
  gui.add(items.pointLight1.position, 'y', -3, 10, 0.001).name('lightPos.y')
  gui.add(items.pointLight1.position, 'z', -30, 20, 0.001).name('lightPos.z')



  //   }
  // })

}

export function devUpdate() {
  // devItems.spotLightHelpers.forEach(helper => {
  //   helper.update()
  // })
}