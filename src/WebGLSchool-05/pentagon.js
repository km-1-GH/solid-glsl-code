import vs from './shader/star.vert?raw'
import fs from './shader/star.frag?raw'

const offsetTheta = Math.PI * 0.5
const R = 0.4

const positions = []
const posStride = 3
const colors = []
const colorStride = 4

for (let i = 0; i < 5; i++) {
  // position
    const theta = offsetTheta + (360 / 5) / 180 * Math.PI * i
    const nextTheta = offsetTheta + (360 / 5) / 180 * Math.PI * (i + 1)

    // triangle
    const vert1 = [0, 0, 0]
    const vert2 = [Math.cos(theta) * R, Math.sin(theta) * R, 0]
    const vert3 = [Math.cos(nextTheta) * R, Math.sin(nextTheta) * R, 0]

    positions.push(...vert1, ...vert2, ...vert3)
  
  // color
    const color = [
      255/255, 245/255, 23/255, 1.0,
      255/255, 177/255, 0/255, 1.0,
      255/255, 248/255, 83/255, 1.0,
    ];

    colors.push(...color)

}

export { positions, posStride, colors, colorStride, vs, fs }