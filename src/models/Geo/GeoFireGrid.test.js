import { GeoFireGrid } from './GeoFireGrid.js'
import { FireStatus } from './FireStatus.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const xdist = 10
const ydist = 10

test('1: GeoServerGrid constructor and accessors', () => {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist)
  expect(gf.west()).toEqual(west)
  expect(gf.north()).toEqual(north)
  expect(gf.east()).toEqual(east)
  expect(gf.south()).toEqual(south)
  expect(gf.xSpacing()).toEqual(10)
  expect(gf.ySpacing()).toEqual(10)

  expect(gf.defaultValue()).toEqual(FireStatus.Unburned)
  expect(gf.guarded()).toEqual(true)

  expect(gf.cols()).toEqual(101)
  expect(gf.rows()).toEqual(101)
  expect(gf.cells()).toEqual(10201)
  expect(gf.data() instanceof Array).toEqual(true)
  expect(gf.data()).toHaveLength(10201)
  expect(gf.data()[1234]).toEqual(FireStatus.Unburned)

  for (let y = gf.north(); y <= gf.south(); y -= gf.ySpacing()) {
    for (let x = gf.west(); x <= gf.east(); x += gf.xSpacing()) {
      expect(gf.isBurnable(x, y)).toEqual(true)
      expect(gf.isUnburnable(x, y)).toEqual(false)
      expect(gf.isBurnedAt(x, y, 0)).toEqual(false)
    }
  }
})

test('2: FireGrid.setUnburnableCol(), setUnburnableRow(), isUnburnableColRow()', () => {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist)
    .setUnburnableCol(1250, 4250, 4750) // at x = 1250, y 4250 to 4750
    .setUnburnableRow(4750, 1250, 1750) // at y = 4750, x 1250 to 1750
  expect(gf.isUnburnable(1250, 4750)).toEqual(true) // upper left
  expect(gf.isUnburnable(1250, 4250)).toEqual(true) // lower left
  expect(gf.isUnburnable(1750, 4750)).toEqual(true) // upper right
  expect(gf.isUnburnable(1250, 4500)).toEqual(true) // middle vertical
  expect(gf.isUnburnable(1500, 4750)).toEqual(true) // middle horizontal
  expect(gf.isUnburnable(1510, 4740)).toEqual(false) // inside angle
  // console.log(gf.toString('UPDATED: Pre-Fire with Unburnable Col and Row'))
})

test('3: GeoFireGrid.period()', () => {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist)

  expect(gf.period().begins()).toEqual(0)
  expect(gf.period().ends()).toEqual(0)
  expect(gf.period().midpoint()).toEqual(0)
  expect(gf.period().number()).toEqual(0)

  gf.setUnburnableCol(1250, 4250, 4750) // at x = 1250, y 4250 to 4750
    .setUnburnableRow(4750, 1250, 1750) // at y = 4750, x 1250 to 1750
    .periodUpdate(10)
    .igniteAt(1500, 4500, 0)

  expect(gf.period().begins()).toEqual(0)
  expect(gf.period().ends()).toEqual(10)
  expect(gf.period().midpoint()).toEqual(5)
  expect(gf.period().number()).toEqual(1)
})

test('4: GeoFireGrid.ignite()', () => {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist)
    .setUnburnableCol(1250, 4250, 4750) // at x = 1250, y 4250 to 4750
    .setUnburnableRow(4750, 1250, 1750) // at y = 4750, x 1250 to 1750
    .periodUpdate(10)

  expect(gf.get(1500, 4500)).toEqual(FireStatus.Unburned)
  expect(gf.isUnburnedAt(1500, 4500, 0)).toEqual(true)

  gf.igniteAt(1500, 4500, 1)

  expect(gf.get(1500, 4500)).toEqual(1)
  expect(gf.status(1500, 4500)).toEqual(1)
  expect(gf.isBurnedAt(1500, 4500, 0)).toEqual(false)
  expect(gf.isBurnedAt(1500, 4500, 1)).toEqual(true)

  expect(gf.isBurnedAt(1510, 4500, 0)).toEqual(false)
  expect(gf.isBurnedAt(1510, 4500, 1)).toEqual(false)
  expect(gf.status(1510, 4500)).toEqual(FireStatus.Unburned)

  const ignPoints = gf.ignitionPointsAt(10)
  expect(ignPoints.size).toEqual(1)
  expect(gf.periodStats()).toEqual({
    period: 1,
    begins: 0,
    ends: 10,
    current: 1,
    previous: 0,
    unburned: 10099,
    unburnable: 101,
    ignited: 0,
    other: 0
  })
})
