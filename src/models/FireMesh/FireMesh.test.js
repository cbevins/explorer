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
const south = 3000
const spacing = 1
const bounds = new GeoBounds(west, north, east, south, spacing, spacing)

test('1: FireMesh constructor', () => {
  const mesh = new FireMesh(bounds, ignitionEllipseProvider)
  expect(mesh.bounds()).toEqual(bounds)
  expect(bounds.rows()).toEqual(2001)
  expect(bounds.cols()).toEqual(1001)
  expect(mesh.horzArray().length).toEqual(2001)
  expect(mesh.vertArray().length).toEqual(1001)
})

test('2: GeoBounds snapX(), snapY(), xInterval(), yInterval()', () => {
  expect(bounds.snapX(1500.4)).toEqual(1500)
  expect(bounds.snapX(1500.5)).toEqual(1501)
  expect(bounds.snapY(4500.95)).toEqual(4501)
  expect(bounds.xInterval(bounds.west())).toEqual(0)
  expect(bounds.xInterval(1500)).toEqual(500)
  expect(bounds.xInterval(bounds.east())).toEqual(1000)
  expect(bounds.yInterval(bounds.north())).toEqual(0)
  expect(bounds.yInterval(4750)).toEqual(250)
  expect(bounds.yInterval(4250)).toEqual(750)
  expect(bounds.yInterval(bounds.south())).toEqual(2000)
})

test('3: FireMesh horzIdxAt(), horzLineAt(), vertIdxAt(), vertLineAt()', () => {
  const mesh = new FireMesh(bounds, ignitionEllipseProvider)
  expect(mesh.horzIdxAt(bounds.north())).toEqual(0)
  expect(mesh.horzIdxAt(bounds.south())).toEqual(2000)
  expect(mesh.horzIdxAt(bounds.north() + 100)).toEqual(0) // out-of-bounds
  expect(mesh.horzIdxAt(bounds.south() - 100)).toEqual(2000) // out-of-bounds

  expect(mesh.vertIdxAt(bounds.west())).toEqual(0)
  expect(mesh.vertIdxAt(bounds.east())).toEqual(1000)
  expect(mesh.vertIdxAt(bounds.west() - 100)).toEqual(0)
  expect(mesh.vertIdxAt(bounds.east() + 100)).toEqual(1000)

  const idx = mesh.horzIdxAt(bounds.north())
  expect(idx).toEqual(0)
  expect(mesh.horzLine(idx).anchor()).toEqual(5000)

  const hline = mesh.horzLineAt(4000)
  expect(hline.anchor()).toEqual(4000)
  expect(mesh.horzLineAt(4500).anchor()).toEqual(4500)
  expect(mesh.vertLineAt(1500).anchor()).toEqual(1500)
})

test('4: FireMesh igniteAt()', () => {
  const mesh = new FireMesh(bounds, ignitionEllipseProvider)
  expect(mesh.horzLineAt(4500).segments().length).toEqual(0)
  expect(mesh.vertLineAt(1500).segments().length).toEqual(0)

  expect(mesh.igniteAt(1500, 4500)).toEqual(true)
  expect(mesh.horzLineAt(4500).segments().length).toEqual(1)
  expect(mesh.vertLineAt(1500).segments().length).toEqual(1)
  expect(mesh.igniteAt(1500, 4500)).toEqual(false)
})

test('6: FireMesh burnForPeriod()', () => {
  const headRos = 50.38808570081844
  const backRos = 1.0258645045017885
  const length = 51.41395020532023
  const width = 14.37933914618663

  const mesh = new FireMesh(bounds, ignitionEllipseProvider)
  expect(mesh.horzArray().length).toEqual(2001)
  expect(mesh.horzIdxAt(4500)).toEqual(500)
  expect(mesh.horzIdxAt(4501)).toEqual(499)
  expect(mesh.horzLineAt(4500).segments().length).toEqual(0)

  // Add an ignition point to kick off the fire
  expect(mesh.igniteAt(1500, 4500)).toEqual(true)
  expect(mesh.horzLineAt(4500).segments().length).toEqual(1)
  mesh.burnForPeriod(1)

  expect(mesh.period().number()).toEqual(1)
  expect(mesh.period().begins()).toEqual(0)
  expect(mesh.period().ends()).toEqual(1)

  expect(mesh.fireInput().curedHerb).toEqual(0.778)
  expect(mesh.fireBehavior().headRos).toBeCloseTo(headRos, 12)
  expect(mesh.fireBehavior().backRos).toBeCloseTo(backRos, 12)
  expect(mesh.ignEllipse().headRate()).toBeCloseTo(headRos, 12)
  expect(mesh.ignEllipse().headDegrees()).toBeCloseTo(135, 12)
  expect(mesh.ignEllipse().width()).toBeCloseTo(width, 12)
  expect(mesh.ignEllipse().length()).toBeCloseTo(length, 12)

  expect(mesh.ignitionPoints().length).toEqual(1)
  expect(mesh.ignitionPoints()).toEqual([[1500, 4500]])

  // console.log(mesh.horzLineAt(4500).segments())
  expect(mesh.horzLineAt(4500).segments().length).toEqual(1)
  expect(mesh.horzLineAt(4499).segments().length).toEqual(1)
})
