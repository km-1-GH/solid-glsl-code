import './style.scss'
import * as THREE from 'three'
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

  // promise
  createMesh.create(base.scene).then(() => {
    items = createMesh.getItems()
    init()
    render()
    base.clock.start()
  })
})

window.addEventListener('resize', () => {
  base.resize()
})

const RENDER_PARAM = {
  clearColor: 'skyblue',
}

const CAMERA_PARAM = {
  fov: 60,
  near: 0.1,
  far: 100,
  pos: { x: 0, y: -0.5, z: 10}
}

function init() {

  dev(base, items)  //////////////////////////dev

  globalState.setStatus('fly')
}

function operation() {
  switch (globalState.status()) {
    case 'fly':
      items.arm.fly(delta)
      checkCollision()

    break

    case 'seize':
      items.arm.seize(delta)
    break

    case 'caught':
      items.rock.rock.material.opacity = 0.8
      items.rock.rock.material.color.set(new THREE.Color('ivory'))

      globalState.setStatus('reset')

    break

    case 'reset':
      globalState.setStatus('hold')
      setTimeout(() => {
        items.rock.reset()
        items.arm.reset()
        globalState.setStatus('fly')
      }, 3000)

    break
    default:
  }
}

function checkCollision() {
  items.rock.box3.setFromObject(items.rock.rock)
  items.arm.box3.setFromObject(items.arm.headBox)

  const caught = items.rock.box3.containsBox(items.arm.box3)
  if (caught) {
    globalState.setStatus('seize')
  }
}

function render() {
  requestAnimationFrame(render)

  elapsed = base.clock.getElapsedTime()
  delta = elapsed - currentTime
  delta = Math.max(0, Math.min(delta, 0.2))
  currentTime = elapsed

  operation()
  base.renderer.render(base.scene, base.camera)
}