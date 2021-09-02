/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { GeoBounds } from '../Geo/index.js'
import { FireMesh } from './FireMesh.js'
import { FireMeshBehaviorProviderEllipse } from './FireMeshBehaviorProviderEllipse.js'
import { FireMeshInputProviderConstant } from './FireMeshInputProviderConstant.js'
import { FireMeshIgnitionEllipseProvider } from './FireMeshIgnitionEllipseProvider.js'

const fireBehaviorProvider = new FireMeshBehaviorProviderEllipse()
const fireInputProvider = new FireMeshInputProviderConstant()
const ignitionEllipseProvider = new FireMeshIgnitionEllipseProvider(fireInputProvider, fireBehaviorProvider)

// const west = 1450
// const east = 1800
// const south = 4200
// const north = 4550
const west = 1000
const east = 2000
const north = 5000
const south = 2000
const spacing = 1
const bounds = new GeoBounds(west, north, east, south, spacing, spacing)
const mesh = new FireMesh(bounds, ignitionEllipseProvider)

function fmt (val, wid, dec = 0) { return val.toFixed(dec).padStart(wid, ' ') }

test('1: FireMesh burnForPeriod() overlapBurned()', () => {
  console.log('Start ------------------------------------------')
  // Add an ignition point to kick off the fire
  expect(mesh.igniteAt(1500, 4500)).toEqual(true)
  let str = 'Per HignPt HLines VignPt Vlines\n'
  for (let p = 0; p < 20; p++) {
    mesh.burnForPeriod(1)
    str += `${fmt(p, 3)} ${fmt(mesh.horzIgnitionPoints().length, 6)} ${fmt(mesh.horzBurnedLines(), 6)} ${fmt(mesh.vertIgnitionPoints().length, 6)} ${fmt(mesh.vertBurnedLines(), 6)}\n`
  }
  console.log(str)
  console.log('End ------------------------------------------')
})

// nottest('2: FireMesh burnForPeriod() performance', () => {
//   // Add an ignition point to kick off the fire
//   expect(mesh.igniteAt(1500, 4500)).toEqual(true)
//   let str = 'FireMesh.burnForPeriod() performance:\n'
//   str += 'Per IgnPts Segments Lines Burn-Area Millisec\n'
//   const startAll = Date.now()
//   let area = 0
//   for (let p = 0; p < 1; p++) {
//     const start = Date.now()
//     mesh.burnForPeriod(1)
//     const elapsed = Date.now() - start
//     // Gather stats
//     let nsegs = 0
//     let nlines = 0
//     area = 0
//     for (let idx = 0; idx < mesh.horzArray().length; idx++) {
//       const line = mesh.horzLine(idx)
//       const segs = line.segments().length
//       nsegs += segs
//       if (segs) nlines++ // number of lines with segments
//       line.segments().forEach(segment => { area += segment.length() })
//       // if (segs > 1) {
//       //   console.log(`Period ${p} Line ${idx} at y ${line.anchor()} has ${nsegs} segments:`)
//       //   console.log(line.segments())
//       //   break
//       // }
//     }
//     area *= mesh.bounds().xSpacing()
//     str = `${fmt(p + 1, 3)} ${fmt(mesh._horzIgnitions.length, 6)} ${fmt(nsegs, 8)} ${fmt(nlines, 5)} ${fmt(area, 9)} ${fmt(elapsed, 8)}\n`
//     console.log(str)
//   }
//   console.log('Total time', Date.now() - startAll,
//     'ms for', mesh.bounds().xSpacing(),
//     'ft spacing of', (area / (66 * 660)).toFixed(2), 'ac fire')
// })
