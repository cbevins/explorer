/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { GeoBounds } from '../Geo/index.js'
import { FireMeshArray } from './FireMeshArray.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const spacing = 1
const bounds = new GeoBounds(west, north, east, south, spacing, spacing)

test('4: FireMeshArray()', () => {
  const horz = new FireMeshArray(bounds, true)
  expect(horz.lines().length).toEqual(bounds.cols())
  expect(horz.isHorizontal()).toEqual(true)
  expect(horz.isVertical()).toEqual(false)
  expect(horz.bounds()).toEqual(bounds)

  const vert = new FireMeshArray(bounds, false)
  expect(vert.lines().length).toEqual(bounds.rows())
  expect(vert.isHorizontal()).toEqual(false)
  expect(vert.isVertical()).toEqual(true)
})
