import './style.scss'
// import * as THREE from 'three'
import SetupTHREE from './setupTHREE.js'
import CreateMesh from './createMesh'
import globalState from './globalState.js'

import { dev, devUpdate } from './dev.js'

const base = new SetupTHREE()
const createMesh = new CreateMesh()
let items
let elapsed = 0
let currentTime = 0
let delta = 0

window.addEventListener('load', () => {
  base.init(RENDER_PARAM, CAMERA_PARAM)
  createMesh.create(base.scene)
  items = createMesh.getItems()
  init()
  render()
  base.clock.start()
})

window.addEventListener('resize', () => {
  base.resize()
})

const RENDER_PARAM = {
  clearColor: 0x181c2f,
}

const CAMERA_PARAM = {
  fov: 60,
  near: 0.1,
  far: 100,
  pos: { x: 0, y: -0.5, z: 10}
}

function init() {

  // dev(base, items)  //////////////////////////dev

  globalState.setStatus('roll')

}

function operation() {
  switch (globalState.status()) {
    case 'roll':
      items.boss.roll(delta)
      items.miniCubes.wander(delta)

      items.pointLight1.position.x = items.boss.obj.position.x
      items.pointLight1.position.z = items.boss.obj.position.z + 15

    break
    
    case 'look':
      items.pointLight1.position.z = 13.74
    case 'pause':
      items.field.shake(delta, items.boss.obj.userData.rollIndex)
      items.miniCubes.resetRollAndPause(delta)

    break

    case 'activateEyes':
      items.boss.activateEyes(delta)

    break

    case 'lookAround':
      items.boss.lookAround(delta)
      items.miniCubes.scatter(delta, items.boss.spotLightTargets)

    break

    case 'disableEyes':
      items.boss.disableEyes(delta)
      items.miniCubes.resetRollAndSetNextPos()

    break

    default:
  }
}

function render() {
  requestAnimationFrame(render)

  elapsed = base.clock.getElapsedTime()
  delta = elapsed - currentTime
  delta = Math.max(0, Math.min(delta, 0.2))
  currentTime = elapsed

  // devUpdate() /////////////////dev

  operation()
  base.renderer.render(base.scene, base.camera)
}