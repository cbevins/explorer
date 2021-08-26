/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { FireMeshLine } from './FireMeshLine.js'

test('1: FireMeshLine constructor() and accessors', () => {
  const dflt = new FireMeshLine()
  expect(dflt.anchor()).toEqual(0)
  expect(dflt.segments()).toEqual([])

  const horz = new FireMeshLine(4000)
  expect(horz.anchor()).toEqual(4000) // y-position of this horizontal scanline
  expect(horz.segments()).toEqual([])

  const vert = new FireMeshLine(1000)
  expect(vert.anchor()).toEqual(1000) // x-position of this vertical scanline
  expect(vert.segments()).toEqual([])
})

test('2: FireMeshLine igniteAt(), segment()', () => {
  const horz = new FireMeshLine(4000)
  expect(horz.isBurnableAt(1500)).toEqual(true)
  expect(horz.isBurnedAt(1500)).toEqual(false)
  expect(horz.isUnburnableAt(1500)).toEqual(false)
  expect(horz.isUnburnedAt(1500)).toEqual(true)

  expect(horz.igniteAt(1500)).toEqual(true)
  expect(horz.isBurnableAt(1500)).toEqual(true)
  expect(horz.isBurnedAt(1500)).toEqual(true)
  expect(horz.isUnburnableAt(1500)).toEqual(false)
  expect(horz.isUnburnedAt(1500)).toEqual(false)
  expect(horz.segments().length).toEqual(1)
  expect(horz.segment(0).begins()).toEqual(1500)

  // Should return false since x 1500 is no longer unburned
  expect(horz.igniteAt(1500)).toEqual(false)
  expect(horz.segments().length).toEqual(1)

  // Add segment at end of array
  expect(horz.igniteAt(1700)).toEqual(true)
  expect(horz.segments().length).toEqual(2)
  expect(horz.segment(0).begins()).toEqual(1500)
  expect(horz.segment(1).begins()).toEqual(1700)

  // Add segment at middle of array
  expect(horz.igniteAt(1600)).toEqual(true)
  expect(horz.segments().length).toEqual(3)
  expect(horz.segment(0).begins()).toEqual(1500)
  expect(horz.segment(1).begins()).toEqual(1600)
  expect(horz.segment(2).begins()).toEqual(1700)

  // Add segment to front (west/left or north/top) of array
  expect(horz.igniteAt(1400)).toEqual(true)
  expect(horz.segments().length).toEqual(4)
  expect(horz.segment(0).begins()).toEqual(1400)
  expect(horz.segment(1).begins()).toEqual(1500)
  expect(horz.segment(2).begins()).toEqual(1600)
  expect(horz.segment(3).begins()).toEqual(1700)

  // Add segment to back (east/right or bottom/south) of array
  expect(horz.igniteAt(1800)).toEqual(true)
  expect(horz.segments().length).toEqual(5)
  expect(horz.segment(0).begins()).toEqual(1400)
  expect(horz.segment(1).begins()).toEqual(1500)
  expect(horz.segment(2).begins()).toEqual(1600)
  expect(horz.segment(3).begins()).toEqual(1700)
  expect(horz.segment(4).begins()).toEqual(1800)
})
