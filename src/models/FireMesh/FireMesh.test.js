/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { GeoBounds } from '../Geo/index.js'
import { FireMesh } from './FireMesh.js'
import { FireMeshBehaviorProvider } from './FireMeshBehaviorProvider.js'
import { FireMeshInputProviderMock } from './FireMeshInputProviderMock.js'

const west = 1000
const east = 2000
const north = 5000
const south = 3000
const spacing = 1
const bounds = new GeoBounds(west, north, east, south, spacing, spacing)

const fireInputProvider = new FireMeshInputProviderMock()
const fireBehaviorProvider = new FireMeshBehaviorProvider()

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

test('3: FireMesh horzIdxAt(), vertIdxAt()', () => {
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
})