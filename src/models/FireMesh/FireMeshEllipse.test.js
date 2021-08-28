/* eslint-disable jest/prefer-to-have-length */
import { FireMeshEllipse } from './FireMeshEllipse.js'

const headRos = 93.3012701892219
const length = 100
const width = 50
const degrees = 135
const timeSinceIgnition = 1
const lineSpacing = 5
const verbose = false
const fw = new FireMeshEllipse(length, width, degrees, timeSinceIgnition, lineSpacing, verbose)

function fmt (x, y) { return `[${x.toFixed(2)}, ${y.toFixed(2)}]` }

test('1: FireMeshEllipse() as expected', () => {
  expect(fw.a()).toEqual(50)
  expect(fw.b()).toEqual(25)
  expect(fw.hOrigin()).toEqual(1)
  // expect(fw.vOrigin()).toEqual(1)
  expect(fw.headRate()).toBeCloseTo(headRos, 12)
})

test('2: FireMeshEllipse() horizontal scan lines', () => {
  const scans = fw.hlines()
  expect(scans.length).toEqual(16)
  expect(fw.hOrigin()).toEqual(1)
  // expect(fw.vOrigin()).toEqual(1)
  let str = 'FireMeshEllipse.test.js: Horizontal Scanline Intersections for Y Steps\n'
  scans.forEach(([y, x1, x2]) => { str += `${fmt(x1, y)}, ${fmt(x2, y)}\n` })
  console.log(str)
})

// deprecatedtest('3: FireMeshEllipse() vertical scan lines', () => {
//   const scans = fw.vlines()
//   expect(scans.length).toEqual(16)
//   expect(fw.hOrigin()).toEqual(1)
//   expect(fw.vOrigin()).toEqual(1)
//   let str = 'FireMeshEllipse.test.js: Vertical Scanline Intersections for Y Steps\n'
//   scans.forEach(([x, y1, y2]) => { str += `${fmt(x, y1)}, ${fmt(x, y2)}\n` })
//   console.log(str)
// })
