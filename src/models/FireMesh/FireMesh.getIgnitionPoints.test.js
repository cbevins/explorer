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

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const spacing = 1
const bounds = new GeoBounds(west, north, east, south, spacing, spacing)

test('1: FireMesh.getHorzIgnitionPoints()', () => {
  const mesh = new FireMesh(bounds, ignitionEllipseProvider)

  // Ignite a new fire at [x, y]
  const x = 1500
  const y = 4500
  expect(mesh.igniteAt(x, y)).toEqual(true)

  // Get the FireMeshLine for the ignition point
  const lidx = mesh.horzIdxAt(y)
  expect(lidx).toEqual(500)
  const line = mesh.horzLineAt(y)
  expect(mesh.horzLine(lidx)).toEqual(line)

  // Should be just 1 ignition point
  let ignPts = mesh.getHorzIgnitionPoints()
  expect(ignPts.length).toEqual(1)
  expect(ignPts[0]).toEqual([x, y])

  // Burn a strip
  line.overlayBurned(1499, 1501)
  ignPts = mesh.getHorzIgnitionPoints()
  expect(ignPts.length).toEqual(3)
  expect(ignPts[0]).toEqual([1499, 4500])
  expect(ignPts[1]).toEqual([1500, 4500])
  expect(ignPts[2]).toEqual([1501, 4500])

  // Burn another strip to the north
  const above = mesh.horzLineAt(y + spacing)
  expect(above.anchor()).toEqual(4501)
  above.overlayBurned(1499, 1501)
  ignPts = mesh.getHorzIgnitionPoints()
  expect(ignPts.length).toEqual(6)
  expect(ignPts[0]).toEqual([1499, 4501])
  expect(ignPts[1]).toEqual([1500, 4501])
  expect(ignPts[2]).toEqual([1501, 4501])
  expect(ignPts[3]).toEqual([1499, 4500])
  expect(ignPts[4]).toEqual([1500, 4500])
  expect(ignPts[5]).toEqual([1501, 4500])

  // Burn another strip to the south
  const below = mesh.horzLineAt(y - spacing)
  expect(below.anchor()).toEqual(4499)
  below.overlayBurned(1499, 1501)
  ignPts = mesh.getHorzIgnitionPoints()
  expect(ignPts.length).toEqual(8)
})

test('2: FireMesh.getVertIgnitionPoints()', () => {
  const mesh = new FireMesh(bounds, ignitionEllipseProvider)

  // Ignite a new fire at [x, y]
  const x = 1500
  const y = 4500
  expect(mesh.igniteAt(x, y)).toEqual(true)

  // Get the FireMeshLine for the ignition point
  const lidy = mesh.vertIdxAt(x)
  expect(lidy).toEqual(500)
  const line = mesh.vertLineAt(x)
  expect(mesh.vertLine(lidy)).toEqual(line)

  // Should be just 1 ignition point
  let ignPts = mesh.getVertIgnitionPoints()
  expect(ignPts.length).toEqual(1)
  expect(ignPts[0]).toEqual([x, y])

  // Burn a strip
  line.overlayBurned(4499, 4501)
  ignPts = mesh.getVertIgnitionPoints()
  expect(ignPts.length).toEqual(3)
  expect(ignPts[0]).toEqual([1500, 4499])
  expect(ignPts[1]).toEqual([1500, 4500])
  expect(ignPts[2]).toEqual([1500, 4501])

  // Burn another strip to the east
  const right = mesh.vertLineAt(x + spacing)
  expect(right.anchor()).toEqual(1501)
  right.overlayBurned(4499, 4501)
  ignPts = mesh.getVertIgnitionPoints()
  expect(ignPts.length).toEqual(6)
  expect(ignPts[0]).toEqual([1500, 4499])
  expect(ignPts[1]).toEqual([1500, 4500])
  expect(ignPts[2]).toEqual([1500, 4501])
  expect(ignPts[3]).toEqual([1501, 4499])
  expect(ignPts[4]).toEqual([1501, 4500])
  expect(ignPts[5]).toEqual([1501, 4501])

  // Burn another strip to the west
  const left = mesh.vertLineAt(x - spacing)
  expect(left.anchor()).toEqual(1499)
  left.overlayBurned(4499, 4501)
  ignPts = mesh.getVertIgnitionPoints()
  expect(ignPts.length).toEqual(8)
})
