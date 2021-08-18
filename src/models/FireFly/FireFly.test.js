/* eslint-disable jest/prefer-to-have-length */
import { expect, test } from '@jest/globals'
import { destinations } from './angles.js'
import { GeoBounds } from '../Geo/index.js'
import { FireFly } from './FireFly.js'
import { DestinationStore } from './Destination.js'

// Create a GeoFireGrid instance 1000 ft west-to-east and 1000 ft north-to-south with 10-ft spacing
const west = 1000
const east = 2000
const north = 5000
const south = 4000
const xdist = 1
const ydist = 1
const bounds = new GeoBounds(west, north, east, south, xdist, ydist)

test('1: GeoBounds cell and grid point indices', () => {
  expect(bounds.rows()).toEqual(1001)
  expect(bounds.cols()).toEqual(1001)
  expect(bounds.cells()).toEqual(1000 * 1000)
  expect(bounds.xInterval(1500)).toEqual(500)
  expect(bounds.yInterval(4500)).toEqual(500)
  expect(bounds.cellIndex(1500, 4500)).toEqual(500 + 500 * 1001)
})

test('2: FireFly', () => {
  let ff = new FireFly(1500, 4500, 1510, 4510)
  expect(ff.x()).toEqual(1500)
  expect(ff.y()).toEqual(4500)
  expect(ff.dx()).toEqual(1510)
  expect(ff.dy()).toEqual(4510)
  expect(ff.azimuth()).toEqual(45)

  ff = new FireFly(1500, 4500, 1490, 4490)
  expect(ff.position()).toEqual([1500, 4500])
  expect(ff.destination()).toEqual([1490, 4490])
  expect(ff.azimuth()).toEqual(225)

  expect(new FireFly(1500, 4500, 1500, 4510).azimuth()).toEqual(0)
  expect(new FireFly(1500, 4500, 1510, 4510).azimuth()).toEqual(45)
  expect(new FireFly(1500, 4500, 1510, 4500).azimuth()).toEqual(90)
  expect(new FireFly(1500, 4500, 1510, 4490).azimuth()).toEqual(135)
  expect(new FireFly(1500, 4500, 1500, 4490).azimuth()).toEqual(180)
  expect(new FireFly(1500, 4500, 1490, 4490).azimuth()).toEqual(225)
  expect(new FireFly(1500, 4500, 1490, 4500).azimuth()).toEqual(270)
  expect(new FireFly(1500, 4500, 1490, 4510).azimuth()).toEqual(315)
})

test('3: DestinationStore', () => {
  const store = new DestinationStore(bounds)
  expect(store.size()).toEqual(0)
  expect(store.hasDestination(1500, 4500)).toEqual(false)

  // Add a Destination grid point
  const dest = store.create(1500, 4500)
  expect(store.size()).toEqual(1)
  expect(store.hasDestination(1500, 4500)).toEqual(true)

  expect(dest.x()).toEqual(1500)
  expect(dest.y()).toEqual(4500)
  expect(dest.idx()).toEqual(500 + 500 * 1001)
  expect(dest.flies().length).toEqual(0)
})

test('3: destinations', () => {
  const d = destinations()
  expect(d.length).toEqual(31 * 8 + 8)
  const store = new DestinationStore(bounds)
  // Ignition point
  const x = 1500
  const y = 4500
  d.forEach(([dx, dy]) => {
    store.addFireFly(new FireFly(x, y, x + dx, y + dy))
  })
  expect(store.size()).toEqual(31 * 8 + 8)
})
