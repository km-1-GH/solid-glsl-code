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

  // point light position
  // gui.add(items.pointLight1.position, 'x', -10, 10, 0.001).name('lightPos.x')
  // gui.add(items.pointLight1.position, 'y', -3, 10, 0.001).name('lightPos.y')
  // gui.add(items.pointLight1.position, 'z', -30, 20, 0.001).name('lightPos.z')

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

  // eyeball pos
  // base.scene.traverse(child => {
  //   if (child.name === 'rightEyeBall') {
  //     gui.add(child.position, 'x', -2, 2, 0.001)
  //     gui.add(child.position, 'y', -5, 1, 0.001)
  //     gui.add(child.position, 'z', -2, 2, 0.001)

  //   }
  // })

}

export function devUpdate() {
  // devItems.spotLightHelpers.forEach(helper => {
  //   helper.update()
  // })
}