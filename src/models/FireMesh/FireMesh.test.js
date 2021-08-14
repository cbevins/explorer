/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { GeoBounds } from '../Geo/index.js'
import { FireMesh } from './FireMesh.js'
import { FireBehaviorProvider, FireInputProviderMock } from '../FireBehavior/index.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const spacing = 1
const bounds = new GeoBounds(west, north, east, south, spacing, spacing)

test('1: FireMesh()', () => {
  const fireInputProvider = new FireInputProviderMock()
  const fireBehaviorProvider = new FireBehaviorProvider()
  const mesh = new FireMesh(bounds, fireInputProvider, fireBehaviorProvider)
  expect(mesh.bounds()).toEqual(bounds)

  expect(mesh.horz().lines().length).toEqual(bounds.cols())
  expect(mesh.horz().isHorizontal()).toEqual(true)
  expect(mesh.horz().isVertical()).toEqual(false)

  expect(mesh.vert().lines().length).toEqual(bounds.rows())
  expect(mesh.vert().isHorizontal()).toEqual(false)
  expect(mesh.vert().isVertical()).toEqual(true)
})
