import { GeoCoord } from './GeoCoord.js'
import { GeoTime } from './GeoTime.js'

test('1: GeoCoord() constructor', () => {
  const gc = new GeoCoord()
  expect(gc.x()).toEqual(0)
  expect(gc.y()).toEqual(0)
  expect(gc.xy()).toEqual([0, 0])

  expect(gc.set(1, 2)).toEqual(gc)
  expect(gc.x()).toEqual(1)
  expect(gc.y()).toEqual(2)
  expect(gc.xy()).toEqual([1, 2])

  expect(gc.setx(3)).toEqual(gc)
  expect(gc.x()).toEqual(3)
  expect(gc.y()).toEqual(2)
  expect(gc.xy()).toEqual([3, 2])

  expect(gc.sety(4)).toEqual(gc)
  expect(gc.x()).toEqual(3)
  expect(gc.y()).toEqual(4)
  expect(gc.xy()).toEqual([3, 4])
})

test('2: GeoCoord() custom constructor', () => {
  const gc = new GeoCoord(9, 8)
  expect(gc.x()).toEqual(9)
  expect(gc.y()).toEqual(8)
  expect(gc.xy()).toEqual([9, 8])
})

test('3: GeoTime() constructor', () => {
  const gc = new GeoTime()
  expect(gc.x()).toEqual(0)
  expect(gc.y()).toEqual(0)
  expect(gc.xy()).toEqual([0, 0])
  expect(gc.time()).toEqual(0)

  expect(gc.set(1, 2, 3)).toEqual(gc)
  expect(gc.x()).toEqual(1)
  expect(gc.y()).toEqual(2)
  expect(gc.xy()).toEqual([1, 2])
  expect(gc.time()).toEqual(3)

  expect(gc.setTime(4)).toEqual(gc)
  expect(gc.x()).toEqual(1)
  expect(gc.y()).toEqual(2)
  expect(gc.xy()).toEqual([1, 2])
  expect(gc.time()).toEqual(4)
})
