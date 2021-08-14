/* eslint-disable jest/prefer-to-have-length */
import { FireMeshSegment } from './FireMeshSegment.js'

test('1: FireSegment', () => {
  const seg = new FireMeshSegment(4, 5)
  expect(seg.begins()).toEqual(4)
  expect(seg.ends()).toEqual(5)

  expect(seg.isBurnable()).toEqual(true)
  expect(seg.isBurned()).toEqual(true)
  expect(seg.isUnburned()).toEqual(false)
  expect(seg.isUnburnable()).toEqual(false)

  expect(seg.contains(3.9999)).toEqual(false)
  expect(seg.contains(4)).toEqual(true)
  expect(seg.contains(4.5)).toEqual(true)
  expect(seg.contains(5)).toEqual(true)
  expect(seg.contains(5.00001)).toEqual(false)

  expect(seg.follows(3.9)).toEqual(true)
  expect(seg.follows(4)).toEqual(false)

  expect(seg.preceeds(3.9)).toEqual(false)
  expect(seg.preceeds(4)).toEqual(false)
  expect(seg.preceeds(5)).toEqual(false)
  expect(seg.preceeds(5.1)).toEqual(true)
})
