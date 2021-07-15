import { GeoCoord } from './GeoCoord.js'
import { GeoBounds } from './GeoBounds.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const xdist = 10
const ydist = 20

test('1: GeoBounds default constructor with accessors', () => {
  const gb = new GeoBounds(west, north, east, south)
  expect(gb.west()).toEqual(west)
  expect(gb.north()).toEqual(north)
  expect(gb.east()).toEqual(east)
  expect(gb.south()).toEqual(south)
  expect(gb.xSpacing()).toEqual(1)
  expect(gb.ySpacing()).toEqual(1)
})

test('2: GeoBounds custom constructor with accessors', () => {
  const gb = new GeoBounds(west, north, east, south, xdist, ydist)
  expect(gb.west()).toEqual(west)
  expect(gb.north()).toEqual(north)
  expect(gb.east()).toEqual(east)
  expect(gb.south()).toEqual(south)
  expect(gb.xSpacing()).toEqual(xdist)
  expect(gb.ySpacing()).toEqual(ydist)
})

test('3: GeoBounds helper getters', () => {
  const gb = new GeoBounds(west, north, east, south, xdist, ydist)
  expect(gb.width()).toEqual(east - west)
  expect(gb.height()).toEqual(north - south)
  expect(gb.southWest()).toEqual(new GeoCoord(west, south))
  expect(gb.southEast()).toEqual(new GeoCoord(east, south))
  expect(gb.northWest()).toEqual(new GeoCoord(west, north))
  expect(gb.northEast()).toEqual(new GeoCoord(east, north))
  expect(gb.cols()).toEqual(101)
  expect(gb.rows()).toEqual(51)
})

test('4: GeoBounds.inbounds(), xInboiunds(), yInbounds()', () => {
  const gb = new GeoBounds(west, north, east, south, xdist, ydist)
  expect(gb.xInbounds(west - 1e-10)).toEqual(false)
  expect(gb.xInbounds(west)).toEqual(true)
  expect(gb.xInbounds(east)).toEqual(true)
  expect(gb.xInbounds(east + 1e-10)).toEqual(false)

  expect(gb.yInbounds(north + 1e-10)).toEqual(false)
  expect(gb.yInbounds(north)).toEqual(true)
  expect(gb.yInbounds(south)).toEqual(true)
  expect(gb.yInbounds(south - 1e-10)).toEqual(false)

  expect(gb.inbounds(west, north + 1e-10)).toEqual(false)
  expect(gb.inbounds(east, north + 1e-10)).toEqual(false)
  expect(gb.inbounds(west, north)).toEqual(true)
  expect(gb.inbounds(east, north)).toEqual(true)

  expect(gb.inbounds(west, south)).toEqual(true)
  expect(gb.inbounds(east, south)).toEqual(true)
  expect(gb.inbounds(west, south - 1e-10)).toEqual(false)
  expect(gb.inbounds(east, south - 1e-10)).toEqual(false)

  expect(gb.inbounds(west - 1e-10, north)).toEqual(false)
  expect(gb.inbounds(east + 1e-10, north)).toEqual(false)
  expect(gb.inbounds(west - 1e-10, south)).toEqual(false)
  expect(gb.inbounds(east + 1e-10, south)).toEqual(false)
})

test('5: GeoBounds.snap(), snapX(), snapY()', () => {
  const gb = new GeoBounds(west, north, east, south, xdist, ydist)

  // xSpacing is 10 ...
  expect(gb.xSpacing()).toEqual(10)

  expect(gb.snapX(1500)).toEqual(1500)
  expect(gb.snapX(1505 - 1e-10)).toEqual(1500)
  expect(gb.snapX(1495)).toEqual(1500)

  expect(gb.snapX(1490)).toEqual(1490)
  expect(gb.snapX(1485)).toEqual(1490)
  expect(gb.snapX(1495 - 1e-10)).toEqual(1490)

  // ySpacing is 20 ...
  expect(gb.ySpacing()).toEqual(20)
  expect(gb.snapY(4500)).toEqual(4500)
  expect(gb.snapY(4510 - 1e-10)).toEqual(4500)

  expect(5000 - 20 * Math.round((5000 - 4500) / 20)).toEqual(4500)
  expect(gb.snapY(4510)).toEqual(4500)
  expect(gb.snapY(4510 + 1e-10)).toEqual(4520)

  expect(gb.snap(1504, 4510)).toEqual(new GeoCoord(1500, 4500))
})

test('6: GeoBounds.xInterval(), yInterval()', () => {
  const gb = new GeoBounds(west, north, east, south, xdist, ydist)

  // xSpacing is 10 ...
  expect(gb.xSpacing()).toEqual(10)

  expect(gb.xInterval(1500)).toEqual(50)
  expect(gb.xInterval(1505 - 1e-10)).toEqual(50)
  expect(gb.xInterval(1495)).toEqual(49)

  expect(gb.xInterval(1490)).toEqual(49)
  expect(gb.xInterval(1485)).toEqual(48)
  expect(gb.xInterval(1490 - 1e-10)).toEqual(48)

  // ySpacing is 20 ...
  expect(gb.ySpacing()).toEqual(20)
  expect(gb.yInterval(5000)).toEqual(0)
  expect(gb.yInterval(4980 + 1e-10)).toEqual(0)

  expect(gb.yInterval(4980)).toEqual(1)
  expect(gb.yInterval(4960 + 1e-10)).toEqual(1)

  expect(gb.yInterval(4500)).toEqual(25)
  expect(gb.yInterval(4480 + 1e-10)).toEqual(25)

  expect(gb.yInterval(5001)).toEqual(-1)
  expect(gb.yInterval(5020)).toEqual(-1)

  expect(gb.yInterval(1000)).toEqual(200)
})
