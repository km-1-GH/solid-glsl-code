import './style.scss'
import * as THREE from 'three'
import SetupTHREE from './setupTHREE.js'
import CreateMesh from './createMesh'

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

  dev(base, items)  //////////////////////////dev


}

function render() {
  requestAnimationFrame(render)

  elapsed = base.clock.getElapsedTime()
  delta = elapsed - currentTime
  delta = Math.max(0, Math.min(delta, 0.2))
  currentTime = elapsed

  items.boss.update(delta)
  items.field.update(delta, items.boss.obj.userData)
  items.miniCubes.update(delta, items.boss.obj.userData, items.boss.spotLightTargets)

  devUpdate() /////////////////dev

  base.renderer.render(base.scene, base.camera)
}