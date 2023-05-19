import * as THREE from 'three'
import GUI from 'lil-gui'

const devItems = {}

export function dev(base, items) {
  const gui = new GUI()
  const guiParam = {}
  // clearColor
  // guiParam.clearColor = 0x000000
  // gui.addColor(guiParam, 'clearColor').onChange(value => {
  //   base.renderer.setClearColor(value)
  // })

  // directional light position
  // gui.add(items.directionalLight.position, 'x', -1, 1, 0.001).name('lightPos.x')
  // gui.add(items.directionalLight.position, 'y', -1, 1, 0.001).name('lightPos.y')
  // gui.add(items.directionalLight.position, 'z', -1, 1, 0.001).name('lightPos.z')

  // boss color
  guiParam.bossColor = items.boss.obj.material.color.getHexString()
  gui.addColor(guiParam, 'bossColor').onChange(value => {
    items.boss.obj.material.color.set(value)
  })

  // eye beam cone color
  guiParam.beamColor = 0xffffff
  gui.addColor(guiParam, 'beamColor').onChange(value => {
    items.boss.eyes.traverse(child => {
      if (child.name.includes('Cone')) child.material.color.set(value)
    })
  })

  // spotlight helper
  // devItems.spotLightHelpers = []
  // base.scene.traverse(child => {
  //   if (child.type === 'SpotLight') {
  //     const helper = new THREE.SpotLightHelper(child)
  //     base.scene.add(helper)
  //     devItems.spotLightHelpers.push(helper)
  //   }
  // })


}

export function devUpdate() {
  // devItems.spotLightHelpers.forEach(helper => {
  //   helper.update()
  // })
}