// import * as THREE from 'three'
import GUI from 'lil-gui'

export function dev(base, items) {
  // console.log(items)
  // console.log(base.camera);
  
  const gui = new GUI()
  const guiParam = {}

  guiParam.resetControl = () => {
    items.controls.reset()
  }

  gui.add(guiParam, 'resetControl').name('reset OrbitControls')

  gui.add(items.arm.anchor.userData, 'speed', 1, 4, 0.01).name('Plane Speed')

  // clearColor
  // guiParam.clearColor = 0x000000
  // gui.addColor(guiParam, 'clearColor').onChange(value => {
  //   base.renderer.setClearColor(value)
  // })

  // directional light position
  // gui.add(items.directionalLight.position, 'x', -1, 1, 0.0001).name('dirLightX')
  // gui.add(items.directionalLight.position, 'y', -1, 1, 0.0001).name('dirLightY')
  // gui.add(items.directionalLight.position, 'z', -1, 1, 0.0001).name('dirLightZ')

}

export function devUpdate() {
}