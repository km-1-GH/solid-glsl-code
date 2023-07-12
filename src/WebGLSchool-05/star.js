import vs from './shader/star.vert?raw'
import fs from './shader/star.frag?raw'

const offsetTheta = Math.PI * -0.5
const shortR = 0.2
const longR = 0.4

const positions = []
const posStride = 3
const colors = []
const colorStride = 4

for (let i = 0; i < 5; i++) {
  // position
    const theta = offsetTheta + (360 / 5) / 180 * Math.PI * i
    const halfTheta = offsetTheta + (360 / 5) / 180 * Math.PI * (i + 0.5)
    const nextTheta = offsetTheta + (360 / 5) / 180 * Math.PI * (i + 1)

    // first triangle
    const vert1 = [0, 0, 0]
    const vert2 = [Math.cos(theta) * shortR, Math.sin(theta) * shortR, 0]
    const vert3 = [Math.cos(halfTheta) * longR, Math.sin(halfTheta) * longR, 0]
    
    // second triangle
    const vert4 = [0, 0, 0]
    const vert5 = [Math.cos(nextTheta) * shortR, Math.sin(nextTheta) * shortR, 0]
    const vert6 = [Math.cos(halfTheta) * longR, Math.sin(halfTheta) * longR, 0]

    positions.push(...vert1, ...vert2, ...vert3, ...vert4, ...vert5, ...vert6)
  
  // color
    const color = [
      255/255, 245/255, 23/255, 1.0,
      255/255, 177/255, 0/255, 1.0,
      255/255, 248/255, 83/255, 1.0,
      255/255, 245/255, 23/255, 1.0,
      255/255, 177/255, 0/255, 1.0,
      255/255, 248/255, 83/255, 1.0,
    ];

    colors.push(...color)
}

export { positions, colors, vs, fs }