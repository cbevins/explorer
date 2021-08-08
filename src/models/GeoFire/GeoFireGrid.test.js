import { GeoFireGrid } from './GeoFireGrid.js'
import { FireStatus } from './FireStatus.js'
import { FireInputProviderMock } from '../FireBehavior/FireInputProviderMock.js'

const west = 1000
const east = 2000
const north = 5000
const south = 4000
const xdist = 10
const ydist = 10
const fireInputProvider = new FireInputProviderMock()

test('1: GeoFireGrid constructor and accessors', () => {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)
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

test('2: GeoFireGrid.setUnburnableCol(), setUnburnableRow(), isUnburnable()', () => {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)
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
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)

  // Currently no period scheduled
  expect(gf.period().begins()).toEqual(0)
  expect(gf.period().ends()).toEqual(0)
  expect(gf.period().midpoint()).toEqual(0)
  expect(gf.period().number()).toEqual(0)

  gf.setUnburnableCol(1250, 4250, 4750) // at x = 1250, y 4250 to 4750
    .setUnburnableRow(4750, 1250, 1750) // at y = 4750, x 1250 to 1750

  // Schedule an ignition at 15 minutes
  gf.igniteAt(1500, 4500, 15)

  // Update the Period by 10 minutes
  gf.period().update(10)
  expect(gf.period().begins()).toEqual(0)
  expect(gf.period().ends()).toEqual(10)
  expect(gf.period().midpoint()).toEqual(5)
  expect(gf.period().number()).toEqual(1)

  // Should be no ignition points at this period
  expect(gf.ignitionPointsAt(10).size).toEqual(0)
  expect(gf.ignitionPointsAt(20).size).toEqual(1)
})

test('4: GeoFireGrid.ignite()', () => {
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)
    .setUnburnableCol(1250, 4250, 4750) // at x = 1250, y 4250 to 4750
    .setUnburnableRow(4750, 1250, 1750) // at y = 4750, x 1250 to 1750

  // Check the unburnable row and column indices
  expect(gf.xCol(1000)).toEqual(0)
  expect(gf.xCol(1009.999)).toEqual(0)
  expect(gf.xCol(1010)).toEqual(1)
  expect(gf.xCol(1250)).toEqual(25)
  expect(gf.xCol(1500)).toEqual(50)
  expect(gf.xCol(1750)).toEqual(75)
  expect(gf.xCol(2000)).toEqual(100)

  expect(gf.yRow(4000)).toEqual(100)
  expect(gf.yRow(4250)).toEqual(75)
  expect(gf.yRow(4490)).toEqual(51)
  expect(gf.yRow(4500)).toEqual(50)
  expect(gf.yRow(4750)).toEqual(25)
  expect(gf.yRow(5000)).toEqual(0)

  gf.period().update(10)
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

// eslint-disable-next-line no-unused-vars
const mockFire = {
  lwr: 3.575543332181236,
  backDist: 1.0258645045017885,
  backRos: 1.0258645045017885,
  flankDist: 7.189669573093315,
  flankRos: 7.189669573093315,
  headDist: 50.38808570081844,
  headRos: 50.38808570081844,
  heading: 135,
  headingUp: 0,
  length: 51.41395020532023,
  width: 14.37933914618663,
  input: {
    x: 1,
    y: 2,
    t: 3,
    fuelModel: '124',
    curedHerb: 0.778,
    dead1: 0.05,
    dead10: 0.07,
    dead100: 0.09,
    duration: 1,
    liveHerb: 0.5,
    liveStem: 1.5,
    slope: 0.25,
    aspect: 315,
    windFrom: 315,
    windSpeed: 880
  }
}

test('5: GeoFireGrid.burnForPeriod()', () => {
  console.log('Test started at --------------------------------------------------------------', Date.now())
  const gf = new GeoFireGrid(west, north, east, south, xdist, ydist, fireInputProvider)
    .setUnburnableCol(1250, 4250, 4750) // at x = 1250, y 4250 to 4750
    .setUnburnableRow(4750, 1250, 1750) // at y = 4750, x 1250 to 1750

  expect(gf.get(1500, 4500)).toEqual(FireStatus.Unburned)
  expect(gf.isUnburnedAt(1500, 4500, 0)).toEqual(true)

  // Ignite a single point at time 0
  gf.igniteAt(1500, 4500, 0)
  const ignPoints = gf.ignitionPointsAt(1)
  expect(ignPoints.size).toEqual(1)

  // start a new burning period
  gf.burnForPeriod(2)
  expect(gf.get(1510, 4500)).toEqual(1.596939267364341)
  expect(gf.status(1510, 4500)).toEqual(1.596939267364341)
  // ignPoints = gf.ignitionPointsAt(1)
  // expect(ignPoints.size).toEqual(1)
  for (let p = 1; p < 30; p++) {
    gf.burnForPeriod(2)
  }
})
