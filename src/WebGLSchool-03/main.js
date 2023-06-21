import './style.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import SetupTHREE from './setupTHREE.js'
import CreateMesh from './createMesh.js'
import globalState from './globalState.js'

import { dev, devUpdate } from './dev.js'
import { az } from '../../dist/assets/solid-d7350cca'

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

  // orbit controls
  items.controls = new OrbitControls(base.camera, base.renderer.domElement)
  
  setClickEvent()

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

function setClickEvent() {
  window.addEventListener('pointermove', (e) => {
    if (globalState.status() === 'fly') {
      // スクリーン座標から-1～1に
      let screenX = (e.clientX / window.innerWidth) * 2 - 1
      let screenY = -1 * ((e.clientY / window.innerHeight) * 2 - 1)
      
      // 後ろまでまわらないように半分にする
      screenX *= 0.5
      screenY *= 0.5
      
      let latitude = screenY * Math.PI // 緯度
      let longitude = screenX * Math.PI // 経度
      
      // カメラの位置による修正 (cameraPos->(0, -0.5, 10) lookAt->(0, 0, 0))
      latitude -= base.camera.rotation.x

      // orbit controls から緯度、経度を修正
      const polarAngle = (items.controls.getPolarAngle() - Math.PI * 0.5) //-Math.PI*0.5 ~ Math.PI*0.5 / center=0
      const azimuthAngle = items.controls.getAzimuthalAngle() //-Math.PI ~ Math.PI / center=0

      latitude += polarAngle - (polarAngle / (Math.PI * 0.5)) * Math.PI * 0.5  //polarAngleだけ足すと行き過ぎる…
      longitude += azimuthAngle

      // console.log(Math.round(polarAngle * 100) / 100, Math.round(latitude * 100) / 100, Math.round(longitude * 100) / 100);

      // 緯度、経度からPositionを計算して更新
      const x = Math.sin(longitude) * Math.cos(latitude)
      const y = Math.sin(latitude)
      const z = Math.cos(longitude) * Math.cos(latitude)

      items.rock.rock.position.set(x, y, z)
    }
  })
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

  // console.log(items.controls.getAzimuthalAngle());
  // console.log(items.controls.getPolarAngle())

  operation()
  base.renderer.render(base.scene, base.camera)
}