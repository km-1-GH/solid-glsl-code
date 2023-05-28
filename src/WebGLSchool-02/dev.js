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
  gui.add(items.pointLight.position, 'x', -10, 10, 0.001).name('lightPos.x')
  gui.add(items.pointLight.position, 'y', -3, 10, 0.001).name('lightPos.y')
  gui.add(items.pointLight.position, 'z', -30, 20, 0.001).name('lightPos.z')

  // boss color
  // guiParam.bossColor = items.boss.obj.material.color.getHexString()
  // gui.addColor(guiParam, 'bossColor').onChange(value => {
  //   items.boss.obj.material.color.set(value)
  // })

  // positioner
  // const positioners = []
  // const positionerObj = new THREE.Mesh(
  //   new THREE.BoxGeometry(0.1, 0.1, 0.1),
  //   new THREE.MeshBasicMaterial({ color: 0xff0000 })
  // )
  // const initialPos = [
  //   new THREE.Vector3(-0.5, 0, 0),
  //   new THREE.Vector3(-3, 2, 0),
  //   new THREE.Vector3(3, 2, 0),
  //   new THREE.Vector3(0.5, 0, 0),
  // ]

  // for (let i = 0; i < 4; i++) {
  //   positioners[i] = positionerObj.clone()
  //   positioners[i].position.copy(initialPos[i])
  //   base.scene.add(positioners[i])
  // }

  // let currentNum = 0
  // let prevNum = positioners.length - 1

  // window.addEventListener('keydown', e => {
  //   switch (e.key) {
  //     case 's': //switch
  //       prevNum = currentNum
  //       currentNum ++
  //       if (currentNum === positioners.length) currentNum = 0

  //       positioners[currentNum].scale.setScalar(2)
  //       positioners[prevNum].scale.setScalar(1)
  //     break
      
  //     case 'a': //left
  //       positioners[currentNum].position.x -= 0.1
        
  //     break
      
  //     case 'd': //right
  //       positioners[currentNum].position.x += 0.1
      
  //     break
      
  //     case 'w': //up
  //       positioners[currentNum].position.y += 0.1
      
  //     break
      
  //     case 'x': //down
  //       positioners[currentNum].position.y -= 0.1
      
  //     break
      
  //     case 'q': //back
  //       positioners[currentNum].position.z -= 0.1
      
  //     break
      
  //     case 'z': //forth
  //       positioners[currentNum].position.z += 0.1

  //     break

  //     case 'Enter': 
  //       const positions = []
  //       positioners.forEach(obj => {
  //         positions.push(obj.position)
  //       })
  //       console.log(positions);
  //       createCurve(positions, items)

  //     break
      
  //   }
  // })

}

function createCurve(positions, items) {
  if (items.line) {
    items.fan.propellers.remove(items.line)
    items.line.geometry.dispose()
    items.line.material.dispose()
  }
  // const curve = new THREE.CatmullRomCurve3(positions)
  const curve = new THREE.CubicBezierCurve3(positions[0], positions[1], positions[2], positions[3]);
  
  const points = curve.getPoints(32)
  points.unshift(new THREE.Vector3(0, 0, 0))
  points.push(new THREE.Vector3(0, 0, 0))
  const geometry = new THREE.BufferGeometry().setFromPoints( points );
  const material = new THREE.LineBasicMaterial( { color: 'purple' } );
  items.line = new THREE.Line( geometry, material );
  items.fan.propellers.add(items.line)
}

export function devUpdate() {
}