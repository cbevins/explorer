/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { GeoBounds } from '../Geo/index.js'
import { FireMesh } from './FireMesh.js'
import { FireMeshBehaviorProviderBetaNSEW } from './FireMeshBehaviorProviderBetaNSEW.js'
import { FireMeshInputProviderConstant } from './FireMeshInputProviderConstant.js'

const west = 1000
const east = 2000
const north = 5000
const south = 3000
const spacing = 1
const bounds = new GeoBounds(west, north, east, south, spacing, spacing)

const fireInputProvider = new FireMeshInputProviderConstant()
const fireBehaviorProvider = new FireMeshBehaviorProviderBetaNSEW()

test('1: FireMesh constructor', () => {
  const mesh = new FireMesh(bounds, fireInputProvider, fireBehaviorProvider)
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
  const mesh = new FireMesh(bounds, fireInputProvider, fireBehaviorProvider)
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
  const mesh = new FireMesh(bounds, fireInputProvider, fireBehaviorProvider)
  expect(mesh.horzLineAt(4500).segments().length).toEqual(0)
  expect(mesh.vertLineAt(1500).segments().length).toEqual(0)

  expect(mesh.igniteAt(1500, 4500)).toEqual(true)
  expect(mesh.horzLineAt(4500).segments().length).toEqual(1)
  expect(mesh.vertLineAt(1500).segments().length).toEqual(1)
  expect(mesh.igniteAt(1500, 4500)).toEqual(false)
})

// ------------------------------------------------------------------------------------
const ros = {
  east: 6.2619789019932,
  southeast: 50.38808570081844,
  south: 6.2619789019932,
  southwest: 2.010790782028448,
  west: 1.1976913737873367,
  northwest: 1.0258645045017885,
  north: 1.1976913737873367,
  northeast: 2.010790782028448
}

test('5: FireMesh burnForPeriod()', () => {
  const mesh = new FireMesh(bounds, fireInputProvider, fireBehaviorProvider)
  expect(mesh.igniteAt(1500, 4500)).toEqual(true)
  expect(mesh.horzLineAt(4500).segments().length).toEqual(1)
  expect(mesh.horzLineAt(4500).segment(0).begins()).toEqual(1500)
  expect(mesh.horzLineAt(4500).segment(0).ends()).toEqual(1500)
  expect(mesh.vertLineAt(1500).segments().length).toEqual(1)
  expect(mesh.vertLineAt(1500).segment(0).begins()).toEqual(4500)
  expect(mesh.vertLineAt(1500).segment(0).ends()).toEqual(4500)

  const duration = 1
  mesh.burnForPeriod(duration)
  expect(mesh.horzLineAt(4500).segment(0).begins()).toEqual(1500 - ros.west * duration)
  expect(mesh.horzLineAt(4500).segment(0).ends()).toEqual(1500 + ros.east * duration)
  expect(mesh.vertLineAt(1500).segment(0).begins()).toEqual(4500 - ros.south * duration)
  expect(mesh.vertLineAt(1500).segment(0).ends()).toEqual(4500 + ros.north * duration)
  console.log(mesh._ignitions)
})
