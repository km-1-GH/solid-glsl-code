import './style.scss'
// import * as THREE from 'three'
import SetupTHREE from './setupTHREE.js'
import CreateMesh from './createMesh'
import GUI from 'lil-gui'

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
  clearColor: 0x1f2141,
}

const CAMERA_PARAM = {
  fov: 60,
  near: 0.1,
  far: 100,
  pos: { x: 0, y: -0.5, z: 10}
}

function init() {
  // const gui = new GUI()
  // gui.add(base.directionalLight.position, 'x', -1, 1, 0.001)
  // gui.add(base.directionalLight.position, 'y', -1, 1, 0.001)
  // gui.add(base.directionalLight.position, 'z', -1, 1, 0.001)
}

function render() {
  requestAnimationFrame(render)

  elapsed = base.clock.getElapsedTime()
  delta = elapsed - currentTime
  delta = Math.max(0, Math.min(delta, 0.2))
  currentTime = elapsed

  items.boss.update(delta)
  items.field.update(delta, items.boss.obj.userData)

  base.renderer.render(base.scene, base.camera)
}